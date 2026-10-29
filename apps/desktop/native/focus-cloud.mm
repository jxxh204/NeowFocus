#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <CloudKit/CloudKit.h>
#import <Security/SecTask.h>
#include <node_api.h>
#include <string>
#include <memory>
#include <mutex>

static NSString *const containerID = @"iCloud.com.neowfocus.pomodorotimer";
static CKRecordID *RecordID() { return [[CKRecordID alloc] initWithRecordName:@"focus-state-v1"]; }
struct RequestState { std::mutex mutex; bool cancelled = false; __strong CKOperation *operation = nil; };
struct Job {
  napi_env env; napi_deferred deferred; napi_async_work work;
  std::string operation, payload, tag, result, error;
  bool hasTag = false;
};
static std::string UTF8(NSString *value) { return value ? std::string(value.UTF8String) : std::string(); }
static NSString *String(const std::string &value) { return [[NSString alloc] initWithBytes:value.data() length:value.size() encoding:NSUTF8StringEncoding]; }
static std::string JSON(id value) {
  NSData *data = [NSJSONSerialization dataWithJSONObject:value options:NSJSONWritingFragmentsAllowed error:nil];
  return data ? std::string((const char *)data.bytes, data.length) : "null";
}
static void Execute(napi_env, void *data) {
  Job *job = static_cast<Job *>(data);
  @autoreleasepool {
    CKContainer *container = [CKContainer containerWithIdentifier:containerID];
    CKDatabase *database = container.privateCloudDatabase;
    dispatch_semaphore_t wait = dispatch_semaphore_create(0);
    // Completion blocks retain their state even if the bounded wait times out.
    __block id output = nil;
    __block NSError *failure = nil;
    auto requestState = std::make_shared<RequestState>();
    if (job->operation == "account") {
      [container accountStatusWithCompletionHandler:^(CKAccountStatus status, NSError *error) {
        failure = error; output = status == CKAccountStatusAvailable ? @"available" : @"unavailable";
        dispatch_semaphore_signal(wait);
      }];
    } else if (job->operation == "subscribe") {
      CKQuerySubscription *subscription = [[CKQuerySubscription alloc] initWithRecordType:@"NeowFocusState" predicate:[NSPredicate predicateWithValue:YES] subscriptionID:@"focus-state-changes-v1" options:CKQuerySubscriptionOptionsFiresOnRecordCreation | CKQuerySubscriptionOptionsFiresOnRecordUpdate | CKQuerySubscriptionOptionsFiresOnRecordDeletion];
      CKNotificationInfo *info = [[CKNotificationInfo alloc] init];
      info.shouldSendContentAvailable = YES;
      subscription.notificationInfo = info;
      [database saveSubscription:subscription completionHandler:^(CKSubscription *saved, NSError *error) {
        failure = error; output = saved.subscriptionID;
        dispatch_semaphore_signal(wait);
      }];
    } else {
      NSString *payload = String(job->payload);
      NSString *expectedTag = job->hasTag ? String(job->tag) : nil;
      bool writing = job->operation == "write";
      [database fetchRecordWithID:RecordID() completionHandler:^(CKRecord *record, NSError *error) {
        if (error && error.code != CKErrorUnknownItem) { failure = error; dispatch_semaphore_signal(wait); return; }
        if (!writing) {
          output = @{ @"json": record[@"json"] ?: NSNull.null, @"changeTag": record.recordChangeTag ?: NSNull.null };
          dispatch_semaphore_signal(wait); return;
        }
        if ((record && (!expectedTag || ![record.recordChangeTag isEqualToString:expectedTag])) || (!record && expectedTag)) {
          failure = [NSError errorWithDomain:@"NeowFocus" code:1 userInfo:@{NSLocalizedDescriptionKey:@"CLOUD_CONFLICT"}];
          dispatch_semaphore_signal(wait); return;
        }
        CKRecord *next = record ?: [[CKRecord alloc] initWithRecordType:@"NeowFocusState" recordID:RecordID()];
        next[@"json"] = payload;
        CKModifyRecordsOperation *save = [[CKModifyRecordsOperation alloc] initWithRecordsToSave:@[next] recordIDsToDelete:nil];
        save.savePolicy = CKRecordSaveIfServerRecordUnchanged;
        save.atomic = YES;
        save.modifyRecordsCompletionBlock = ^(NSArray<CKRecord *> *saved, NSArray<CKRecordID *> *, NSError *saveError) {
          failure = saveError; output = saved.firstObject.recordChangeTag;
          dispatch_semaphore_signal(wait);
        };
        // Timeout and operation registration share one lock: a late fetch cannot
        // enqueue a write after the caller was already told the request failed.
        std::lock_guard<std::mutex> lock(requestState->mutex);
        if (requestState->cancelled) return;
        requestState->operation = save;
        [database addOperation:save];
      }];
    }
    if (dispatch_semaphore_wait(wait, dispatch_time(DISPATCH_TIME_NOW, 25 * NSEC_PER_SEC))) {
      std::lock_guard<std::mutex> lock(requestState->mutex);
      requestState->cancelled = true;
      [requestState->operation cancel]; job->error = "iCloud 응답이 늦어요. 연결 후 다시 시도해 주세요."; return;
    }
    if (failure) {
      BOOL conflict = failure.code == CKErrorServerRecordChanged;
      NSDictionary *partial = failure.userInfo[CKPartialErrorsByItemIDKey];
      for (NSError *item in partial.allValues) if (item.code == CKErrorServerRecordChanged) conflict = YES;
      job->error = conflict ? "CLOUD_CONFLICT" : UTF8(failure.localizedDescription);
    } else if (!output) job->error = "iCloud did not return a result";
    else job->result = JSON(output);
  }
}
static void Complete(napi_env env, napi_status, void *data) {
  Job *job = static_cast<Job *>(data);
  napi_value value;
  if (!job->error.empty()) {
    napi_value message;
    napi_create_string_utf8(env, job->error.c_str(), job->error.size(), &message);
    napi_create_error(env, nullptr, message, &value);
    napi_reject_deferred(env, job->deferred, value);
  } else {
    napi_create_string_utf8(env, job->result.c_str(), job->result.size(), &value);
    napi_resolve_deferred(env, job->deferred, value);
  }
  napi_delete_async_work(env, job->work); delete job;
}
static std::string Argument(napi_env env, napi_value value) {
  size_t size = 0;
  if (napi_get_value_string_utf8(env, value, nullptr, 0, &size) != napi_ok) return {};
  std::string text(size + 1, '\0');
  napi_get_value_string_utf8(env, value, text.data(), size + 1, &size); text.resize(size); return text;
}
static napi_value Request(napi_env env, napi_callback_info info) {
  size_t argc = 3; napi_value argv[3];
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
  if (argc < 1) { napi_throw_type_error(env, nullptr, "Missing operation"); return nullptr; }
  Job *job = new Job(); job->env = env; job->operation = Argument(env, argv[0]);
  if (job->operation != "account" && job->operation != "read" && job->operation != "write" && job->operation != "subscribe") {
    delete job; napi_throw_type_error(env, nullptr, "Invalid operation"); return nullptr;
  }
  if (argc > 1) job->payload = Argument(env, argv[1]);
  if (argc > 2) { napi_valuetype type; napi_typeof(env, argv[2], &type); job->hasTag = type == napi_string; if (job->hasTag) job->tag = Argument(env, argv[2]); }
  if (job->operation == "write" && (job->payload.empty() || job->payload.size() >= 900000)) {
    delete job; napi_throw_range_error(env, nullptr, "Cloud payload must be below 900 KB"); return nullptr;
  }
  napi_value promise, name;
  napi_create_promise(env, &job->deferred, &promise);
  napi_create_string_utf8(env, "NeowFocusCloudKit", NAPI_AUTO_LENGTH, &name);
  napi_create_async_work(env, nullptr, name, Execute, Complete, job, &job->work);
  napi_queue_async_work(env, job->work); return promise;
}
static napi_value Available(napi_env env, napi_callback_info) {
  SecTaskRef task = SecTaskCreateFromSelf(kCFAllocatorDefault);
  CFTypeRef entitlement = task ? SecTaskCopyValueForEntitlement(task, CFSTR("com.apple.developer.icloud-container-identifiers"), nullptr) : nullptr;
  bool enabled = entitlement && CFGetTypeID(entitlement) == CFArrayGetTypeID()
    && CFArrayContainsValue((CFArrayRef)entitlement, CFRangeMake(0, CFArrayGetCount((CFArrayRef)entitlement)), (__bridge CFStringRef)containerID);
  if (entitlement) CFRelease(entitlement); if (task) CFRelease(task);
  napi_value result; napi_get_boolean(env, enabled, &result); return result;
}
static napi_value Feedback(napi_env env, napi_callback_info) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSBeep();
    [[NSHapticFeedbackManager defaultPerformer] performFeedbackPattern:NSHapticFeedbackPatternAlignment performanceTime:NSHapticFeedbackPerformanceTimeNow];
  });
  napi_value result; napi_get_undefined(env, &result); return result;
}
static napi_value Init(napi_env env, napi_value exports) {
  napi_value feedback; napi_create_function(env, "feedback", NAPI_AUTO_LENGTH, Feedback, nullptr, &feedback);
  napi_set_named_property(env, exports, "feedback", feedback);
  napi_value request; napi_create_function(env, "request", NAPI_AUTO_LENGTH, Request, nullptr, &request);
  napi_set_named_property(env, exports, "request", request);
  napi_value available; napi_create_function(env, "available", NAPI_AUTO_LENGTH, Available, nullptr, &available);
  napi_set_named_property(env, exports, "available", available); return exports;
}
NAPI_MODULE(neowfocus_cloud, Init)
