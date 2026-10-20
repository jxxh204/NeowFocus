Pod::Spec.new do |s|
  s.name = 'NeowFocusNative'
  s.version = '0.1.0'
  s.summary = 'NeowFocus Apple integrations'
  s.description = 'Shared focus state, Live Activities, widgets, and CloudKit.'
  s.license = { :type => 'MIT' }
  s.author = 'NeowFocus'
  s.homepage = 'https://github.com/JxxH204/NeowFocus'
  s.platforms = { :ios => '16.4' }
  s.source = { :path => '.' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.resource_bundles = { 'NeowFocusNative_privacy' => ['PrivacyInfo.xcprivacy'] }
  s.frameworks = 'ActivityKit', 'WidgetKit', 'CloudKit', 'SwiftUI'
  s.swift_version = '5.0'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
