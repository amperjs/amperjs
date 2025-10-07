export default {
  responseMode: "json",
  get headers() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  },
  stringify: (o) => new URLSearchParams(o as never).toString(),
  errorHandler: console.error,
} satisfies import("./types").Defaults;
