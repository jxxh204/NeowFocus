#!/bin/bash

# Build Mac App Store version with electron-builder (without installer)
echo "Building Mac App Store app..."
CSC_LINK=./certificates/combined-certificates.p12 CSC_KEY_PASSWORD="" npx electron-vite build
npx electron-builder --mac mas --dir

# Create installer package manually
echo "Creating installer package..."
cd dist/mas-arm64
productbuild --component NeowFocus.app /Applications --sign "5E3159F0429DB49B7C3761C9081A4B1F1E72A70C" ../../dist/NeowFocus-mas.pkg
cd ../..

echo "Build complete! Installer package created at dist/NeowFocus-mas.pkg"