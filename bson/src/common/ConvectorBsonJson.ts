import { Schema } from "jsonschema";
import { access, readFile, mkdir, writeFile } from "fs/promises";
import { constants, existsSync, mkdirSync } from "fs";
import { Validator } from "jsonschema";
import { deserialize, serialize } from "bson";
import { join, parse } from "path";
import returnText from "./returnText";
import config from "../../config";

const {
  errorReadFile,
  errorValidFile,
  errorWriteFile,
  successBsonConvect,
  errorBsonFile,
} = returnText;

type TypeDataBSON = any;
type TypeDataJSON = any;
type TypePath = string;

interface IStatusToDo {
  status: boolean;
  fileName?: string;
}

interface IReadFile extends IStatusToDo {
  data?: TypeDataJSON | Buffer | null;
}

interface IValidFile extends IStatusToDo {
  data?: TypeDataJSON | null;
}

interface IWriteFile extends IStatusToDo {
  path?: TypePath | null;
}

interface IConvectorBsonJson {
  readJsonOrBsonFile: (path: TypePath, buffer: boolean) => Promise<IReadFile>;
  validate: (data: IReadFile["data"]) => IValidFile;
  convectToBson: (data: TypeDataJSON) => TypeDataBSON;
  convectToJson: (data: TypeDataBSON) => TypeDataJSON;
  writeFile: (
    path: TypePath,
    fileName: string,
    data: any
  ) => Promise<IWriteFile>;
  toBsonFile: (path: TypePath) => void;
  toJsonFile: (path: TypePath) => void;
}

class ConvectorBsonJson implements IConvectorBsonJson {
  constructor(protected schema: Schema) {}
  readJsonOrBsonFile = async (path: TypePath, buffer = false) => {
    try {
      await access(path, constants.R_OK | constants.W_OK);
      const fileName = parse(path).name;
      const dataPromise = buffer
        ? readFile(path)
        : readFile(path, { encoding: "utf8" });
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
    const dataJson = JSON.parse(data);
    const doc = serialize(dataJson);
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
  toBsonFile = async (path: string) => {
    const file = await this.readJsonOrBsonFile(path);
    if (!file.status || !file.fileName) {
      console.log(errorReadFile);
      return false;
    }
    const validFile = this.validate(file.data);
    if (!validFile.status) {
      console.log(errorValidFile);
      return false;
    }
    const bsonFile = this.convectToBson(validFile.data);
    const pathWriteFile = await this.writeFile(
      config.outDir,
      file.fileName + ".bson",
      bsonFile
    );
    if (!pathWriteFile.status) {
      console.log(errorWriteFile);
      return false;
    }
    console.log(successBsonConvect, pathWriteFile.path);
    return pathWriteFile.path;
  };
  toJsonFile = async (path: string) => {
    const file = await this.readJsonOrBsonFile(path, true);
    if (!file.status || !file.fileName) {
      console.log(errorReadFile);
      return false;
    }
    console.log(file.data);
    try {
      const jsonFile = JSON.stringify(this.convectToJson(file.data));
      const pathWriteFile = await this.writeFile(
        config.outDir,
        file.fileName + ".json",
        jsonFile
      );
      if (!pathWriteFile.status) {
        console.log(errorWriteFile);
        return false;
      }
      console.log(successBsonConvect, pathWriteFile.path);
      return pathWriteFile.path;
    } catch (error) {
      console.log(errorBsonFile);
      return false;
    }
  };
}

export default ConvectorBsonJson;
