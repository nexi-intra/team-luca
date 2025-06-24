export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

export interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  setPageTitle: (title: string) => void;
  addCustomBreadcrumb: (item: BreadcrumbItem) => void;
  clearCustomBreadcrumbs: () => void;
}

export interface RouteMetadata {
  [path: string]: string; // path -> title mapping
}
