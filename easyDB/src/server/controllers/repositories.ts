import Hapi from "hapi";
import { Repository } from "../../classes/Repository";
import { collection } from "./collections";

const repository = new Repository(collection);

const getAllValues: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName } = payload as {
    dbName: string;
    collName: string;
  };

  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  return repository.getAll();
};

const getAllValuesWithDel: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName } = payload as {
    dbName: string;
    collName: string;
  };

  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  return repository.getAllandDel();
};

const getAllValuesRange: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, start, end } = payload as {
    dbName: string;
    collName: string;
    start: number;
    end: number;
  };

  if (start > end)
    return {
      message: "Некорректный диапазон",
      done: false,
    };

  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  return repository.getAllRange(start, end);
};

const findByValue: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, find } = payload as {
    dbName: string;
    collName: string;
    find: string;
  };
  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  const result = await repository.findByValue(find);
  return result
    ? result
    : {
        message: "некорерктный запрос, проверте вводимые данные",
        done: false,
      };
};

const setValue: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, value } = payload as {
    dbName: string;
    collName: string;
    value: string;
  };
  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  const result = await repository.setValue(value);
  return result;
};

const changeValue: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, value, key } = payload as {
    dbName: string;
    collName: string;
    key: number;
    value: string;
  };
  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  const result = await repository.changeValue(key, value);
  return result;
};

const getById: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, key } = payload as {
    dbName: string;
    collName: string;
    key: number;
  };
  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  const result = await repository.getById(key);
  return result;
};

const deleteByKey: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, key } = payload as {
    dbName: string;
    collName: string;
    key: number;
  };
  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  const result = await repository.deleteByKey(key);
  return result;
};

const deleteByKeySoft: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { dbName, collName, key } = payload as {
    dbName: string;
    collName: string;
    key: number;
  };
  const changeDB = await repository.initRepository(dbName, collName);
  if (!changeDB)
    return {
      message: "такой базы данных или коллекции не существует не существует",
      done: false,
    };
  const result = await repository.deleteByKeySoft(key);
  return result;
};

export default {
  getAllValues,
  getAllValuesWithDel,
  findByValue,
  setValue,
  changeValue,
  getById,
  deleteByKey,
  deleteByKeySoft,
  getAllValuesRange,
};
