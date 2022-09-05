import Joi from "joi";
import Hapi from "@hapi/hapi";
import databases, { db } from "../controllers/databases";
import repositories from "../controllers/repositories";
import {
  schemeDBnameCollect,
  schemeDBnameCollectKey,
  schemeDBnameCollectRange,
  schemeDBnameCollectSearchValue,
  schemeDBnameCollectValue,
  schemeDBnameCollectValueKey,
} from "./schema";

// ========================== Схемы ===============================================

// ================================================================================

const reposRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/repository/get-all-values",
    options: {
      handler: repositories.getAllValues,
      description: "Get all values in collection that database",
      notes: "Get all values in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollect,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/get-all-values-with-del",
    options: {
      handler: repositories.getAllValuesWithDel,
      description: "Get all values with deleted in collection that database",
      notes: "Get all values with deleted in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollect,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/get-all-values-range",
    options: {
      handler: repositories.getAllValuesRange,
      description: "Get all values in range in collection that database",
      notes: "Get all values in range in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectRange,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/find",
    options: {
      handler: repositories.findByValue,
      description: "Find values in collection that database",
      notes: "Find values in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectSearchValue,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/set-value",
    options: {
      handler: repositories.setValue,
      description: "Set value in collection that database",
      notes: "Set value in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectValue,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/change-value",
    options: {
      handler: repositories.changeValue,
      description: "change value in collection that database",
      notes: "change value in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectValueKey,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/get-by-id",
    options: {
      handler: repositories.getById,
      description: "Set value by id in collection that database",
      notes: "Set value by id in collection that database",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectKey,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/delete-by-key",
    options: {
      handler: repositories.deleteByKey,
      description: "Set value in collection that database",
      notes: "Api databases",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectKey,
      },
    },
  },
  {
    method: "POST",
    path: "/api/repository/delete-by-key-soft",
    options: {
      handler: repositories.deleteByKeySoft,
      description: "Set value in collection that database",
      notes: "Api databases",
      tags: ["api", "Repository"],
      validate: {
        payload: schemeDBnameCollectKey,
      },
    },
  },
];

export default reposRoute;
