/**
 * Uploadthing Route Handler
 * Handles file upload requests via Uploadthing
 */

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
