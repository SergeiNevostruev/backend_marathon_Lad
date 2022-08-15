import ConvectorBsonJson from "./common/ConvectorBsonJson";
import schema from "./schema/test_bson_data_validator.schema.json";
import { join } from "path";

console.log("start ----->");

const convector = new ConvectorBsonJson({
  properties: { name: { type: "string" } },
});
(async () => {
  const data = await convector.readJsonOrBsonFile(
    join(__dirname, "testJsonFiles", "test.txt")
  );
  console.log(convector.validate(data).data);

  console.log(convector.convectToBson(convector.validate(data).data));
})();
