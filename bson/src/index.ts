import ConvectorBsonJson from "./common/ConvectorBsonJson";
import schema from "./schema/test_bson_data_validator.schema.json";
import { join } from "path";

console.log("start ----->\n\n");
const easySchema = {
  properties: { name: { type: "string" } },
};

// const convector = new ConvectorBsonJson(easySchema);
// (async () => {
//   await convector.toBsonFile(join(__dirname, "testJsonFiles", "test.txt"));
//   await convector.toJsonFile(join(__dirname, "testJsonFiles", "test.bson"));
// })();

const convector2 = new ConvectorBsonJson(schema);
console.log(schema);

(async () => {
  await convector2.toBsonFile(
    join(__dirname, "testJsonFiles", "test_bson_data_validator.json")
  );
  await convector2.toJsonFile(
    join(__dirname, "testJsonFiles", "test_bson_data_validator.bson")
  );
})();
