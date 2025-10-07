import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

const handlers = [
  http.all("http://json/:path*", async ({ request, params }) => {
    return HttpResponse.json({
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      path: request.url.replace("http://fqdn", ""),
      params,
      searchParams: Object.fromEntries(new URL(request.url).searchParams),
      ...(["POST", "PUT", "PATCH"].includes(request.method)
        ? { body: await request.json() }
        : {}),
    });
  }),

  http.all("http://text/:path*", async ({ request }) => {
    return HttpResponse.text(await request.text());
  }),

  http.all("http://blob/:path*", async ({ request }) => {
    const blob = await request.blob();
    const res = new Blob([await blob.text()], { type: "text/plain" });
    const buf = await blob.arrayBuffer();
    return new HttpResponse(res, {
      headers: {
        "Content-Type": blob.type,
        "Content-Length": String(buf.byteLength),
      },
    });
  }),

  http.all("http://form/:path*", async ({ request }) => {
    return HttpResponse.formData(await request.formData());
  }),

  http.all("http://buffer/:path*", async ({ request }) => {
    const buf = await request.arrayBuffer();
    const res = new TextEncoder().encode(Buffer.from(buf).toString()).buffer;
    return new HttpResponse(res);
  }),

  http.all("http://raw/:path*", async () => {
    return new HttpResponse("raw");
  }),
];

export const server = setupServer(...handlers);
