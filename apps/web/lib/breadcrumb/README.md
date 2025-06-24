# Breadcrumb Navigation System

A flexible breadcrumb navigation system that automatically generates breadcrumbs based on the current route.

## Features

- Automatic breadcrumb generation from URL paths
- Home icon for the root page
- Custom page titles support
- Skip display on home page (configurable)
- Accessible navigation with ARIA labels
- TypeScript support

## Usage

### Basic Usage

The breadcrumb is automatically included in layouts. It will:

- Show a home icon for the root
- Generate breadcrumbs from the URL path
- Use predefined page titles from `route-metadata.ts`
- Automatically hide on the home page

```tsx
import { BreadcrumbContainer } from "@/components/navigation/BreadcrumbContainer";

export default function Layout({ children }) {
  return (
    <div>
      <header>...</header>
      <BreadcrumbContainer />
      <main>{children}</main>
    </div>
  );
}
```

### Custom Page Titles

Use the `useBreadcrumbTitle` hook to set custom titles:

```tsx
"use client";

import { useBreadcrumbTitle } from "@/hooks/useBreadcrumbTitle";

export default function ProductPage({ product }) {
  // This will show the product name in the breadcrumb
  useBreadcrumbTitle(product.name);

  return <div>...</div>;
}
```

### Adding Route Metadata

Edit `/lib/breadcrumb/route-metadata.ts` to add page titles:

```ts
export const routeMetadata: RouteMetadata = {
  "/": "Home",
  "/products": "Products",
  "/products/[id]": "Product Details", // Dynamic routes
  "/about": "About Us",
};
```

### Custom Breadcrumb Items

For complex scenarios, add custom breadcrumb items:

```tsx
const { addCustomBreadcrumb } = useBreadcrumb();

useEffect(() => {
  addCustomBreadcrumb({
    label: "Category Name",
    href: "/products/category-slug",
  });
}, []);
```

## Styling

The breadcrumb uses Tailwind CSS classes and can be customized:

```tsx
<Breadcrumb className="my-custom-class" />
```

Or style the container:

```tsx
<BreadcrumbContainer className="bg-blue-50 border-b-2" />
```

## Examples

### Home Page

- Not displayed (unless `showOnHomePage={true}`)

### /magicbutton

- 🏠 > Magic Button

### /magicbutton/auth-demo

- 🏠 > Magic Button > Authentication Demo

### /products/123 (with custom title)

- 🏠 > Products > iPhone 15 Pro
