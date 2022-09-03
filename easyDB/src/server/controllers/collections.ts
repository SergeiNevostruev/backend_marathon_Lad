import Hapi from "hapi";
import { Collections } from "../../classes/Collections";
import { db } from "./databases";

export const collection = new Collections(db);

const getColletctions: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName } = payload as {
    dbName: string;
  };
  const changeDB = await collection.connectDB(dbName);
  if (!changeDB)
    return { message: "такой базы данных не существует", done: false };

  return await collection.getNamesCollection();
};

const getColletctionsWithDel: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName } = payload as {
    dbName: string;
  };
  const changeDB = await collection.connectDB(dbName);
  if (!changeDB)
    return { message: "такой базы данных не существует", done: false };

  return await collection.getNamesCollectionAll();
};

const createColletctions: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName } = payload as {
    dbName: string;
    collName: string;
  };
  const changeDB = await collection.connectDB(dbName);
  if (!changeDB)
    return { message: "такой базы данных не существует", done: false };
  const result = await collection.createCollection(collName);
  return result
    ? {
        message: `Коллекция ${collName} в базе данных ${collName} создана`,
        done: true,
      }
    : { message: "Не получилось создать колелкцию", done: false };
};

const deleteColletctions: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName } = payload as {
    dbName: string;
    collName: string;
  };
  const changeDB = await collection.connectDB(dbName);
  if (!changeDB)
    return { message: "такой базы данных не существует", done: false };
  const result = await collection.deleteCollection(collName);
  return result
    ? {
        message: `Коллекция ${collName} удалена из базы данных ${dbName}`,
        done: true,
      }
    : { message: "Не получилось удалить коллекцию", done: false };
};

const deleteColletctionsSoft: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName } = payload as {
    dbName: string;
    collName: string;
  };
  const changeDB = await collection.connectDB(dbName);
  if (!changeDB)
    return { message: "такой базы данных не существует", done: false };
  const result = await collection.deleteCollectionSoft(collName);
  return result
    ? {
        message: `Коллекция ${collName} удалена из базы данных ${collName} создана`,
        done: true,
      }
    : { message: "Не получилось удалить колелкцию", done: false };
};

export default {
  getColletctions,
  getColletctionsWithDel,
  createColletctions,
  deleteColletctions,
  deleteColletctionsSoft,
};
