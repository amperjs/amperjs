import { describe, expect, test } from "vitest";

import { use } from "@/use";

describe("use", () => {
  test("accepts single middleware", () => {
    async function mw() {}
    const stack = use(mw);
    expect(stack.kind).toEqual("middleware");
    expect(stack.middleware[0]).toEqual(mw);
    expect(stack.middleware.length).toEqual(1);
    expect(stack.options).toBeUndefined();
  });

  test("accepts middleware array", () => {
    async function mw1() {}
    async function mw2() {}
    const stack = use([mw1, mw2]);
    expect(stack.kind).toEqual("middleware");
    expect(stack.middleware[0]).toEqual(mw1);
    expect(stack.middleware[1]).toEqual(mw2);
    expect(stack.middleware.length).toEqual(2);
    expect(stack.options).toBeUndefined();
  });

  test("accepts slot option", () => {
    const stack = use(async () => {}, { slot: "payload" });
    expect(stack.options?.slot).toEqual("payload");
  });

  test("accepts on option", () => {
    const stack = use(async () => {}, { on: ["GET"] });
    expect(stack.options?.on).toEqual(["GET"]);
  });
});
