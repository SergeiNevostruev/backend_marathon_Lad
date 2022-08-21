import {
  DataType,
  IOptionsProtocolStructure,
  IProtocolStructure,
} from "../interfaces";

const defaultOptions: IOptionsProtocolStructure = {
  dataType: "text",
  response: true,
  closeConnectiion: true,
  action: "__console",
};

const defaultPayload = {
  data: Buffer.alloc(1),
};

export class ProtocolStructure implements IProtocolStructure {
  private readonly PROTOCOL_NAME = "My custom Protocol";
  private readonly END = "END";
  public readonly responses = {
    protocolOk: "accept protocol",
    headersOk: "accept headers",
    endOk: "accept end",
  };
  public header: {
    readonly title: { name: Buffer; offset: number };
    dataType: { typeName: Buffer; readonly offset: number };
    action: { typeAction: Buffer; offset: number };
    response: boolean;
    closeConnectiion: boolean;
  };
  public payload: { data: Buffer };
  public readonly tail: { name: Buffer; offset: number };

  constructor(
    payload: {
      data: Buffer;
    } = defaultPayload,
    options: IOptionsProtocolStructure = defaultOptions
  ) {
    this.header = {
      title: {
        name: Buffer.alloc(
          this.PROTOCOL_NAME.length,
          this.PROTOCOL_NAME,
          "utf8"
        ),
        offset: 24,
      },
      dataType: { typeName: Buffer.alloc(4, options.dataType), offset: 4 },
      action: { typeAction: Buffer.alloc(9, options.action), offset: 9 },
      closeConnectiion: options.closeConnectiion,
      response: options.response,
    };
    this.payload = payload;
    this.tail = {
      name: Buffer.alloc(
        (this.PROTOCOL_NAME + " " + this.END).length,
        this.PROTOCOL_NAME + " " + this.END,
        "utf8"
      ),
      offset: 24,
    };
  }

  setDataType = (dataType: DataType) => {
    this.header.dataType.typeName = Buffer.alloc(4, dataType);
  };
  setResponse = (response: boolean) => {
    this.header.response = response;
  };
  setCloseConnectiion = (closeConnectiion: boolean) => {
    this.header.closeConnectiion = closeConnectiion;
  };
}
