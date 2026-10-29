#!/usr/bin/env python3
"""Reject a release archive containing Screen Time frameworks or permissions."""
import json
import plistlib
import re
import subprocess
import sys
from pathlib import Path

FORBIDDEN = ("FamilyControls", "ManagedSettings", "DeviceActivity")
MACHO_MAGIC = {
    b"\xfe\xed\xfa\xce", b"\xce\xfa\xed\xfe", b"\xfe\xed\xfa\xcf",
    b"\xcf\xfa\xed\xfe", b"\xca\xfe\xba\xbe", b"\xbe\xba\xfe\xca",
    b"\xca\xfe\xba\xbf", b"\xbf\xba\xfe\xca",
}


def run(*args):
    return subprocess.run(args, capture_output=True, check=True).stdout


def verify(archive):
    apps = list((archive / "Products/Applications").glob("*.app"))
    if len(apps) != 1:
        raise ValueError("Expected one application in the archive")
    app = apps[0]
    bundles = [app, *app.glob("PlugIns/*.appex")]
    issues, checked, binaries = [], [], []
    for bundle in bundles:
        info = plistlib.loads((bundle / "Info.plist").read_bytes())
        # Modern Xcode archives may contain DER entitlements without an XML slot.
        entitlement_data = run("codesign", "-d", "--entitlements", "-", str(bundle)).decode()
        if "[Dict]" not in entitlement_data:
            raise ValueError(f"Could not inspect signed entitlements: {bundle.name}")
        entitlements = re.findall(r"\[Key\] (\S+)", entitlement_data)
        if any("family-controls" in key for key in entitlements):
            issues.append(f"{bundle.name}: Family Controls entitlement")
        point = info.get("NSExtension", {}).get("NSExtensionPointIdentifier", "")
        if "deviceactivity" in point:
            issues.append(f"{bundle.name}: device activity extension")
        if "NeowFocusBlockingEnabled" in info:
            issues.append(f"{bundle.name}: legacy blocking flag")
        binary = bundle / info["CFBundleExecutable"]
        data = binary.read_bytes()
        for module in FORBIDDEN:
            if module.encode() in data:
                issues.append(f"{bundle.name}: binary references {module}")
        checked.append({"bundle": bundle.name, "version": info["CFBundleShortVersionString"],
                        "build": info["CFBundleVersion"], "entitlementKeys": sorted(entitlements)})
    for path in app.rglob("*"):
        if not path.is_file() or path.is_symlink():
            continue
        with path.open("rb") as source:
            if source.read(4) not in MACHO_MAGIC:
                continue
        dependencies = run("xcrun", "otool", "-L", str(path)).decode()
        for module in FORBIDDEN:
            if f"/{module}.framework/" in dependencies:
                issues.append(f"{path.relative_to(app)}: links {module}")
        binaries.append(str(path.relative_to(app)))
    try:
        run("codesign", "--verify", "--deep", "--strict", str(app))
    except subprocess.CalledProcessError as error:
        issues.append("Signature verification failed: " + error.stderr.decode().strip())
    return {"archive": str(archive.resolve()), "passed": not issues, "bundles": checked,
            "scannedBinaries": binaries, "issues": issues}


if __name__ == "__main__":
    report = verify(Path(sys.argv[1]))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    sys.exit(0 if report["passed"] else 1)
