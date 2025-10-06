export type Options = {
  /**
   * Maps custom URLs to existing named routes.
   *
   * The key is the URL to be served (must be absolute and wont be prefixed by the router's base).
   * The value is the name of the route that should handle the request.
   *
   * If the URL includes dynamic segments (e.g. `[id]`),
   * they must exactly match the parameter names expected by the target route.
   * Otherwise, the request may result in a 404.
   *
   * Example:
   *   alias: {
   *     "/feed.xml": "rssFeed",          // served at /feed.xml, handled by "rssFeed" route
   *     "/members/[id]": "users/[id]",  // [id] param must match exactly
   *   }
   * */
  alias?: Record<
    string, // Absolute public URL (not prefixed by router's base)
    string // Name of the route to handle the URL
  >;

  templates?: Record<
    // route name pattern
    string,
    // template itself, not path to template file
    string
  >;

  meta?: Record<
    // route name pattern
    string,
    object
  >;
};
