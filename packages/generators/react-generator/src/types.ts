export type Options = {
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
