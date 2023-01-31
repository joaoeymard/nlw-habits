/**
 * Back-end API RESTful
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

const app = Fastify({
  logger: true,
});

app.register(cors);
app.register(appRoutes);

app.listen({ host: "0.0.0.0", port: 3000 }, (err, address) => {
  if (err) console.error(err);

  console.log(`Server listening at ${address}`);
});
