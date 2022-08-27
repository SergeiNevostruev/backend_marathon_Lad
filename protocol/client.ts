import CustomProtocol from "./src";
const { CustomProtocolClient } = CustomProtocol;

const host = "127.0.0.1";
const port = 1337;
const client = CustomProtocolClient.createConnection(host, port, "file");
// const client1 = CustomProtocolClient.createConnection(host, port, "file");

// (async () => {
// setInterval(async () => {
client.send2(Buffer.from("Stream 123132", "utf8"));
// client.send2(Buffer.from("Stream 2222", "utf8"));
// client.send2(Buffer.from("Stream 3333", "utf8"));
// client.send2("test1.json", true, "file", "__console");
// }, 1000);

// await client1.send(Buffer.from("Stream 123132", "utf8"));
// await client.send("buf", true, "file", "writefile");
// await client.send("test1.json", true, "json", "___return");
// })();
