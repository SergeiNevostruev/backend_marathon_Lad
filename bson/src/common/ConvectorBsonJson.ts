import { Schema } from "jsonschema";
import { access, readFile, mkdir, writeFile } from "fs/promises";
import { constants, existsSync, mkdirSync } from "fs";
import { Validator } from "jsonschema";
import { deserialize, serialize } from "bson";
import { join, basename } from "path";

type TypeDataBSON = any;
type TypeDataJSON = any;
type TypePath = string;

interface IStatusToDo {
  status: boolean;
  fileName?: string;
}

interface IReadFile extends IStatusToDo {
  data?: TypeDataJSON | null;
}

interface IValidFile extends IStatusToDo {
  data?: TypeDataJSON | null;
}

interface IWriteFile extends IStatusToDo {
  path?: TypePath | null;
}

interface IConvectorBsonJson {
  readJsonOrBsonFile: (path: TypePath) => Promise<IReadFile>;
  validate: (data: IReadFile["data"]) => IValidFile;
  convectToBson: (data: TypeDataJSON) => TypeDataBSON;
  convectToJson: (data: TypeDataBSON) => TypeDataJSON;
  writeFile: (
    path: TypePath,
    fileName: string,
    data: any
  ) => Promise<IWriteFile>;
  //   toBsonFile: (path: TypePath) => void;
  //   toJsonFile: (path: TypePath) => void;
}

class ConvectorBsonJson implements IConvectorBsonJson {
  constructor(protected schema: Schema) {}
  readJsonOrBsonFile = async (path: TypePath) => {
    try {
      await access(path, constants.R_OK | constants.W_OK);
      const fileName = basename(path);
      const dataPromise = readFile(path, { encoding: "utf8" });
      const data = await dataPromise.catch((e) => null);
      if (!data) return { status: false };
      return { status: true, data, fileName };
    } catch (error) {
      return { status: false };
    }
  };
  validate = (data: any) => {
    const v = new Validator();
    const change = v.validate(data, this.schema);
    if (change.valid) return { status: true, data };
    return { status: false };
  };
  convectToBson = (data: any) => {
    const doc = serialize(data);
    return doc;
  };
  convectToJson = (data: any) => {
    const json = deserialize(data);
    return json;
  };
  writeFile = async (path: string, fileName: string, data: any) => {
    try {
      if (!existsSync(path)) {
        try {
          await mkdir(path, { recursive: true });
        } catch (error) {
          console.error(error);
        }
      }
      writeFile(join(path, fileName), data);
      return { status: true, path: join(path, fileName) };
    } catch (error) {
      return { status: false };
    }
  };
}

export default ConvectorBsonJson;
