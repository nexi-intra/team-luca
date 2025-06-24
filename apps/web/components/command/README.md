# Command Palette

A powerful command palette system that respects feature ring access levels, providing quick access to actions and navigation.

## Features

- **Ring-Based Access**: Only shows commands accessible to the user's current ring level
- **Keyboard Shortcuts**: Global shortcuts for quick actions
- **Search & Filter**: Fast fuzzy search across all available commands
- **Categories**: Organized commands by category
- **Extensible**: Easy to add custom commands

## Usage

### Opening the Command Palette

- Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
- Click the command button in the header (Ring 1+ users only)

### Default Commands by Ring

#### Ring 5 (Public)
- Home navigation
- Magic Button demo
- Search

#### Ring 4 (Basic User)
- Profile management
- Settings
- Dashboard

#### Ring 3 (Power User)
- Analytics
- API Documentation
- Developer Tools

#### Ring 2 (Admin)
- User Management
- System Configuration
- Security Settings

#### Ring 1 (Super Admin)
- Database Administration
- API Key Management
- System Console

### Adding Custom Commands

```tsx
import { useCommandPalette } from '@/lib/command/context';
import { FileText } from 'lucide-react';

function MyComponent() {
  const { registerAction } = useCommandPalette();

  useEffect(() => {
    registerAction({
      id: 'my-custom-action',
      title: 'My Custom Action',
      description: 'Does something special',
      icon: FileText,
      shortcut: 'cmd+shift+m',
      requiredRing: 3, // Only Ring 3+ users can see this
      category: 'Custom',
      action: () => {
        console.log('Custom action executed!');
      },
      keywords: ['custom', 'special']
    });
  }, [registerAction]);
}
```

### Command Structure

```typescript
interface CommandAction {
  id: string;              // Unique identifier
  title: string;           // Display name
  description?: string;    // Optional description
  icon?: LucideIcon;      // Optional icon
  shortcut?: string;      // Keyboard shortcut (e.g., 'cmd+k')
  requiredRing: number;   // Minimum ring level required
  category?: string;      // Category for grouping
  action: () => void;     // Function to execute
  keywords?: string[];    // Search keywords
}
```

## Keyboard Shortcuts

- `⌘K` / `Ctrl+K` - Open command palette
- `⌘H` / `Ctrl+H` - Go to Home
- `⌘M` / `Ctrl+M` - Magic Button Demo
- `⌘P` / `Ctrl+P` - View Profile
- `⌘,` / `Ctrl+,` - Settings
- `⌘D` / `Ctrl+D` - API Documentation
- `⌘⇧C` / `Ctrl+Shift+C` - System Console (Ring 1)

## Security

The command palette automatically filters available commands based on the user's feature ring access level. Users cannot see or execute commands that require a higher ring level than they possess.