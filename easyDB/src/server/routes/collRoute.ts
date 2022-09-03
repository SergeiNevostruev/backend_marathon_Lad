import Joi from "joi";
import Hapi from "@hapi/hapi";
import collections from "../controllers/collections";
import { schemaDBname, schemeDBnameCollect } from "./schema";

const collRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/collection/get-all-collection",
    options: {
      handler: collections.getColletctions,
      description: "Get all collection in that database",
      notes: "Get all collection in that database",
      tags: ["api", "Collections"],
      validate: {
        payload: schemaDBname,
      },
    },
  },
  {
    method: "POST",
    path: "/api/collection/get-all-collection-and-del",
    options: {
      handler: collections.getColletctionsWithDel,
      description: "Get all collection in that database and deleted collection",
      notes: "Get all collection in that database and deleted collection",
      tags: ["api", "Collections"],
      validate: {
        payload: schemaDBname,
      },
    },
  },
  {
    method: "POST",
    path: "/api/collection/create-collection",
    options: {
      handler: collections.createColletctions,
      description: "create collection in that database",
      notes: "create collection in that database",
      tags: ["api", "Collections"],
      validate: {
        payload: schemeDBnameCollect,
      },
    },
  },
  {
    method: "POST",
    path: "/api/collection/delete-collection",
    options: {
      handler: collections.deleteColletctions,
      description: "delete collection in that database",
      notes: "delete collection in that database",
      tags: ["api", "Collections"],
      validate: {
        payload: schemeDBnameCollect,
      },
    },
  },
  {
    method: "POST",
    path: "/api/collection/delete-collection-soft",
    options: {
      handler: collections.deleteColletctionsSoft,
      description: "soft delete collection in that database",
      notes: "soft delete collection in that database",
      tags: ["api", "Collections"],
      validate: {
        payload: schemeDBnameCollect,
      },
    },
  },
];

export default collRoute;
