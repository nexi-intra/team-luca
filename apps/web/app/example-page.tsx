"use client";

import { useBreadcrumbTitle } from "@/hooks/useBreadcrumbTitle";

export default function ExamplePage() {
  // Set a custom title for this page's breadcrumb
  useBreadcrumbTitle("Custom Page Title");

  return (
    <div>
      <h1>Example Page</h1>
      <p>
        This page will show &quot;Custom Page Title&quot; in the breadcrumb
        instead of the auto-generated title.
      </p>
    </div>
  );
}
