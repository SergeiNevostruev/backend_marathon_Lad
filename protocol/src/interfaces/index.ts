import { Socket } from "net";

export type DataType = "text" | "json" | "file";
export type ActionType = "__console" | "___return" | "writefile";
export const headerDataActionTypes = {
  datatypes: ["text", "json", "file"],
  actiontypes: ["__console", "___return", "writefile"],
};

export interface IOptionsProtocolStructure {
  dataType: DataType;
  response: boolean;
  closeConnectiion: boolean;
  action: ActionType;
}

export interface IProtocolStructure {
  header: {
    readonly title: {
      name: Buffer;
      offset: number;
    };
    dataType: {
      typeName: Buffer;
      offset: number;
    };
    action: {
      typeAction: Buffer;
      offset: number;
    };
    response: boolean;
    closeConnectiion: boolean;
  };
  payload: {
    data: Buffer;
  };
  readonly tail: {
    name: Buffer;
    offset: number;
  };
}

interface ICustomProtocolServerInt {
  serverActions(
    action: ActionType,
    type: DataType,
    data: Buffer,
    socket: Socket,
    fileName: string
  ): Promise<void>;
  //
}

class ICustomProtocolServerStat {
  static createConnection(host: string, port: number): void {}
}

export type ICustomProtocolServer = ICustomProtocolServerInt &
  ICustomProtocolServerStat;
