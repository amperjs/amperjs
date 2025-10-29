// Single source of truth for all link test cases
export default [
  // Static routes
  {
    name: "about",
    params: [],
    id: "link-about",
    href: "/about",
    label: "About",
  },
  {
    name: "blog/posts",
    params: [],
    id: "link-blog-posts",
    href: "/blog/posts",
    label: "Blog Posts",
  },
  {
    name: "blog/index.html",
    params: [],
    id: "link-blog-index",
    href: "/blog/index.html",
    label: "Blog Pages",
  },

  // Required parameters
  {
    name: "users/[id]",
    params: ["123"],
    id: "link-users-123",
    href: "/users/123",
    label: "User 123",
  },
  {
    name: "users/[id]",
    params: ["john-doe"],
    id: "link-users-john",
    href: "/users/john-doe",
    label: "User John Doe",
  },
  {
    name: "posts/[userId]/comments/[commentId]",
    params: ["456", "789"],
    id: "link-post-comment",
    href: "/posts/456/comments/789",
    label: "Post Comment",
  },

  // Optional parameters - without
  {
    name: "products/[[category]]",
    params: [],
    id: "link-products-all",
    href: "/products",
    label: "All Products",
  },
  {
    name: "search/[[query]]/[[page]]",
    params: [],
    id: "link-search-empty",
    href: "/search",
    label: "Search",
  },

  // Optional parameters - with
  {
    name: "products/[[category]]",
    params: ["electronics"],
    id: "link-products-electronics",
    href: "/products/electronics",
    label: "Electronics",
  },
  {
    name: "search/[[query]]/[[page]]",
    params: ["laptops"],
    id: "link-search-laptops",
    href: "/search/laptops",
    label: "Search Laptops",
  },
  {
    name: "search/[[query]]/[[page]]",
    params: ["laptops", "2"],
    id: "link-search-laptops-page2",
    href: "/search/laptops/2",
    label: "Search Laptops Page 2",
  },

  // Rest parameters
  {
    name: "docs/[...path]",
    params: ["getting-started"],
    id: "link-docs-single",
    href: "/docs/getting-started",
    label: "Docs: Getting Started",
  },
  {
    name: "docs/[...path]",
    params: ["api", "reference", "types"],
    id: "link-docs-nested",
    href: "/docs/api/reference/types",
    label: "Docs: API Reference Types",
  },

  // Combined: required + optional
  {
    name: "shop/[category]/[[subcategory]]",
    params: ["electronics"],
    id: "link-shop-electronics",
    href: "/shop/electronics",
    label: "Shop Electronics",
  },
  {
    name: "shop/[category]/[[subcategory]]",
    params: ["electronics", "laptops"],
    id: "link-shop-laptops",
    href: "/shop/electronics/laptops",
    label: "Shop Laptops",
  },

  // Combined: required + rest
  {
    name: "files/[bucket]/[...path]",
    params: ["my-bucket", "folder", "file.txt"],
    id: "link-files",
    href: "/files/my-bucket/folder/file.txt",
    label: "Files",
  },

  // Combined: required + optional + rest
  {
    name: "admin/[tenant]/resources/[[type]]/[...path]",
    params: ["acme", "users", "active"],
    id: "link-admin-with-type",
    href: "/admin/acme/resources/users/active",
    label: "Admin Resources",
  },
  {
    name: "admin/[tenant]/resources/[[type]]/[...path]",
    params: ["acme", "active"],
    id: "link-admin-no-type",
    href: "/admin/acme/resources/active",
    label: "Admin Active",
  },

  // Route specificity
  {
    name: "priority/profile",
    params: [],
    id: "link-priority-static",
    href: "/priority/profile",
    label: "Priority Profile",
  },
  {
    name: "priority/[id]",
    params: ["123"],
    id: "link-priority-dynamic",
    href: "/priority/123",
    label: "Priority 123",
  },

  // Template test routes - landing
  {
    name: "landing",
    params: [],
    id: "link-landing",
    href: "/landing",
    label: "Landing Home",
  },
  {
    name: "landing/about",
    params: [],
    id: "link-landing-about",
    href: "/landing/about",
    label: "Landing About",
  },
  {
    name: "landing/features",
    params: [],
    id: "link-landing-features",
    href: "/landing/features",
    label: "Landing Features",
  },
  {
    name: "landing/[slug]",
    params: ["promo"],
    id: "link-landing-slug",
    href: "/landing/promo",
    label: "Landing Promo",
  },
  {
    name: "landing/search/[[query]]",
    params: [],
    id: "link-landing-search-empty",
    href: "/landing/search",
    label: "Landing Search",
  },
  {
    name: "landing/search/[[query]]",
    params: ["deals"],
    id: "link-landing-search-query",
    href: "/landing/search/deals",
    label: "Landing Search Deals",
  },
  {
    name: "landing/docs/[...path]",
    params: ["guide"],
    id: "link-landing-docs",
    href: "/landing/docs/guide",
    label: "Landing Docs",
  },

  // Template test routes - marketing
  {
    name: "marketing/campaigns/summer",
    params: [],
    id: "link-marketing-summer",
    href: "/marketing/campaigns/summer",
    label: "Summer Campaign",
  },

  // Template test routes - products
  {
    name: "products/list",
    params: [],
    id: "link-products-list",
    href: "/products/list",
    label: "Products List",
  },

  // Link testing
  {
    name: "navigation",
    params: [],
    id: "link-navigation",
    href: "/navigation",
    label: "Navigation",
  },
];
