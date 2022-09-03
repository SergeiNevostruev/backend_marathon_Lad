import Joi from "joi";
import Hapi from "@hapi/hapi";
import databases, { db } from "../controllers/databases";

// const { requestSchema } = schema;

const testRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/db/create",
    options: {
      handler: databases.create,
      description: "create database",
      notes: "create database",
      tags: ["api", "Databases"],
      validate: {
        payload: Joi.object({
          dbname: Joi.string()
            .required()
            .min(3)
            .max(20)
            .example("database_one"),
          oneEntrySize: Joi.number().min(5).max(500).example(256),
        }),
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
        payload: Joi.object({
          dbname: Joi.string()
            .required()
            .min(3)
            .max(20)
            .example("database_one"),
        }),
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
        payload: Joi.object({
          dbname: Joi.string()
            .required()
            .min(3)
            .max(20)
            .example("database_one"),
        }),
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
  {
    method: "POST",
    path: "/api/test2",
    options: {
      handler: () => "test2",
      description: "Databases",
      notes: "Api databases",
      tags: ["api", "Collections"],
      // plugins: {
      //   "hapi-swagger": {
      //     order: 3,
      //   },
      // },
      // validate: {
      //   payload: requestSchema,
      // },
    },
  },
  {
    method: "POST",
    path: "/api/test3",
    options: {
      handler: () => "test2",
      description: "Databases",
      notes: "Api databases",
      tags: ["api", "Collections"],
      // plugins: {
      //   "hapi-swagger": {
      //     order: 4,
      //   },
      // },
      // validate: {
      //   payload: requestSchema,
      // },
    },
  },
  {
    method: "POST",
    path: "/api/test4",
    options: {
      handler: () => "test4",
      description: "Databases",
      notes: "Api databases",
      tags: ["api", "Repository"],
      // plugins: {
      //   "hapi-swagger": {
      //     order: 4,
      //   },
      // },
      // validate: {
      //   payload: requestSchema,
      // },
    },
  },
  // {
  //   method: "POST",
  //   path: "/api/correct-nspell",
  //   options: {
  //     handler: сontroller.nSpellDesc,
  //     description: description.nSpellDesc.description,
  //     notes: description.nSpellDesc.notes,
  //     tags: ["api"],
  //     validate: {
  //       payload: requestSchema,
  //     },
  //   },
  // },
];

export default testRoute;
