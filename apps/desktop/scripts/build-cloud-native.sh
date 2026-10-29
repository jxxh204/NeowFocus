#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(uname -s)" != Darwin ]]; then echo 'CloudKit native build requires macOS.' >&2; exit 1; fi
# Set NODE_HEADERS to any Node-API headers directory. Node-API does not bind Electron's V8 ABI.
if [[ -z "${NODE_HEADERS:-}" ]]; then
  for candidate in "$HOME"/Library/Caches/node-gyp/*/include/node /opt/homebrew/include/node /usr/local/include/node; do
    if [[ -f "$candidate/node_api.h" ]]; then NODE_HEADERS="$candidate"; break; fi
  done
fi
if [[ ! -f "${NODE_HEADERS:-}/node_api.h" ]]; then echo 'Set NODE_HEADERS to a directory containing node_api.h.' >&2; exit 1; fi
mkdir -p build/native
for arch in arm64 x86_64; do
  xcrun clang++ native/focus-cloud.mm -std=c++17 -fobjc-arc -shared -undefined dynamic_lookup \
    -I "$NODE_HEADERS" -arch "$arch" -mmacosx-version-min=11.0 -framework AppKit -framework Foundation -framework CloudKit -framework Security \
    -o "build/native/focus-cloud-$arch.node"
done
xcrun lipo -create build/native/focus-cloud-arm64.node build/native/focus-cloud-x86_64.node -output build/native/focus-cloud.node
