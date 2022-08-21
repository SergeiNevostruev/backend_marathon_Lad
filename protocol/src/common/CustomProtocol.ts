import {
  ActionType,
  ICustomProtocol,
  DataType,
  headerDataActionTypes,
} from "../interfaces";
import { ProtocolStructure } from "./ProtocolStructure";
import { createServer, Server, Socket } from "net";

export class CustomProtocol implements ICustomProtocol {
  private TCPServer: Server;
  private sockets = [];
  private protocolStruct;
  private constructor(private host: string, private port: number) {
    this.TCPServer = createServer();
    this.protocolStruct = new ProtocolStructure();
  }
  static createConnection(host: string, port: number): void {
    console.log("start");
    const protocol = new CustomProtocol(host, port);
    protocol.TCPServer.listen(protocol.port, protocol.host);
    protocol.TCPServer.on("connection", (socket) => {
      let changeStartProtocol = false;
      let changeStartHeaders = false;
      let dataCount = 0;
      let changeEndProtocol = false;
      let action: ActionType;
      let fullData: Buffer[];
      socket.on("data", (data) => {
        // console.log(data);
        if (!changeEndProtocol) {
          let tail = data
            .subarray(-protocol.protocolStruct.tail.offset + 2)
            .toString();
          if (tail === protocol.protocolStruct.tail.name.toString()) {
            console.log("End massage");
            console.log("dataCount =>", dataCount);
            changeEndProtocol = true;
            socket.destroy();
          }
        }

        if (changeStartHeaders && !changeEndProtocol) {
          console.log("payload ===>", data.toString());
        }

        if (!changeStartProtocol) {
          changeStartProtocol = data.includes(
            protocol.protocolStruct.header.title.name
          );
          if (!changeStartProtocol) {
            console.log("некорректный протокол");
            socket.destroy();
          } else {
            console.log(
              "Соединение по протоколу",
              protocol.protocolStruct.header.title.name.toString()
            );

            console.log(data.byteLength, data.byteOffset);
            socket.write(
              Buffer.from(protocol.protocolStruct.responses.protocolOk)
            );
          }
        }

        if (!changeStartHeaders && changeStartProtocol && dataCount === 1) {
          const dataType = data
            .subarray(0, protocol.protocolStruct.header.dataType.offset)
            .toString();
          const actionType = data
            .subarray(protocol.protocolStruct.header.dataType.offset)
            .toString();
          console.log(dataType, actionType);
          console.log(dataCount);

          if (
            headerDataActionTypes.datatypes.includes(dataType) &&
            headerDataActionTypes.actiontypes.includes(actionType)
          ) {
            changeStartHeaders = true;
            socket.write(
              Buffer.from(protocol.protocolStruct.responses.headersOk)
            );
          } else {
            console.log("некорректные заголовки");
            socket.destroy();
          }
        }

        dataCount++;
      });
      socket.on("error", (e) => console.log(e));
    });
  }
}
