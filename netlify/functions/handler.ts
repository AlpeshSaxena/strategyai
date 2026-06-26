import serverlessHttp from "serverless-http";
import app from "../../api/handler.js";

// binary: only treat image/octet-stream as binary — JSON bodies stay as strings
export const handler = serverlessHttp(app, {
  binary: ["image/*", "application/octet-stream"],
  request(req: any, event: any) {
    // If serverless-http doesn't populate the body stream in time,
    // inject the raw body directly so express.json() / express.text() can parse it
    if (event.body && !req.body) {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : event.body;
      req.body = raw;
    }
  },
});
