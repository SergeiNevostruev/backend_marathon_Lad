import Hapi from "hapi";
import { DataBases } from "../../classes/DataBases";
import { FileStructure } from "../../classes/FileStructure";
import { FileSystemDB } from "../../classes/FileSystem";

const fsDB = new FileSystemDB();
export const fsStruct = new FileStructure(fsDB);
export const db = new DataBases(fsStruct);

const create: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbname, oneEntrySize } = payload as {
    dbname: string;
    oneEntrySize: number;
  };
  if (await db.initDB(dbname))
    return { message: "такая база данных уже существует", done: false };
  await db.createNewBD(dbname, "simple", "string", oneEntrySize);

  return { message: `${dbname} создана`, done: true };
};

const deleteDB: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbname } = payload as {
    dbname: string;
  };
  if (!(await db.initDB(dbname)))
    return { message: "такой базы данных не существует", done: false };
  const result = await db.deleteBD(dbname);
  return result;
};

const deleteDBSoft: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbname } = payload as {
    dbname: string;
  };
  if (!(await db.initDB(dbname)))
    return { message: "такой базы данных не существует", done: false };
  const result = await db.deleteBDsoft(dbname);
  return result;
};

export default { create, deleteDB, deleteDBSoft };
