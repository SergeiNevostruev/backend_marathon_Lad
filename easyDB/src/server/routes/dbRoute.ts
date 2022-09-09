import Joi from "joi";
import Hapi from "@hapi/hapi";
import databases, { db } from "../controllers/databases";
import {
  schemaDBname,
  schemaDBnameEnterySize,
  schemaDBnameEnterySizeOpt,
} from "./schema";

const dbRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/db/create",
    options: {
      handler: databases.create,
      description: "create database",
      notes: "create database (KeyType = 'simple' | 'any-number')",
      tags: ["api", "Databases"],
      validate: {
        payload: schemaDBnameEnterySizeOpt,
      },
    },
  },
  {
    method: "POST",
    path: "/api/db/delete",
    options: {
      handler: databases.deleteDB,
      description: "delete databases",
      notes: "delete databases",
      tags: ["api", "Databases"],
      validate: {
        payload: schemaDBname,
      },
    },
  },
  {
    method: "POST",
    path: "/api/db/delete-soft",
    options: {
      handler: databases.deleteDBSoft,
      description: "soft delete databases",
      notes: "soft delete databases",
      tags: ["api", "Databases"],
      validate: {
        payload: schemaDBname,
      },
    },
  },
  {
    method: "GET",
    path: "/api/db/get-all-db",
    options: {
      handler: async () => db.getNamesDB(),
      description: "Get all Databases names",
      notes: "Get all Databases names",
      tags: ["api", "Databases"],
    },
  },
  {
    method: "GET",
    path: "/api/db/get-all-db-and-del",
    options: {
      handler: async () => db.getNamesDBAllfs(),
      description: "Get all Databases names with soft delete",
      notes: "Get all Databases names",
      tags: ["api", "Databases"],
    },
  },
];

export default dbRoute;
