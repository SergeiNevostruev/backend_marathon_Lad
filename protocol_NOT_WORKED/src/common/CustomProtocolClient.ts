import net, { Socket } from "net";
import { existsSync, mkdirSync, WriteStream } from "fs";
import { ProtocolStructure } from "./ProtocolStructure";
import { ActionType, DataType } from "../interfaces";
import { open } from "fs/promises";
import { join } from "path";
import EventEmitter from "events";

export class CustomProtocolClient {
  private protocol: ProtocolStructure;
  private client: Socket;
  private host: string = "";
  private port: number = 0;
  private eventNext: EventEmitter;
  private next: boolean = true;
  //   private sender: CustomProtocolClient | undefined;
  private folderName: string;
  private constructor(folderName: string) {
    this.eventNext = new EventEmitter();
    this.protocol = new ProtocolStructure();
    this.client = new net.Socket();
    this.folderName = join(__dirname, "..", "..", folderName);
    if (!existsSync(this.folderName)) {
      mkdirSync(this.folderName);
    }
  }
  public static createConnection = (
    host: string,
    port: number,
    folderName: string
  ): CustomProtocolClient => {
    const sender = new CustomProtocolClient(folderName);
    sender.host = host;
    sender.port = port;
    sender.client.connect(port, host);
    console.log(
      "Файлы для отправки на сервер нажно разместить в папке:",
      sender.folderName
    );
    sender.client.on("connect", () => {
      console.log("Connected");
      sender.next = true;
      sender.eventNext.emit("next");
    });
    return sender;
  };
  private fileReader = async (fileNameInFolderSend: string, socket: Socket) => {
    const pathFile = join(this.folderName, fileNameInFolderSend);
    if (!existsSync(pathFile)) {
      console.log("Неверный путь к файлу");
      return false;
    }
    const fd = await open(pathFile);
    const fileStream = fd.createReadStream();
    fileStream.pipe(socket, { end: false });
    fileStream.on("end", () => {
      //   console.log("end of the data...\nWaiting for the server response\n");
      socket.write(this.protocol.tail.name);
      fileStream.close();
      fileStream.push(null);
      fileStream.read(0);
    });
  };
  public send = async (
    dataSend: Buffer | string, // передается либо созданный буфер, либо название файла из которого считать Инфомрация для передачи на сервер
    readFileOpt: boolean = false, //  файл, который лежит в папке folderName, определенной при создании инстанса класса.
    dataType: DataType = "text",
    actionTipe: ActionType = "__console"
  ): Promise<void> => {
    // return new Promise(async (resolve, reject) => {
    this.protocol.setDataType(dataType);
    this.protocol.setActionType(actionTipe);
    this.client.write(this.protocol.header.title.name);
    this.client.on("data", async (data) => {
      console.log("Received: " + data);
      if (data.toString() === this.protocol.responses.protocolOk) {
        const header = Buffer.concat([
          this.protocol.header.dataType.typeName,
          this.protocol.header.action.typeAction,
        ]);
        this.client.write(header);
      }

      if (data.toString() === this.protocol.responses.headersOk) {
        console.log();

        if (readFileOpt && typeof dataSend === "string") {
          await this.fileReader(dataSend, this.client);
        } else if (!readFileOpt && Buffer.isBuffer(dataSend)) {
          this.client.write(dataSend);
          this.client.write(this.protocol.tail.name);
        } else {
          console.log("Переданы неверные данные");
          this.client.destroy();
        }
      }

      let tail = data.subarray(-this.protocol.tail.offset + 2).toString();
      if (tail === this.protocol.tail.name.toString()) {
        console.log("End connection");
        this.client.emit("end");
        this.client.destroy();
        // this.client.end();
        //   resolve();
      }
    });
    this.client.on("close", () => {
      console.log("Connection closed");
      // this.client.end();
      // setTimeout(() => {
      //   this.client.end();
      // });
    });
    this.client.on("error", (e) => {
      console.log("error");
      console.log(e);
      // reject(e);
      //   this.client.destroy();
    });
    // });
  };
  public send2 = async (
    dataSend: Buffer | string, // передается либо созданный буфер, либо название файла из которого считать Инфомрация для передачи на сервер
    readFileOpt: boolean = false, //  файл, который лежит в папке folderName, определенной при создании инстанса класса.
    dataType: DataType = "text",
    actionTipe: ActionType = "__console"
  ): Promise<void> => {
    // if (this.next) {
    //   this.next = false;
    //   this.eventNext.once("next", async () => {
    this.next = false;
    this.protocol.setDataType(dataType);
    this.protocol.setActionType(actionTipe);
    // this.client.write(this.protocol.header.title.name);
    const header = Buffer.concat([
      this.protocol.header.title.name,
      this.protocol.header.dataType.typeName,
      this.protocol.header.action.typeAction,
    ]);
    this.client.write(header);
    if (readFileOpt && typeof dataSend === "string") {
      await this.fileReader(dataSend, this.client);
      this.client.write(this.protocol.tail.name);
    } else if (!readFileOpt && Buffer.isBuffer(dataSend)) {
      this.client.write(dataSend);
      this.client.write(this.protocol.tail.name);
    } else {
      console.log("Переданы неверные данные");
      this.client.destroy();
    }
    this.client.on("data", (data) => {
      console.log(data.toString());
    });
    this.client.once("close", () => {
      this.next = true;
      this.eventNext.emit("next");
    });
    //   });
    // }
  };
  public end = () => {
    this.client.destroy();
  };
}
// }
