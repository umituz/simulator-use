# Simulator-Use - iOS Simulator Automation Skill

## Overview

**Simulator-use** is browser-use for iOS simulators - A powerful CLI tool for controlling iOS simulators from your terminal with simple commands.

## What This Skill Does

Automates iOS simulator operations:

- ✅ **List & Manage Simulators** - Discover and control iOS simulators
- ✅ **Boot & Shutdown** - Start/stop simulators programmatically
- ✅ **Screenshot Capture** - Take screenshots for testing/documentation
- ✅ **App Launch/Terminate** - Control app lifecycle
- ✅ **URL Navigation** - Open URLs in Safari
- ✅ **Device Status** - Check simulator state
- ✅ **Colored Output** - Beautiful terminal UI with emoji indicators
- ✅ **Error Handling** - Graceful error messages

## When to Use This Skill

Use this skill when you want to:

1. **Automate iOS Testing** - Run app tests in simulators
2. **Take Screenshots** - Capture app states for documentation
3. **CI/CD Integration** - Automated testing pipelines
4. **App Development** - Quick simulator control during dev
5. **Demo Recording** - Capture app screenshots for presentations
6. **Multi-Device Testing** - Test across different simulator sizes
7. **Debug Session Automation** - Automate repetitive simulator tasks

## Quick Start

### Installation

```bash
cd /Users/umituz/Desktop/github/umituz/apps/startups/simulator-use
npm install
npm run build
npm link
```

### Basic Usage

```bash
# List available simulators
simulator-use list

# Boot a simulator
simulator-use boot "iPhone 13 Pro Max"

# Check status
simulator-use status

# Take a screenshot
simulator-use screenshot ~/Desktop/test.png

# Launch an app
simulator-use launch com.umituz.aimusic

# Terminate an app
simulator-use terminate com.umituz.aimusic

# Open URL in Safari
simulator-use openurl https://umituz.com

# Shutdown simulator
simulator-use shutdown "iPhone 13 Pro Max"
```

## Command Reference

### list
**List all available iOS simulators**

```bash
simulator-use list
```

**Output:**
```
Available iOS Simulators
ℹ️  iOS 26.3 --
  🟢 iPhone 13 Pro Max (7AC1C09A...)  # Booted
  ⚫ iPad Pro 12.9-inch (59E8E911...) # Shutdown
```

### boot
**Boot an iOS simulator**

```bash
simulator-use boot "iPhone 13 Pro Max"
simulator-use boot "7AC1C09A-9A89-4C44-BF24-67A62B98A9ED"  # UDID also works
```

### shutdown
**Shutdown an iOS simulator**

```bash
simulator-use shutdown "iPhone 13 Pro Max"
```

### status
**Show current simulator status**

```bash
simulator-use status
```

**Output:**
```
iOS Simulator Status
📱 Device: iPhone 13 Pro Max
ℹ️  UDID: 7AC1C09A-9A89-4C44-BF24-67A62B98A9ED
ℹ️  Runtime: iOS 26.3 --
ℹ️  State: Booted

✅ Simulator is running
```

### screenshot
**Take a screenshot of the booted simulator**

```bash
simulator-use screenshot ~/Desktop/screenshot.png
simulator-use screenshot ./screenshots/test-1.png
```

### launch
**Launch an app on the simulator**

```bash
simulator-use launch com.umituz.aimusic
simulator-use launch com.apple.mobilesafari
```

### terminate
**Terminate a running app**

```bash
simulator-use terminate com.umituz.aimusic
```

### openurl
**Open a URL in Safari**

```bash
simulator-use openurl https://github.com
simulator-use openurl http://192.168.1.12:8080/  # Local dev server
```

## Workflow Examples

### Development Workflow

```bash
# 1. Boot simulator
simulator-use boot "iPhone 13 Pro Max"

# 2. Launch your app
simulator-use launch com.umituz.aimusic

# 3. Take screenshots for testing
simulator-use screenshot before-tap.png

# 4. Test navigation
sleep 2
simulator-use screenshot after-tap.png

# 5. Terminate when done
simulator-use terminate com.umituz.aimusic
```

### Local Web Testing

```bash
# 1. Start your local dev server
cd web-melodia && npm run dev &

# 2. Boot simulator
simulator-use boot "iPhone 13 Pro Max"

# 3. Open local site
simulator-use openurl http://192.168.1.12:8080/

# 4. Take screenshots
sleep 5
simulator-use screenshot web-app-test.png
```

### Screenshot Automation

```bash
#!/bin/bash
# screenshot-test.sh

DEVICES=("iPhone 13 Pro Max" "iPad Pro 12.9-inch")

for device in "${DEVICES[@]}"; do
  echo "Testing on $device"

  # Boot
  simulator-use boot "$device"

  # Launch app
  simulator-use launch com.umituz.aimusic

  # Wait and capture
  sleep 3
  simulator-use screenshot "${device// /-}-launch.png"

  # Cleanup
  simulator-use terminate com.umituz.aimusic
  simulator-use shutdown "$device"
done
```

### CI/CD Integration

```yaml
# .github/workflows/ios-test.yml
name: iOS Simulator Test

on: [push]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Simulator-Use
        run: |
          cd tools/simulator-use
          npm install
          npm run build
          npm link

      - name: Boot Simulator
        run: simulator-use boot "iPhone 13 Pro Max"

      - name: Run App Tests
        run: |
          simulator-use launch com.umituz.aimusic
          sleep 5
          simulator-use screenshot test-results.png

      - name: Shutdown
        run: simulator-use shutdown "iPhone 13 Pro Max"
```

## Features

### Colored Terminal Output
- 🟢 Green for booted devices
- ⚫ Black for shutdown devices
- ✅ Success messages
- ❌ Error messages
- ⚠️  Warnings
- ℹ️  Info messages
- 📱 Device indicators

### Error Handling
- Graceful error messages
- Helpful hints for common errors
- Exit codes for scripting
- Device not found suggestions

### Automatic Device Detection
- Finds booted simulators automatically
- Uses first booted device as default
- Supports device name or UDID
- Lists all available devices

## System Requirements

- **macOS** (xcrun simctl is macOS only)
- **Xcode Command Line Tools**
- **iOS Simulators** (installed via Xcode)
- **Node.js 18+**

## Development

### Project Structure

```
simulator-use/
├── src/
│   ├── index.ts              # Main entry point
│   ├── cli.ts                # Commander initialization
│   ├── commands/             # Command implementations
│   │   ├── list.ts
│   │   ├── boot.ts
│   │   ├── shutdown.ts
│   │   ├── screenshot.ts
│   │   ├── launch.ts
│   │   ├── terminate.ts
│   │   ├── openurl.ts
│   │   └── status.ts
│   ├── utils/
│   │   ├── simctl.ts         # xcrun simctl wrapper
│   │   └── logger.ts         # Colored console output
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── bin/
│   └── simulator-use         # Executable
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build    # Compile TypeScript
npm run dev      # Watch mode
npm link         # Link globally
```

### Testing

```bash
# Manual test
simulator-use list
simulator-use boot "iPhone 13 Pro Max"
simulator-use status
simulator-use screenshot ~/Desktop/test.png
simulator-use launch com.umituz.aimusic
```

## Best Practices

1. **Use Device Names** - More readable than UDIDs
2. **Check Status First** - Verify simulator is booted
3. **Absolute Paths** - For screenshots
4. **Wait After Launch** - Apps need time to load
5. **Cleanup** - Shutdown simulators when done
6. **Error Handling** - Check exit codes in scripts

## Troubleshooting

### "No booted simulator found"
```bash
# Boot a simulator first
simulator-use boot "iPhone 13 Pro Max"
```

### "Device not found"
```bash
# List available devices
simulator-use list

# Use exact device name or UDID
```

### "Screenshot failed"
```bash
# Check write permissions
ls -la ~/Desktop/

# Use absolute path
simulator-use screenshot /tmp/test.png
```

### Build Errors
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

## Limitations

- **macOS Only** - xcrun simctl requires macOS
- **Xcode Required** - Must have Xcode installed
- **No UI Automation** - No tap/swipe in Phase 1 (planned for Phase 2)
- **Single Device** - Commands target first booted device by default

## Future Features (Phase 2)

- 🎯 **Tap Gestures** - Tap at coordinates
- 👆 **Swipe Gestures** - Swipe directions
- ⌨️ **Text Input** - Type text into focused elements
- ⏱️ **Wait Commands** - Wait for elements/conditions
- 📝 **Record/Playback** - Script automation
- 🎛️ **Device Profiles** - Saved configurations

## License

MIT

## Author

@umituz

## Related Tools

- **browser-use** - Browser automation for web
- **xcrun simctl** - Apple's native simulator CLI
- **appium** - Cross-platform mobile automation
- **detox** - React Native E2E testing
