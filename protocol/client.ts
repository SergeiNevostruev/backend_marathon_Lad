import CustomProtocol from "./src";
const { CustomProtocolClient } = CustomProtocol;

const host = "127.0.0.1";
const port = 1337;
const client = CustomProtocolClient.createConnection(host, port, "file");
// const client1 = CustomProtocolClient.createConnection(host, port, "file");

(async () => {
  // await client.send("test.json", true, "json", "writefile");
  await client.send("test.json", true, "json", "__console");
  // await client.send("test.json", true, "json", "___return");
})();
