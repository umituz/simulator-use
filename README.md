# Simulator-Use

**Browser-use for iOS simulators** - Control iOS simulators from your terminal with simple commands.

## Features

- 📱 List and manage iOS simulators
- 🚀 Boot and shutdown simulators
- 📸 Take screenshots
- 🎯 Launch and terminate apps
- 🌐 Open URLs in Safari
- ⚡ Fast and easy to use

## Installation

```bash
cd /Users/umituz/Desktop/github/umituz/apps/startups/simulator-use
npm install
npm run build
npm link
```

## Usage

```bash
# List all available simulators
simulator-use list

# Boot a simulator
simulator-use boot "iPhone 13 Pro Max"

# Show current status
simulator-use status

# Take a screenshot
simulator-use screenshot ~/Desktop/screenshot.png

# Launch an app
simulator-use launch com.umituz.aimusic

# Terminate an app
simulator-use terminate com.umituz.aimusic

# Open a URL in Safari
simulator-use openurl https://github.com

# Shutdown a simulator
simulator-use shutdown "iPhone 13 Pro Max"
```

## Requirements

- macOS
- Xcode Command Line Tools
- iOS Simulators (installed via Xcode)

## Commands

| Command | Description |
|---------|-------------|
| `list` | List all available iOS simulators |
| `boot <device>` | Boot an iOS simulator |
| `shutdown <device>` | Shutdown an iOS simulator |
| `screenshot <path>` | Take a screenshot |
| `launch <bundleId>` | Launch an app |
| `terminate <bundleId>` | Terminate a running app |
| `openurl <url>` | Open a URL in Safari |
| `status` | Show current simulator status |

## Examples

### Basic Workflow

```bash
# 1. List available simulators
simulator-use list

# 2. Boot your device
simulator-use boot "iPhone 13 Pro Max"

# 3. Check status
simulator-use status

# 4. Take a screenshot
simulator-use screenshot before.png

# 5. Launch Melodia app
simulator-use launch com.umituz.aimusic

# 6. Wait and take another screenshot
sleep 3
simulator-use screenshot after.png
```

### Development Workflow

```bash
# Boot simulator
simulator-use boot "iPhone 13 Pro Max"

# Launch your app
simulator-use launch com.umituz.aimusic

# Take screenshots for testing
simulator-use screenshot test1.png

# Terminate when done
simulator-use terminate com.umituz.aimusic
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Link globally for testing
npm link
```

## How It Works

Simulator-use wraps Apple's `xcrun simctl` command-line tool and provides a more user-friendly interface with colored output and better error handling.

## License

MIT

## Author

@umituz
