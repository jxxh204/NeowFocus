#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get version type from command line argument (default: patch)
const versionType = process.argv[2] || 'patch';

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  default:
    console.error(`❌ Invalid version type: ${versionType}`);
    console.error('Usage: node increment-version.js [major|minor|patch]');
    process.exit(1);
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version bumped (${versionType}): ${major}.${minor}.${patch} → ${newVersion}`);
