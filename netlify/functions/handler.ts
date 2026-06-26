import serverlessHttp from "serverless-http";
import app from "../../api/handler.js";

export const handler = serverlessHttp(app);
