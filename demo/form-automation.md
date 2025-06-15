# Form Automation Demo

## Metadata

- id: form-automation
- author: Demo Team
- version: 1.0.0
- tags: forms, automation, data-entry

## Description

Demonstrates automated form filling with various input types and validation handling.

## Steps

```
navigate "/forms/contact"
description: Navigate to contact form
```

```
wait 1000
```

```
highlight "contact-form"
delay: 1500
description: Highlight the contact form
```

```
click "first-name"
description: Focus on first name field
```

```
type "Jane" in "first-name"
description: Enter first name
```

```
click "last-name"
```

```
type "Smith" in "last-name"  
description: Enter last name
```

```
click "email"
```

```
type "jane.smith@example.com" in "email"
description: Enter email address
```

```
click "phone"
```

```
type "+1 (555) 123-4567" in "phone"
description: Enter phone number
```

```
click "subject-dropdown"
description: Open subject dropdown
```

```
wait 300
```

```
click "subject-support"
description: Select Support option
```

```
click "message"
```

```
type "This is an automated demo message to show form filling capabilities." in "message"
description: Enter message text
```

```
click "priority-high"
description: Select high priority
```

```
click "subscribe-checkbox"
description: Check newsletter subscription
```

```
wait 500
```

```
highlight "submit-button"
delay: 1000
description: Highlight submit button
```

```
click "submit-button"
description: Submit the form
```

```
wait 2000
description: Wait for form submission
```

```
assert "success-notification"
description: Verify success notification appears
```