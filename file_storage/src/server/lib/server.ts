import * as Hapi from "@hapi/hapi";
import path, { join } from "path";
import dotenv from "dotenv";
import plugins from "./plugins";
import testRoute from "../routes/testRoute";
import config from "../config";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

dotenv.config();
export const filePath = join(__dirname, "..", "..", "..", "files");

// server
// =====================================================================================

const init = async (): Promise<void> => {
  if (!existsSync(filePath)) {
    try {
      await mkdir(filePath);
    } catch (error) {
      console.log(error);
    }
  }
  const server = Hapi.server({
    port: process.env.SERVER_PORT || config.apiPort,
    host: process.env.HOST || config.apiHost,
    routes: {
      files: {
        relativeTo: filePath,
      },
    },
  });

  await server.register(plugins);

  server.route([...testRoute]);

  await server.start().then(() => {
    console.log(
      "Server running on %s://%s:%s",
      server.info.protocol,
      server.info.address,
      server.info.port
    );

    console.log(
      "Documentation running on %s://%s:%s/documentation",
      server.info.protocol,
      server.info.address,
      server.info.port
    );
  });
};

export default init;
