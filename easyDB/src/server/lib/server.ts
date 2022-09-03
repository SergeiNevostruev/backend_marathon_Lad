import * as Hapi from "@hapi/hapi";
import path from "path";
import dotenv from "dotenv";
import plugins from "./plugins";
import dbRoute from "../routes/dbRoute";
import config from "../config";
import collRoute from "../routes/collRoute";
import reposRoute from "../routes/reposRoute";
// import { pathDir } from "../../../index";

dotenv.config();

// server
// =====================================================================================

const init = async (): Promise<void> => {
  const server = Hapi.server({
    port: process.env.SERVER_PORT || config.apiPort,
    host: process.env.HOST || config.apiHost,
    // routes: {
    //   files: {
    //     relativeTo: pathDir,
    //   },
    // },
  });

  await server.register(plugins);

  server.route([...dbRoute, ...collRoute, ...reposRoute]);

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
