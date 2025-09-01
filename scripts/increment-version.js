#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Parse current version (remove build number if exists)
const currentVersion = packageJson.version
const versionParts = currentVersion.split('+')
const baseVersion = versionParts[0]
const semverParts = baseVersion.split('.')

// Get command line arguments
const args = process.argv.slice(2)
const incrementType = args[0] || 'patch' // 'major', 'minor', or 'patch' (default)

let major = parseInt(semverParts[0])
let minor = parseInt(semverParts[1])
let patch = parseInt(semverParts[2])

// Increment based on type
switch (incrementType) {
  case 'major':
    major++
    minor = 0
    patch = 0
    break
  case 'minor':
    minor++
    patch = 0
    break
  case 'patch':
  default:
    patch++
    break
}

// Create new version (without build number)
const newVersion = `${major}.${minor}.${patch}`

// Update package.json
packageJson.version = newVersion
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`)