import Joi from "joi";
import Hapi from "@hapi/hapi";
import testController from "../controllers/testController";

const testRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/create-user",
    options: {
      handler: testController.createUser,
      description: "Create user",
      notes: "Upload FILE",
      tags: ["api"],
      validate: {
        payload: Joi.object({
          user: Joi.string()
            .min(3)
            .max(10)
            .regex(new RegExp("\\w"))
            .required()
            .example("user"),
          key: Joi.string().min(1).max(20).required().example("key for files"),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/api/upload",
    options: {
      handler: testController.cryptAndGzip,
      description: "Upload FILE",
      notes: "Upload FILE",
      tags: ["api"],
      plugins: {
        "hapi-swagger": {
          payloadType: "form",
        },
      },
      validate: {
        payload: Joi.object({
          user: Joi.string().required().example("user"),
          filename: Joi.string().required().example("newFile"),
          stream: Joi.any().meta({ swaggerType: "file" }).required(),
        }),
      },
      payload: {
        maxBytes: 209715200,
        parse: true,
        multipart: { output: "stream" },
      },
    },
  },
  {
    method: "POST",
    path: "/api/delete",
    options: {
      handler: testController.deleteFile,
      description: "Delete FILE",
      notes: "Delete FILE",
      validate: {
        payload: Joi.object({
          user: Joi.string().required().example("user"),
          filename: Joi.string().required().example("newFile"),
        }),
      },
      tags: ["api"],
    },
  },
  {
    method: "POST",
    path: "/api/load",
    options: {
      handler: testController.decryptAndUnGzip,
      description: "Get FILE",
      notes: "Get FILE",
      validate: {
        payload: Joi.object({
          user: Joi.string().required().example("user"),
          filename: Joi.string().required().example("newFile"),
        }),
      },
      tags: ["api"],
      response: {
        options: {
          allowUnknown: true,
        },
      },
    },
  },
  {
    method: "POST",
    path: "/api/files",
    options: {
      handler: testController.getUserFiles,
      description: "Get user FILES",
      notes: "Get user FILES",
      validate: {
        payload: Joi.object({
          user: Joi.string().required().example("user"),
        }),
      },
      tags: ["api"],
      response: {
        options: {
          allowUnknown: true,
        },
      },
    },
  },
];

export default testRoute;
