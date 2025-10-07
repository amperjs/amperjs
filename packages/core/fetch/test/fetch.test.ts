import { describe, expect, test } from "vitest";

import fetchWrapper, { type HTTPMethod } from "@/index";

const httpMethods = ["GET", "DELETE", "POST", "PUT", "PATCH"] as const;

describe("fetch", () => {
  const fetch = fetchWrapper("http://json");

  type ResponseT = {
    method: HTTPMethod;
    url: string;
    headers: Record<string, unknown>;
    path: string;
    params: Record<string, string>;
    searchParams: Record<string, string>;
    body?: Record<string, unknown>;
  };

  for (const method of httpMethods) {
    test(method, async () => {
      const res = await fetch[method]<ResponseT>();
      expect(res.method).toEqual(method);
      expect(res.headers["content-type"]).toEqual("application/json");
    });
  }

  describe("params", () => {
    for (const method of httpMethods) {
      test(`${method}: no params`, async () => {
        const res = await fetch[method]<ResponseT>();
        expect(res.params).toEqual({});
      });

      test(`${method}: with array params`, async () => {
        const res = await fetch[method]<ResponseT>(["a", "b", "c"]);
        expect(res.params).toEqual({ path: ["a", "b", "c"] });
      });

      test(`${method}: with string params`, async () => {
        const res = await fetch[method]<ResponseT>(["a/b/c"]);
        expect(res.params).toEqual({ path: ["a", "b", "c"] });
      });
    }
  });

  describe("payload", () => {
    for (const method of ["GET", "DELETE"] as const) {
      test(method, async () => {
        const res = await fetch[method]<ResponseT>([], { id: 10 });
        expect(res.searchParams).toEqual({ id: "10" });
        expect(res.body).toBeUndefined();
      });
      test(`${method}: string searchParams`, async () => {
        const res = await fetch[method]<ResponseT>([], "id=10");
        expect(res.searchParams).toEqual({ id: "10" });
        expect(res.body).toBeUndefined();
      });
    }

    for (const method of ["POST", "PUT", "PATCH"] as const) {
      test(method, async () => {
        const res = await fetch[method]<ResponseT>([], { id: 10 });
        expect(res.searchParams).toEqual({});
        expect(res.body).toEqual({ id: 10 });
      });
    }
  });

  describe("text", () => {
    const fetch = fetchWrapper("http://text", { responseMode: "text" });

    for (const method of ["POST", "PUT", "PATCH"] as const) {
      test(method, async () => {
        const res = await fetch[method]<string>([], "payload");
        expect(res).toEqual("payload");
      });
    }
  });

  describe("blob", () => {
    const fetch = fetchWrapper("http://blob", { responseMode: "blob" });

    for (const method of ["POST", "PUT", "PATCH"] as const) {
      const blob = new Blob(["payload"], { type: "text/plain" });
      test(method, async () => {
        const res = await fetch[method]<Blob>([], blob);
        expect(res.type).toEqual("text/plain");
        expect(await res.text()).toEqual("payload");
      });
    }
  });

  describe("form", () => {
    const fetch = fetchWrapper("http://form", { responseMode: "formData" });
    const name = "John";

    for (const method of ["POST", "PUT", "PATCH"] as const) {
      const formData = new FormData();
      formData.set("name", name);
      test(method, async () => {
        const res = await fetch[method]<FormData>([], formData);
        expect(res.get("name")).toEqual(name);
      });
    }
  });

  describe("buffer", () => {
    const fetch = fetchWrapper("http://buffer", {
      responseMode: "arrayBuffer",
    });
    const name = "John";

    for (const method of ["POST", "PUT", "PATCH"] as const) {
      const data = new TextEncoder().encode(name).buffer;
      test(method, async () => {
        const res = await fetch[method]<ArrayBuffer>([], data);
        expect(Buffer.from(data).toString()).toEqual(
          Buffer.from(res).toString(),
        );
      });
    }
  });

  describe("raw", () => {
    const fetch = fetchWrapper("http://raw", { responseMode: "raw" });

    for (const method of ["POST", "PUT", "PATCH"] as const) {
      test(method, async () => {
        const res = await fetch[method]<Response>([]);
        expect(res).toBeInstanceOf(Response);
        expect(await res.text()).toEqual("raw");
      });
    }
  });
});
