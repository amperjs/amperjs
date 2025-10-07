import defaults from "./defaults";
import type {
  FetchMapper,
  FetchMethod,
  HTTPError,
  HTTPMethod,
  Options,
} from "./types";

export { defaults };

export * from "./types";

// Supported data types for request body
type Data = Record<string, unknown> | FormData | ArrayBuffer | Blob | string;

// Path can be a string, number, or array of these
type PathEntry = string | number;

// HTTP methods that typically don't include a request body
const bodylessMethods = ["GET", "DELETE"];

// Main factory function that creates a configured fetch client instance
export default (base: string | URL, opts?: Options): FetchMapper => {
  // Merge provided options with defaults, extracting specific properties
  const {
    headers: _headers,
    responseMode,
    stringify,
    errorHandler,
    ...fetchOpts // Remaining options passed directly to fetch
  } = {
    ...defaults,
    ...opts,
  };

  // Normalize headers to Headers instance for consistent API
  const headers = new Headers({
    ...(_headers instanceof Headers
      ? Object.fromEntries(_headers.entries()) // Convert Headers to plain object
      : _headers), // Use as-is if already a plain object
  });

  // Factory function that creates HTTP method implementations
  function wrapper(method: HTTPMethod): FetchMethod {
    // Function overloads for TypeScript type checking
    // No path, no data
    function _wrapper<T>(): Promise<T>;
    // Path without data
    function _wrapper<T>(path: PathEntry | Array<PathEntry>): Promise<T>;
    // Path with data
    function _wrapper<T>(
      path: PathEntry | Array<PathEntry>,
      data: Data,
    ): Promise<T>;

    // Main implementation function
    function _wrapper<T>(
      path?: PathEntry | Array<PathEntry>,
      data?: Data,
    ): Promise<T> {
      // Construct URL from base and path segments
      const url = [
        String(base),
        ...(Array.isArray(path)
          ? path // Use array as-is
          : ["string", "number"].includes(typeof path)
            ? [path] // Wrap single value in array
            : []), // No path provided
      ].join("/");

      // Check if content-type was explicitly set in options
      const optedContentType =
        opts?.headers instanceof Headers
          ? opts.headers.get("Content-Type")
          : opts?.headers?.["Content-Type"];

      // Auto-set Content-Type header based on response mode if not explicitly set
      if (responseMode !== defaults.responseMode && !optedContentType) {
        const contentType = {
          text: "text/plain",
          blob: data instanceof Blob ? data.type : undefined,
          formData: null, // Let browser set multipart boundary
          arrayBuffer: null, // No content-type needed
          raw: undefined, // Don't modify
        }[responseMode];

        if (contentType === null) {
          headers.delete("Content-Type");
        } else if (contentType) {
          headers.set("Content-Type", contentType);
        }
      }

      let searchParams = "";

      // Default empty body
      let body: string | FormData | ArrayBuffer | Blob = JSON.stringify({});

      // Handle different data types for request body
      if (
        data instanceof Blob ||
        data instanceof FormData ||
        Object.prototype.toString.call(data) === "[object ArrayBuffer]"
      ) {
        // Use binary data as-is
        body = data as typeof body;
      } else if (typeof data === "string") {
        if (bodylessMethods.includes(method)) {
          // For GET/DELETE, add string data as query params
          searchParams = data;
        } else {
          // For other methods, use as body
          body = data;
        }
      } else if (typeof data === "object") {
        if (bodylessMethods.includes(method)) {
          // For GET/DELETE, serialize object to query string
          searchParams = stringify(data as Record<string, string>);
        } else {
          // For other methods, serialize as JSON
          body = JSON.stringify({ ...data });
        }
      }

      // Prepare fetch configuration
      const config: Options & { method: HTTPMethod; body?: typeof body } = {
        ...fetchOpts,
        method,
        headers,
        // Only include body for non-bodyless methods
        ...(bodylessMethods.includes(method) ? {} : { body }),
      };

      // Execute fetch request and process response
      return fetch([url, searchParams].join("?"), config)
        .then((response) => {
          // Return both response and parsed data based on responseMode
          return Promise.all([
            response,
            responseMode === "raw"
              ? response // Return full response object
              : response[responseMode]().catch(() => null), // Parse response body
          ]);
        })
        .then(([response, data]) => {
          if (response.ok) {
            return data; // Return parsed data for successful responses
          }
          // Create enhanced error object for HTTP errors
          const error = new Error(
            data?.error || response.statusText,
          ) as HTTPError;
          error.response = response;
          error.body = data;
          errorHandler?.(error); // Call custom error handler if provided
          throw error;
        });
    }

    return _wrapper;
  }

  // Return object with HTTP method functions
  return {
    GET: wrapper("GET"),
    POST: wrapper("POST"),
    PUT: wrapper("PUT"),
    PATCH: wrapper("PATCH"),
    DELETE: wrapper("DELETE"),
  };
};
