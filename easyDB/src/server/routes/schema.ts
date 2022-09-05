import Joi from "joi";
import { db } from "../controllers/databases";

export const schemaDBnameEnterySize = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  oneEntrySize: Joi.number().min(5).max(500).example(256),
}).label("DB and entry size name for create");

export const schemaDBname = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
}).label("DB name");

export const schemeDBnameCollect = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  collName: Joi.string().required().min(3).max(20).example("collection_one"),
}).label("Collection and db names");

export const schemeDBnameCollectRange = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  collName: Joi.string().required().min(3).max(20).example("collection_one"),
  start: Joi.number().required().example(1),
  enf: Joi.number().required().example(5),
}).label("Collection and db names, and range");

export const schemeDBnameCollectSearchValue = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  collName: Joi.string().required().min(3).max(20).example("collection_one"),
  find: Joi.string().required().max(50).example("find value"),
}).label("Collection, db names and search value");

export const schemeDBnameCollectValue = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  collName: Joi.string().required().min(3).max(20).example("collection_one"),
  value: Joi.string()
    .required()
    .min(3)
    .max(db.db?.OneEntrySize || 256)
    .example("value"),
}).label("Collection, db names and value");

export const schemeDBnameCollectValueKey = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  collName: Joi.string().required().min(3).max(20).example("collection_one"),
  key: Joi.number().required().min(0).max(4294967295).example(1),
  value: Joi.string()
    .required()
    .min(3)
    .max(db.db?.OneEntrySize || 256)
    .example("My value"),
}).label("Collection, db names, key and value");

export const schemeDBnameCollectKey = Joi.object({
  dbName: Joi.string().required().min(3).max(20).example("database_one"),
  collName: Joi.string().required().min(3).max(20).example("collection_one"),
  key: Joi.number().required().min(0).max(4294967295).example(1),
}).label("Collection, db names and key");
