import Joi from "joi";
import Hapi from "@hapi/hapi";
import сontroller from "../controllers/testController";
import description from "./description";
import schema from "./schema";
const { requestSchema } = schema;

const testRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/correct-ya",
    options: {
      handler: сontroller.yaSpellDesc,
      description: description.yaSpellDesc.description,
      notes: description.yaSpellDesc.notes,
      tags: ["api"],
      validate: {
        payload: requestSchema,
      },
    },
  },
  {
    method: "POST",
    path: "/api/correct-nspell",
    options: {
      handler: сontroller.nSpellDesc,
      description: description.nSpellDesc.description,
      notes: description.nSpellDesc.notes,
      tags: ["api"],
      validate: {
        payload: requestSchema,
      },
    },
  },
];

export default testRoute;
