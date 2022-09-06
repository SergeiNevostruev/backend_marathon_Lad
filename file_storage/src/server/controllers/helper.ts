import { scryptSync } from "crypto";
import { existsSync } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";

interface IUser {
  name: string;
  key: string;
  path: string;
  files: string[];
}
interface IPseudoDB {
  [user: string]: IUser;
}
const filePath = join(__dirname, "..", "..", "..", "files");
export const pseudoDbPath = join(filePath, "pseudoDb.json");

export const createUserInDB = async (
  name: string,
  key: string
): Promise<{ done: boolean; value: IUser | string }> => {
  const userPath = join(filePath, name);
  if (existsSync(userPath)) {
    return { done: false, value: "такой пользователь существует" };
  }

  const user: IUser = {
    name,
    key,
    path: userPath,
    files: [],
  };
  try {
    if (!existsSync(pseudoDbPath)) {
      await writeFile(pseudoDbPath, JSON.stringify({ [name]: user }, null, 2));
    } else {
      const users = JSON.parse(
        await readFile(pseudoDbPath, "utf8")
      ) as IPseudoDB;
      users[name] = user;
      await writeFile(pseudoDbPath, JSON.stringify(users, null, 2));
    }

    return { done: true, value: user };
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка JSON" };
  }
};

export const setFileInDB = async (user: string, fileName: string) => {
  try {
    const userPath = join(filePath, user);
    await access(userPath);
    await access(pseudoDbPath);
    const users = JSON.parse(await readFile(pseudoDbPath, "utf8")) as IPseudoDB;
    if (!users[user]) return { done: false, value: "ошибка записи" };
    if (users[user].files.includes(fileName))
      return { done: false, value: "такое имя файла существует" };
    users[user].files = [...users[user].files, fileName];
    await writeFile(pseudoDbPath, JSON.stringify(users, null, 2));
    return { done: true, value: users[user] };
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка записи" };
  }
};

export const delFileInDB = async (user: string, fileName: string) => {
  try {
    const userPath = join(filePath, user);
    await access(userPath);
    await access(pseudoDbPath);
    const users = JSON.parse(await readFile(pseudoDbPath, "utf8")) as IPseudoDB;
    if (!users[user]) return { done: false, value: "ошибка записи" };
    if (!users[user].files.includes(fileName))
      return { done: false, value: "такого файла не существует" };
    users[user].files = users[user].files.filter((v) => v !== fileName);
    await writeFile(pseudoDbPath, JSON.stringify(users, null, 2));
    return { done: true, value: "файл удален" };
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка записи" };
  }
};

export const delUserInDB = async (user: string) => {
  try {
    const userPath = join(filePath, user);
    await access(userPath);
    await access(pseudoDbPath);
    const users = JSON.parse(await readFile(pseudoDbPath, "utf8")) as IPseudoDB;
    if (!users[user])
      return { done: false, value: "такого файла не существует" };
    delete users[user];
    await writeFile(pseudoDbPath, JSON.stringify(users, null, 2));
    return { done: true, value: "файл удален" };
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка записи" };
  }
};

export const checkFileInDB = async (user: string, fileName: string) => {
  try {
    const userPath = join(filePath, user);
    await access(userPath);
    await access(pseudoDbPath);
    const users = JSON.parse(await readFile(pseudoDbPath, "utf8")) as IPseudoDB;
    if (!users[user])
      return { done: false, value: "такого пользователя не существует" };
    if (!users[user].files.includes(fileName)) {
      return { done: false, value: "такого файла не существует" };
    } else {
      return { done: true, value: users[user] };
    }
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка записи" };
  }
};

export const getUserKeyDB = async (user: string) => {
  try {
    const userPath = join(filePath, user);
    await access(userPath);
    await access(pseudoDbPath);
    const users = JSON.parse(await readFile(pseudoDbPath, "utf8")) as IPseudoDB;
    console.log(users);

    if (!users[user])
      return { done: false, value: "такого пользователя не существует" };
    return { done: true, value: scryptSync(users[user].key, "salt", 24) };
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка записи" };
  }
};

export const getFilesUserDB = async (user: string) => {
  try {
    const userPath = join(filePath, user);
    await access(userPath);
    await access(pseudoDbPath);
    const users = JSON.parse(await readFile(pseudoDbPath, "utf8")) as IPseudoDB;
    if (!users[user])
      return { done: false, value: "такого пользователя не существует" };
    return { done: true, value: users[user].files };
  } catch (error) {
    console.log(error);
    return { done: false, value: "ошибка записи" };
  }
};
