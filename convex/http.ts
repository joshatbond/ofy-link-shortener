import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { redirectBySlug } from "./features/redirect";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/redirect",
  method: "GET",
  handler: redirectBySlug,
});

export default http;
