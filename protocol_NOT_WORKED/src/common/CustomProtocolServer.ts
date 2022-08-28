import {
  ActionType,
  ICustomProtocolServer,
  DataType,
  headerDataActionTypes,
} from "../interfaces";
import { ProtocolStructure } from "./ProtocolStructure";
import { createServer, Server, Socket } from "net";
import { writeFile, access, constants, appendFile, open } from "fs/promises";
import { close, createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";

export class CustomProtocolServer implements ICustomProtocolServer {
  private TCPServer: Server;
  private sockets = [];
  private protocolStruct;
  private dirpath: string;
  private constructor(private host: string, private port: number) {
    this.TCPServer = createServer();
    this.protocolStruct = new ProtocolStructure();
    this.dirpath = join(__dirname, "..", "..", "outServerFile");
    if (!existsSync(this.dirpath)) {
      mkdirSync(this.dirpath);
    }
  }
  public async serverActions(
    action: ActionType,
    type: DataType,
    data: Buffer,
    socket: Socket,
    fileName: string
  ): Promise<void> {
    let decodeData: any;
    let exp: string = "";

    switch (type) {
      case headerDataActionTypes.datatypes[0]: // text
        decodeData = data.toString();
        exp = ".txt";
        break;
      case headerDataActionTypes.datatypes[1]: // json
        try {
          decodeData = JSON.parse(data.toString());
        } catch (error) {
          console.log(error);
          decodeData =
            "Инфомрация не соответствует типу JSON\n" + data.toString();
        }
        exp = ".json";
        break;
      case headerDataActionTypes.datatypes[2]: //file
        decodeData = data;
        exp = ".jpeg"; // если предполагается и другие типы файлов, нужно менять заголовок протокола
        break;
      default:
        break;
    }

    switch (action) {
      case headerDataActionTypes.actiontypes[0]: // console
        console.log(decodeData);
        break;
      case headerDataActionTypes.actiontypes[1]: // return client
        socket.write(data);
        break;
      case headerDataActionTypes.actiontypes[2]: // writefile
        const filepath = join(this.dirpath, fileName + exp);
        if (!existsSync(filepath)) {
          console.log("Файл записан в", filepath);
          await writeFile(filepath, "");
        }
        await appendFile(filepath, data);

        break;
      default:
        break;
    }
  }
  static createConnection(host: string, port: number): void {
    console.log("start Custom Protocol Server");
    const protocol = new CustomProtocolServer(host, port);
    protocol.TCPServer.listen(protocol.port, protocol.host);
    protocol.TCPServer.on("connection", (socket: Socket) => {
      let changeStartProtocol = false;
      let changeStartHeaders = false;
      let dataCount = 0;
      let changeEndProtocol = false;
      let dataType: string = "";
      let actionType: string = "";
      let firstDataChunk: Buffer;
      let lastDataChunk: Buffer;
      let fullData: Buffer[];
      const fileName = Date.now().toString();
      socket.on("data", async (data) => {
        // console.log(data);
        if (!changeEndProtocol) {
          let tail = data
            .subarray(-protocol.protocolStruct.tail.offset + 2)
            .toString();
          if (tail === protocol.protocolStruct.tail.name.toString()) {
            changeEndProtocol = true;
            socket.write(protocol.protocolStruct.tail.name);
            socket.end();
          }
        }

        if (changeStartHeaders && !changeEndProtocol) {
          // console.log("payload ===>", data.toString());
          await protocol.serverActions(
            actionType as ActionType,
            dataType as DataType,
            data,
            socket,
            fileName
          );
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

            // console.log(data.byteLength, data.byteOffset);
            socket.write(
              Buffer.from(protocol.protocolStruct.responses.protocolOk)
            );
          }
        }

        if (!changeStartHeaders && changeStartProtocol && dataCount === 1) {
          dataType = data
            .subarray(0, protocol.protocolStruct.header.dataType.offset)
            .toString();
          actionType = data
            .subarray(protocol.protocolStruct.header.dataType.offset)
            .toString();
          // console.log(dataType, actionType);
          // console.log(dataCount);

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
            // socket.destroy();
          }
        }

        dataCount++;
      });
      socket.on("error", (e) => console.log(e));
      socket.on("close", () => {
        // socket.destroy();
        // console.log(socket.remoteAddress, socket.remotePort, ' отключился');
      });
    });
  }
  public async serverActions2(
    action: ActionType,
    type: DataType,
    data: Buffer,
    socket: Socket,
    fileName: string
  ): Promise<void> {
    let decodeData: any;
    let exp: string = "";

    switch (type) {
      case headerDataActionTypes.datatypes[0]: // text
        decodeData = data.toString();
        exp = ".txt";
        break;
      case headerDataActionTypes.datatypes[1]: // json
        try {
          decodeData = JSON.parse(data.toString());
        } catch (error) {
          console.log(error);
          decodeData =
            "Инфомрация не соответствует типу JSON\n" + data.toString();
        }
        exp = ".json";
        break;
      case headerDataActionTypes.datatypes[2]: //file
        decodeData = data;
        exp = ".jpeg"; // если предполагается и другие типы файлов, нужно менять заголовок протокола
        break;
      default:
        break;
    }

    switch (action) {
      case headerDataActionTypes.actiontypes[0]: // console
        console.log(decodeData);
        break;
      case headerDataActionTypes.actiontypes[1]: // return client
        socket.write(data);
        break;
      case headerDataActionTypes.actiontypes[2]: // writefile
        const filepath = join(this.dirpath, fileName + exp);
        if (!existsSync(filepath)) {
          console.log("Файл записан в", filepath);
          await writeFile(filepath, "");
        }
        await appendFile(filepath, data);

        break;
      default:
        break;
    }
  }
  static createConnection2(host: string, port: number): void {
    console.log("start Custom Protocol Server");
    const protocol = new CustomProtocolServer(host, port);
    protocol.TCPServer.listen(protocol.port, protocol.host);
    let changeStartProtocol = false;
    let changeStartHeaders = false;
    let changeEndProtocol = false;
    let dataType: string = "";
    let actionType: string = "";
    protocol.TCPServer.on("connection", (socket: Socket) => {
      const fileName = Date.now().toString();
      socket.on("data", async (data) => {
        console.log(data.toString(), data.byteOffset, "\n");
        console.log("first changeStartProtocol => ", changeStartProtocol);
        if (
          !changeStartProtocol &&
          data
            .toString()
            .startsWith(protocol.protocolStruct.header.title.name.toString())
        ) {
          changeStartProtocol = true;
          changeEndProtocol = false;
          console.log("changeStartProtocol => ", changeStartProtocol);
          const headerTitleOffset = protocol.protocolStruct.header.title.offset;
          const headerDataTypeOffset =
            headerTitleOffset + protocol.protocolStruct.header.dataType.offset;
          const headerActionTypeOffset =
            headerDataTypeOffset + protocol.protocolStruct.header.action.offset;
          dataType = data
            .subarray(headerTitleOffset, headerDataTypeOffset)
            .toString();
          actionType = data
            .subarray(headerDataTypeOffset, headerActionTypeOffset)
            .toString();
          if (
            !headerDataActionTypes.datatypes.includes(dataType) &&
            !headerDataActionTypes.actiontypes.includes(actionType)
          ) {
            console.log("некорректный протокол", dataType, actionType);
            socket.destroy();
          } else {
            changeStartHeaders = true;
          }
          // console.log(" dataType, actionType ---> ", dataType, actionType);
        } else if (
          !changeStartProtocol &&
          !data
            .toString()
            .startsWith(protocol.protocolStruct.header.title.name.toString())
        ) {
          console.log("changeStartProtocol => ", changeStartProtocol);

          console.log(
            "некорректный протокол",
            protocol.protocolStruct.header.title.name.toString()
          );
          socket.destroy();
        }

        // console.log(data);
        if (!changeEndProtocol) {
          let tail = data
            .subarray(-protocol.protocolStruct.tail.offset + 2)
            .toString();
          if (tail === protocol.protocolStruct.tail.name.toString()) {
            changeEndProtocol = true;
            changeStartProtocol = false;
            dataType = "";
            actionType = "";
            // socket.write(protocol.protocolStruct.tail.name);
            // socket.end();
          }
        }

        if (changeStartHeaders && !changeEndProtocol) {
          // console.log("payload ===>", data.toString());
          await protocol.serverActions2(
            actionType as ActionType,
            dataType as DataType,
            data,
            socket,
            fileName
          );
          changeEndProtocol = false;
        }
      });
      socket.on("error", (e) => console.log(e));
      socket.on("close", () => {
        // socket.destroy();
        // console.log(socket.remoteAddress, socket.remotePort, ' отключился');
      });
    });
    protocol.TCPServer.on("error", (err) => {
      console.log("Server error --->", err);
    });
  }
}
