import Joi from "joi";
import Hapi from "@hapi/hapi";
import сontroller from "../controllers/testController";
import internal, { Readable } from "stream";
import { join } from "path";
import { filePath } from "../lib/server";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { rm, writeFile } from "fs/promises";
import { createGzip, createUnzip } from "zlib";
import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { pipeline } from "stream/promises";

const algorithm = "aes-192-cbc";
const password = "Password used to generate key";
const key = scryptSync(password, "salt", 24);
// The IV is usually passed along with the ciphertext.
const iv = Buffer.alloc(16, 0); // Initialization vector.

const testRoute: Hapi.ServerRoute[] = [
  {
    method: "POST",
    path: "/api/upload",
    options: {
      handler: async (request, h) => {
        try {
          const { stream } = request.payload as { stream: Readable };
          const pathFile = join(filePath, "new File.jpg.gz");

          if (!existsSync(pathFile)) {
            await writeFile(pathFile, "");
          }
          const gzip = createGzip();
          const cipher = createCipheriv(algorithm, key, iv);
          const writeStream = createWriteStream(pathFile);
          await pipeline(stream, cipher, gzip, writeStream);
          return "end";
        } catch (error) {
          console.log(error);
          return "error";
        }
      },
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
          stream: Joi.any().meta({ swaggerType: "file" }),
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
    method: "DELETE",
    path: "/api/upload",
    options: {
      handler: async (request, h) => {
        try {
          const pathFile = join(filePath, "new File.jpg.gz");
          if (!existsSync(pathFile)) {
            return "no files";
          }
          await rm(pathFile);
          return "end";
        } catch (error) {
          console.log(error);
          return "error";
        }
      },
      description: "Delete FILE",
      notes: "Delete FILE",
      tags: ["api"],
    },
  },
  {
    method: "GET",
    path: "/api/upload",
    options: {
      handler: async (request, h) => {
        try {
          const pathFile = join(filePath, "new File.jpg.gz");
          const pathFile2 = join(filePath, "new File.jpg");
          if (!existsSync(pathFile)) {
            await writeFile(pathFile, "");
          }
          if (!existsSync(pathFile2)) {
            await writeFile(pathFile2, "");
          }
          const unzip = createUnzip();
          const decipher = createDecipheriv(algorithm, key, iv);
          const writeStream = createWriteStream(pathFile2);
          const readStream = createReadStream(pathFile);
          await pipeline(readStream, unzip, decipher, writeStream);
          return "end";
        } catch (error) {
          console.log(error);
          return "error";
        }
      },
      description: "Upload FILE",
      notes: "Upload FILE",
      tags: ["api"],
      // plugins: {
      //   "hapi-swagger": {
      //     payloadType: "form",
      //   },
      // },
      // validate: {
      //   payload: Joi.object({
      //     stream: Joi.any().meta({ swaggerType: "file" }),
      //   }),
      // },
      // payload: {
      //   maxBytes: 209715200,
      //   parse: true,
      //   multipart: { output: "stream" },
      // },
    },
  },
];

export default testRoute;
