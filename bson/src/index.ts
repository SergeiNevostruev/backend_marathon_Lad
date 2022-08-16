import ConvectorBsonJson from "./common/ConvectorBsonJson";
import schema from "./schema/test_bson_data_validator.schema.json";
import { join } from "path";

console.log("start ----->\n\n");
const easySchema = {
  properties: { name: { type: "string" } },
};

const convector = new ConvectorBsonJson(easySchema);
(async () => {
  await convector.toBsonFile(join(__dirname, "testJsonFiles", "test.txt"));
  await convector.toJsonFile(join(__dirname, "testJsonFiles", "test.bson"));
})();
