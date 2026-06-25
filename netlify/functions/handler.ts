import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import app from "../../api/handler.js";

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  return new Promise((resolve) => {
    const url = new URL(event.rawUrl ?? `http://localhost${event.path}`);
    const req = Object.assign(
      {
        method: event.httpMethod,
        url: event.path + (url.search || ""),
        headers: event.headers ?? {},
        body: event.body ?? "",
      },
      { readable: true }
    );

    const chunks: Buffer[] = [];
    const resHeaders: Record<string, string> = {};
    let statusCode = 200;

    const res = {
      statusCode,
      setHeader(name: string, value: string) { resHeaders[name] = value; },
      getHeader(name: string) { return resHeaders[name]; },
      removeHeader(name: string) { delete resHeaders[name]; },
      end(chunk?: string | Buffer) {
        resolve({
          statusCode: (res as any)._statusCode ?? 200,
          headers: resHeaders,
          body: chunk ? chunk.toString("utf8") : Buffer.concat(chunks).toString("utf8"),
        });
      },
      write(chunk: string | Buffer) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      },
      json(data: unknown) {
        resHeaders["Content-Type"] = "application/json";
        (res as any).end(JSON.stringify(data));
      },
      status(code: number) { (res as any)._statusCode = code; return res; },
      send(body?: string | Buffer) { (res as any).end(body); return res; },
    };

    (app as any)(req, res);
  });
};

export { handler };
