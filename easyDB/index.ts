import { fsStruct } from "./src/server/controllers/databases";
import init from "./src/server/lib/server";

(async () => {
  await fsStruct.createStructureFS(); //
  await init();
})();
