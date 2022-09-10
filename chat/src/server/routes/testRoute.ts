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
      notes: "Create user",
      tags: ["api"],
      validate: {
        payload: Joi.object({
          name: Joi.string()
            .min(3)
            .max(20)
            .regex(new RegExp("\\w"))
            .required()
            .example("Volodya"),
          email: Joi.string().email().required().example("volodya@rambler.ru"),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/api/users",
    options: {
      handler: testController.getUsers,
      description: "Get users",
      notes: "Get users",
      tags: ["api"],
    },
  },
  {
    method: "POST",
    path: "/api/input-user",
    options: {
      handler: testController.inputUser,
      description: "Input user",
      notes: "Input user",
      tags: ["api"],
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().example("volodya@rambler.ru"),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/api/create-room",
    options: {
      handler: testController.createRoom,
      description: "Create room",
      notes: "Create room",
      tags: ["api"],
      validate: {
        payload: Joi.object({
          userId: Joi.string().required().example("631cc25c06ed58aaeedc1c5d"),
          roomTitle: Joi.string().min(3).max(20).required().example("Room #1"),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/api/rooms",
    options: {
      handler: testController.getRooms,
      description: "Get rooms",
      notes: "Get rooms",
      tags: ["api"],
    },
  },
  {
    method: "POST",
    path: "/api/input-room",
    options: {
      handler: testController.inputRoom,
      description: "Input room",
      notes: "Input room",
      tags: ["api"],
      validate: {
        payload: Joi.object({
          userId: Joi.string().required().example("631cc25c06ed58aaeedc1c5d"),
          roomId: Joi.string().required().example("631cc25c06ed58aaeedc1c5d"),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/api/message",
    options: {
      handler: testController.writeMessage,
      description: "For testing database. Send message",
      notes: "Send message",
      tags: ["api"],
      validate: {
        payload: Joi.object({
          userId: Joi.string().required().example("631cc25c06ed58aaeedc1c5d"),
          roomId: Joi.string().required().example("631cc25c06ed58aaeedc1c5d"),
          message: Joi.string().required().example("Your message"),
        }),
      },
    },
  },
];

export default testRoute;
