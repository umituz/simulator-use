# Simulator-Use

**Browser-use for iOS simulators** - Control iOS simulators from your terminal with simple commands.

## Features

- 📱 List and manage iOS simulators
- 🚀 Boot and shutdown simulators
- 📸 Take screenshots
- 🎯 Launch and terminate apps
- 🌐 Open URLs in Safari
- 👆 UI automation - tap and swipe gestures (via test steps)
- 🧪 Automated test runs with organized results
- ⚡ Fast and easy to use

## Installation

```bash
npm install -g @umituz/simulator-use
```

Or use it directly without installing:

```bash
npx @umituz/simulator-use list
```

## Usage

```bash
# List all available simulators
simulator-use list

# Boot a simulator (by name or UDID)
simulator-use boot "iPhone 13 Pro Max"

# Show current status
simulator-use status

# Take a screenshot
simulator-use screenshot ~/Desktop/screenshot.png

# Launch an app
simulator-use launch com.example.myapp

# Terminate an app
simulator-use terminate com.example.myapp

# Open a URL in Safari
simulator-use openurl https://github.com

# Run automated tests
simulator-use test --name "Login flow" --steps steps.json

# Shutdown a simulator
simulator-use shutdown "iPhone 13 Pro Max"
```

## Requirements

- macOS
- Xcode Command Line Tools
- iOS Simulators (installed via Xcode)
- Node.js 18+

## Commands

| Command | Description |
|---------|-------------|
| `list` | List all available iOS simulators |
| `boot <device>` | Boot an iOS simulator (name or UDID) |
| `shutdown <device>` | Shutdown an iOS simulator |
| `screenshot <path>` | Take a screenshot |
| `launch <bundleId>` | Launch an app |
| `terminate <bundleId>` | Terminate a running app |
| `openurl <url>` | Open a URL in Safari |
| `status` | Show current simulator status |
| `test` | Run automated tests with organized results |

### Test command options

```bash
simulator-use test [options]

  --name <testName>   Test name
  --device <device>   Target device
  --boot              Boot device before test
  --auto-fix          Enable automatic error fixing
  --steps <file>      Test steps JSON file
  --crud <file>       CRUD test data JSON file
```

Example steps file (`steps.json`):

```json
{
  "steps": [
    { "action": "screenshot", "name": "initial_state" },
    { "action": "openurl", "url": "https://github.com", "wait": 3000 },
    { "action": "tap", "x": 200, "y": 300 },
    { "action": "swipe", "x1": 200, "y1": 500, "x2": 200, "y2": 200 },
    { "action": "screenshot", "name": "final_state" }
  ]
}
```

## Programmatic API

You can also use it as a library:

```typescript
import { Simctl } from '@umituz/simulator-use/utils';

const devices = await Simctl.listDevices();
const booted = await Simctl.getBootedDevice();

await Simctl.launch('com.example.myapp');
await Simctl.screenshot('/tmp/screenshot.png');
await Simctl.tap(200, 300);
await Simctl.swipe(200, 500, 200, 200);
```

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

# 5. Launch your app
simulator-use launch com.example.myapp

# 6. Wait and take another screenshot
sleep 3
simulator-use screenshot after.png
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
      - uses: actions/checkout@v4

      - name: Install simulator-use
        run: npm install -g @umituz/simulator-use

      - name: Boot Simulator
        run: simulator-use boot "iPhone 15"

      - name: Run App Tests
        run: |
          simulator-use launch com.example.myapp
          sleep 5
          simulator-use screenshot test-results.png

      - name: Shutdown
        run: simulator-use shutdown "iPhone 15"
```

## Development

```bash
# Clone the repository
git clone https://github.com/umituz/simulator-use.git
cd simulator-use

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
