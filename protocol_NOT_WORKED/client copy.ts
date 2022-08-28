import net from "net";
import { WriteStream } from "fs";
import { ProtocolStructure } from "./src/common/ProtocolStructure";
import { ActionType, DataType } from "./src/interfaces";
import { open } from "fs/promises";
import { join } from "path";

const protocol = new ProtocolStructure();
protocol.setDataType("json");
protocol.setActionType("writefile");
const client = new net.Socket();
const dataBig = Buffer.alloc(100000, "data");
client.connect(1337, "127.0.0.1");

client.on("connect", function () {
  console.log("Connected");
  client.write(protocol.header.title.name);
  //   client.write(data);
});

// const dataSender = (socket: net.Socket, dataType: DataType, actionType: ActionType, callback: )

client.on("data", async function (data) {
  console.log("Received: " + data);
  if (data.toString() === protocol.responses.protocolOk) {
    const header = Buffer.concat([
      protocol.header.dataType.typeName,
      protocol.header.action.typeAction,
    ]);
    client.write(header);
  }

  if (data.toString() === protocol.responses.headersOk) {
    // client.write("");
    // client.write(dataBig);
    console.log("\n");

    const fd = await open(join(__dirname, "file", "test.json"));
    const fileStream = fd.createReadStream();
    fileStream.pipe(client, { end: false });
    fileStream.on("end", () => {
      console.log("end");
      client.write(protocol.tail.name);
      fileStream.close();
      fileStream.push(null);
      fileStream.read(0);
      //   client.destroy(); // kill client after server's response
    });
  }
});

client.on("close", function () {
  console.log("Connection closed");
  client.destroy();
});
client.on("error", (e) => {
  console.log("error");
  console.log(e);

  client.destroy();
});
