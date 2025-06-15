# Feature Tour

## Metadata

- id: feature-tour
- author: Demo Team
- version: 1.0.0
- tags: tour, features, onboarding

## Description

A comprehensive tour of the main features in the application, perfect for onboarding new users.

## Steps

```
wait 1000
description: Let the page fully load
```

```
highlight "main-navigation"
delay: 2000
description: Show the main navigation menu
```

```
hover "features-menu"
delay: 1500
description: Hover over features menu to show dropdown
```

```
click "features-menu"
description: Open features section
```

```
scroll "feature-list"
description: Scroll to feature list
```

```
highlight "feature-1"
delay: 2000
description: Highlight first feature
```

```
click "feature-1-details"
description: Open feature details
```

```
wait 1000
```

```
highlight "feature-description"
delay: 3000
description: Show feature description
```

```
click "try-it-button"
description: Try the feature
```

```
wait 500
```

```
type "Sample text for demo" in "demo-input"
description: Enter demo text
```

```
click "demo-submit"
description: Submit demo
```

```
wait 1000
```

```
highlight "demo-result"
delay: 2000
description: Show the result
```

```
click "back-button"
description: Go back to features list
```