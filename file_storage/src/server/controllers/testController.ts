import * as Hapi from "@hapi/hapi";
import boom from "@hapi/boom";
import internal, { Readable } from "stream";
import { join } from "path";
import { filePath } from "../lib/server";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { createGzip, createUnzip } from "zlib";
import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { pipeline } from "stream/promises";
import {
  checkFileInDB,
  createUserInDB,
  delFileInDB,
  delUserInDB,
  getFilesUserDB,
  getUserKeyDB,
  setFileInDB,
} from "./helper";

const algorithm = "aes-192-cbc";
const password = "Password used to generate key";
// const key = scryptSync(password, "salt", 24);
// The IV is usually passed along with the ciphertext.
const iv = Buffer.alloc(16, 0); // Initialization vector.

const createUser: Hapi.Lifecycle.Method = async (request, h) => {
  const { user, key } = request.payload as { user: string; key: string };
  const userPath = join(filePath, user);
  const userDB = await createUserInDB(user, key);
  if (userDB.done) {
    await mkdir(userPath);
  } else {
    await delUserInDB(user);
  }
  return userDB.value;
};

const cryptAndGzip: Hapi.Lifecycle.Method = async (request, h) => {
  try {
    const { stream, filename, user } = request.payload as {
      stream: Readable;
      filename: string;
      user: string;
    };
    const pathFile = join(filePath, user, filename);

    if (!existsSync(pathFile)) {
      await writeFile(pathFile, "");
    }
    const keyCheck = await getUserKeyDB(user);
    // console.log(keyCheck);
    if (!keyCheck.done) return keyCheck.value;
    const gzip = createGzip();
    const cipher = createCipheriv(algorithm, keyCheck.value, iv);
    const writeStream = createWriteStream(pathFile);
    await pipeline(stream, cipher, gzip, writeStream);
    const setToDB = await setFileInDB(user, filename);
    return filename + " создан";
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const decryptAndUnGzip: Hapi.Lifecycle.Method = async (request, h) => {
  try {
    // const pathFile = join(filePath, "new File.jpg.gz");
    // const pathFile2 = join(filePath, "new File.jpg");
    const { filename, user } = request.payload as {
      filename: string;
      user: string;
    };
    const pathFile = join(filePath, user, filename);
    if (!existsSync(pathFile)) {
      return "такого файла не существует";
    }
    const keyCheck = await getUserKeyDB(user);
    // console.log(keyCheck);

    if (!keyCheck.done) return "несуществующий пользователь";
    const unzip = createUnzip();
    const decipher = createDecipheriv(algorithm, keyCheck.value, iv);
    // const writeStream = createWriteStream(pathFile2);
    const readStream = createReadStream(pathFile);
    const channel = readStream.pipe(unzip).pipe(decipher);
    // await pipeline(readStream, unzip, decipher, writeStream);
    // return "end";
    return h
      .response(channel)
      .header("content-disposition", "attachment")
      .header("filename", filename);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const deleteFile: Hapi.Lifecycle.Method = async (request, h) => {
  try {
    const { filename, user } = request.payload as {
      filename: string;
      user: string;
    };
    const pathFile = join(filePath, user, filename);
    if (!existsSync(pathFile)) {
      return "no files";
    }
    await rm(pathFile);
    const response = await delFileInDB(user, filename);
    return response.value;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getUserFiles: Hapi.Lifecycle.Method = async (request, h) => {
  const { user } = request.payload as {
    user: string;
  };
  return await getFilesUserDB(user);
};

export default {
  cryptAndGzip,
  decryptAndUnGzip,
  deleteFile,
  createUser,
  getUserFiles,
};
