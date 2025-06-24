# Demo Scripts

This folder contains demo scripts written in markdown format that can be used to automate UI interactions.

## Script Format

Demo scripts are written in markdown with the following structure:

```markdown
# Script Title

## Metadata

- id: unique-script-id
- author: Author Name
- version: 1.0.0
- tags: comma, separated, tags

## Description

Brief description of what the demo shows

## Steps
```

action "target"
property: value

```

```

## Available Actions

- **click** - Click an element
- **type** - Type text into an input
- **wait** - Wait for specified milliseconds
- **navigate** - Navigate to a URL or path
- **assert** - Assert element exists
- **highlight** - Highlight an element
- **scroll** - Scroll element into view
- **hover** - Hover over element

## Usage

### In Components

```tsx
import { DemoElement } from "@/components/demo";

// Wrap any element to make it demo-aware
<DemoElement id="my-button">
  <Button>Click Me</Button>
</DemoElement>;
```

### Demo Controller

```tsx
import { DemoController } from "@/components/demo";

// Add the controller to your page
<DemoController />;
```

### Demo Recorder

```tsx
import { DemoRecorder } from "@/components/demo";

// Add the recorder to create new scripts
<DemoRecorder />;
```

## Creating New Scripts

1. Create a new `.md` file in this folder
2. Follow the format above
3. Use unique IDs for demo elements
4. Test your script with the DemoController

## Example Scripts

- `basic-navigation.md` - Simple navigation demo
- `feature-tour.md` - Comprehensive feature tour
- `form-automation.md` - Form filling automation
