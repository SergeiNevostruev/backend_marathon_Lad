import Hapi from "hapi";
import { DataBases } from "../../classes/DataBases";
import { FileStructure } from "../../classes/FileStructure";
import { FileSystemDB } from "../../classes/FileSystem";
import { KeysTypeDB } from "../../interface";

const fsDB = new FileSystemDB();
export const fsStruct = new FileStructure(fsDB);
export const db = new DataBases(fsStruct);

const create: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, oneEntrySize, keyType } = payload as {
    dbName: string;
    oneEntrySize: number;
    keyType: KeysTypeDB;
  };
  if (await db.initDB(dbName))
    return { message: "такая база данных уже существует", done: false };
  await db.createNewBD(dbName, keyType || "simple", "string", oneEntrySize);

  return { message: `${dbName} создана`, done: true };
};

const deleteDB: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName } = payload as {
    dbName: string;
  };
  if (!(await db.initDB(dbName)))
    return { message: "такой базы данных не существует", done: false };
  const result = await db.deleteBD(dbName);
  return result;
};

const deleteDBSoft: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName } = payload as {
    dbName: string;
  };
  if (!(await db.initDB(dbName)))
    return { message: "такой базы данных не существует", done: false };
  const result = await db.deleteBDsoft(dbName);
  return result;
};

export default { create, deleteDB, deleteDBSoft };
