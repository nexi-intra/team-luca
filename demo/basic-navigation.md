# Basic Navigation Demo

## Metadata

- id: basic-navigation
- author: Demo Team
- version: 1.0.0
- tags: navigation, basics

## Description

This demo shows basic navigation through the application, including clicking buttons, filling forms, and navigating between pages.

## Steps

```
wait 1000
description: Wait for page to load
```

```
highlight "welcome-message"
delay: 2000
description: Highlight the welcome message
```

```
click "get-started-button"
description: Click the Get Started button
```

```
wait 500
```

```
type "John Doe" in "name-input"
description: Enter name in the input field
```

```
type "john.doe@example.com" in "email-input"
description: Enter email address
```

```
click "submit-button"
description: Submit the form
```

```
wait 1000
description: Wait for submission to complete
```

```
assert "success-message"
description: Verify success message appears
```
