import { close, createReadStream, createWriteStream, ReadStream } from "fs";
import { access, open, readFile, writeFile } from "fs/promises";
import { number } from "joi";
import { join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { TryCatch } from "../decorators";
import {
  ICollections,
  ICollectionStructure,
  IDataBases,
  IDataBaseStructure,
  IEntityStructure,
  IRepository,
  ISearchKeyTree,
  KeysTypeDB,
  KeyTypeEntity,
  ValuesTypeDB,
  ValuesTypeEntity,
} from "../interface";

export class Repository implements IRepository {
  public initCollection: ICollectionStructure | undefined;
  public codeType = {
    string: 0x01,
    "big string": 0x02,
    file: 0x03,
    mix: 0x04,
  };
  public addByte = 17;
  constructor(public collect: ICollections) {}

  async initRepository(dbName: string, collName: string) {
    const checkDB = await this.collect.db.initDB(dbName);
    if (!checkDB) {
      console.log("Некорректное наименование базы данных");
      return false;
    }
    const checkColl = await this.collect.connectCollection(collName);
    this.initCollection = checkColl.collection;
    return true;
  }

  @TryCatch("Проблемы с проверкой карты коллекция")
  private async writeCollMap(
    data: number,
    mapKey: "lastOffset" | "empty",
    delEmptyOffset: boolean = false
  ) {
    if (!this.initCollection || !this.collect.db.db) {
      console.log("Не инициализирована коллекция");
      throw new Error("Не инициализирована коллекция");
    }
    const mapCollPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.collect.db.db.folderDbPath,
      "collections",
      this.initCollection.name + this.initCollection.expansionFile,
      this.initCollection.mapColl
    );
    await access(mapCollPath);
    const oldCollMap = await readFile(mapCollPath, "utf8");
    const oldCollMapJson = JSON.parse(oldCollMap) as ICollectionStructure;
    if (mapKey === "lastOffset") {
      oldCollMapJson[mapKey] = data;
    }
    if (mapKey === "empty" && !delEmptyOffset) {
      if (!oldCollMapJson[mapKey].includes(data))
        oldCollMapJson[mapKey] = [...oldCollMapJson[mapKey], data];
    }
    if (mapKey === "empty" && delEmptyOffset) {
      oldCollMapJson[mapKey] = oldCollMapJson[mapKey].filter((v) => v !== data);
    }

    await writeFile(mapCollPath, JSON.stringify(oldCollMapJson, null, 2));
  }

  @TryCatch("Проблемы с инициализацией")
  private async getOffsetForKey(
    KeysTypeDB: KeysTypeDB,
    key: KeyTypeEntity
  ): Promise<number> {
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (KeysTypeDB === "simple" && typeof key === "number") {
      return +key * (+this.initCollection.maxSize + +this.addByte);
    }
    if (KeysTypeDB === "any-number" && typeof key === "number") {
      if (!this.collect.db.db)
        throw new Error("Не инициализирована база данных");
      const mapCollPath = join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.collect.db.db.folderDbPath,
        "collections",
        this.initCollection.name + this.initCollection.expansionFile,
        this.initCollection.mapKeyPath.title
      );
      await access(mapCollPath);
      const oldKeyMap = await readFile(mapCollPath, "utf8");
      const oldKeyMapJson = JSON.parse(oldKeyMap) as ISearchKeyTree;
      return (
        oldKeyMapJson.keyMap[key] *
        (+this.initCollection.maxSize + +this.addByte)
      );
    }
    throw new Error("Остальные типы ключей не реализованы");
  } // offset

  @TryCatch("Проблемы с инициализацией")
  private async writeKeyMap(
    key: KeyTypeEntity,
    length?: number
  ): Promise<ISearchKeyTree> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    const mapCollPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.collect.db.db.folderDbPath,
      "collections",
      this.initCollection.name + this.initCollection.expansionFile,
      this.initCollection.mapKeyPath.title
    );
    await access(mapCollPath);
    if (this.collect.db.db.KeysTypeDB === "simple" && typeof key === "number") {
      let keyMap: ISearchKeyTree;
      keyMap = {
        type: this.collect.db.db.KeysTypeDB,
        lastKey: key,
        lastOffset: await this.getOffsetForKey("simple", key),
        keyMap: {},
      };
      writeFile(mapCollPath, JSON.stringify(keyMap, null, 2));
      return keyMap;
    }
    if (
      this.collect.db.db.KeysTypeDB === "any-number" &&
      typeof key === "number"
    ) {
      let keyMap: ISearchKeyTree;
      keyMap = {
        type: this.collect.db.db.KeysTypeDB,
        lastKey: 0,
        lastOffset: 0,
        keyMap: {},
      };
      const oldKeyMap = await readFile(mapCollPath, "utf8");
      let oldKeyMapJson: ISearchKeyTree;
      if (!oldKeyMap) {
        oldKeyMapJson = keyMap;
      } else {
        oldKeyMapJson = JSON.parse(oldKeyMap) as ISearchKeyTree;
      }
      const lastOffsetOldMap = oldKeyMapJson.lastOffset;
      const lastKeyNewMap = oldKeyMapJson.lastKey + 1;
      oldKeyMapJson.keyMap[key] = lastKeyNewMap;
      oldKeyMapJson.lastOffset =
        lastOffsetOldMap + this.collect.db.db.OneEntrySize;
      oldKeyMapJson.lastKey = lastKeyNewMap;
      oldKeyMapJson.type = this.collect.db.db.KeysTypeDB;

      writeFile(mapCollPath, JSON.stringify(keyMap, null, 2));
      return keyMap;
    }
    throw new Error("Остальные типы ключей не реализованы");
  }

  @TryCatch("Проблемы с инициализацией")
  private async getLastKey(): Promise<number> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    const mapCollPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.collect.db.db.folderDbPath,
      "collections",
      this.initCollection.name + this.initCollection.expansionFile,
      this.initCollection.mapKeyPath.title
    );
    await access(mapCollPath);
    const oldKeyMap = await readFile(mapCollPath, "utf8");
    if (!oldKeyMap) return -1;
    const oldKeyMapJson = JSON.parse(oldKeyMap) as ISearchKeyTree;
    return oldKeyMapJson.lastKey;
  }

  @TryCatch("Проблемы с инициализацией")
  private async checkKey(key: KeyTypeEntity): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db || typeof key !== "number")
      throw new Error("Не инициализирована коллекция");
    if (this.collect.db.db.KeysTypeDB === "simple") {
      const mapCollPath = join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.collect.db.db.folderDbPath,
        "collections",
        this.initCollection.name + this.initCollection.expansionFile,
        this.initCollection.mapKeyPath.title
      );
      await access(mapCollPath);
      const oldKeyMap = await readFile(mapCollPath, "utf8");
      if (!oldKeyMap) return false;
      const oldKeyMapJson = JSON.parse(oldKeyMap) as ISearchKeyTree;
      return key >= 0 && key <= +oldKeyMapJson.lastKey;
    } else if (this.collect.db.db.KeysTypeDB === "any-number") {
      throw new Error("Функция кастомных ключей не реализана");
    } else {
      throw new Error("Функция кастомных ключей не реализана");
    }
  }
  @TryCatch("Проблемы с записью файла")
  private async setFileStream(readStream: Readable, filePath: string) {
    await access(filePath);
    const writeStream = createWriteStream(filePath);
    await pipeline(readStream, writeStream);
  }

  @TryCatch("Проблемы с чтением файла")
  private async getFileStream(filePath: string) {
    await access(filePath);
    return createReadStream(filePath);
  }

  @TryCatch("Проблемы с записью Big string файла")
  private async setBigString(data: Buffer, path: string) {
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (!this.collect.db.db) throw new Error("Не инициализирована база данных");
    const folderPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.collect.db.db.folderDbPath,
      "collections",
      this.initCollection.name + this.initCollection.expansionFile,
      "bigstring"
    );
    await access(folderPath);
    await writeFile(path, data);
    return true;
  }

  @TryCatch("Проблемы с чтением Big string файла")
  private async getBigString(
    pathFile: string,
    valueSize: number
  ): Promise<IEntityStructure | false> {
    await access(pathFile);
    const data = await readFile(pathFile);
    const convectValue = this.convectToValue(data, valueSize);
    return convectValue;
  }

  private concatBigStringBuffer(
    value: string,
    info: {
      code: Buffer;
      createTimeBuffer: Buffer;
      changeTimeBuffer: Buffer;
      delTimeBuffer: Buffer;
      key: Buffer;
    }
  ) {
    return Buffer.concat([
      info.code,
      Buffer.from(value),
      info.createTimeBuffer,
      info.changeTimeBuffer,
      info.delTimeBuffer,
      info.key,
    ]);
  }

  // private

  private convectToBuffer(
    id: number,
    value: ValuesTypeEntity,
    date?: {
      createDate?: number | undefined;
      changeDate?: number | undefined;
      delDate?: number | undefined;
    },
    fileType?: boolean
  ): {
    dataArr: Buffer;
    size: number;
    maxSize: number;
    getCode?: ValuesTypeDB;
    path?: string;
    info?: {
      code: Buffer;
      createTimeBuffer: Buffer;
      changeTimeBuffer: Buffer;
      delTimeBuffer: Buffer;
      key: Buffer;
    };
    valueSize?: number;
  } {
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (!this.collect.db.db) throw new Error("Не инициализирована база данных");
    const { maxSize, lastOffset } = this.initCollection;
    let getCode: ValuesTypeDB;
    const data = Buffer.alloc(maxSize);
    let filePath: string = "";
    const valueSize = Buffer.byteLength(value, "utf8");
    if (valueSize > maxSize) {
      getCode = "big string";
      filePath = join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.collect.db.db.folderDbPath,
        "collections",
        this.initCollection.name + this.initCollection.expansionFile,
        "bigstring",
        "" + id
      );
      const bigString = JSON.stringify({
        valuePart: value.slice(0, 10) + "...",
        filePath,
        valueSize,
      });
      data.write(bigString); // дописать запись в другой файл
    } else if (fileType) {
      getCode = "file";
      const fileNameHash = crypto.randomUUID();
      filePath = join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.collect.db.db.folderDbPath,
        "collections",
        this.initCollection.name + this.initCollection.expansionFile,
        "file",
        fileNameHash
      );
      const fileString = JSON.stringify({
        valuePart: value,
        filePath,
        valueSize,
      });
      data.write(fileString);
    } else {
      getCode = "string";
      data.write(value);
    }
    const code = Buffer.alloc(1, this.codeType[getCode]);
    const seconds = !!date?.createDate
      ? date.createDate
      : Math.floor(Date.now() / 1000);
    const secondsChange = !!date?.changeDate
      ? ("" + date.changeDate).length === 10
        ? date.changeDate
        : Math.floor(date.changeDate / 1000)
      : seconds;
    const secondsDel = !!date?.delDate
      ? ("" + date.delDate).length === 10
        ? date.delDate
        : Math.floor(date.delDate / 1000)
      : 0;
    const createTimeBuffer = Buffer.alloc(4, 0x00);
    const changeTimeBuffer = Buffer.alloc(4, 0x00);
    const delTimeBuffer = Buffer.alloc(4, 0x00);
    const key = Buffer.alloc(4, 0x00);
    key.writeUInt32BE(id, 0);
    createTimeBuffer.writeUInt32BE(seconds, 0);
    changeTimeBuffer.writeUInt32BE(secondsChange, 0);
    delTimeBuffer.writeUInt32BE(secondsDel, 0);
    const arrBuffer = [
      code,
      data,
      createTimeBuffer,
      changeTimeBuffer,
      delTimeBuffer,
      key,
    ];
    const dataArr = Buffer.concat(arrBuffer);
    const size = dataArr.byteLength; // полная длина буффера вместе с метками
    return {
      dataArr,
      size,
      maxSize,
      getCode,
      path: filePath,
      info: { code, createTimeBuffer, changeTimeBuffer, delTimeBuffer, key },
      valueSize,
    };
  }

  private convectToValue(data: Buffer, valueSize?: number): IEntityStructure {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (data.byteLength !== this.initCollection.maxSize + this.addByte) {
      throw new Error("Не корректные данные для конвертации");
    }
    if (this.collect.db.db.typeValue !== "string") {
      throw new Error("Функция других типов, кроме string, не реализована");
    }
    const size = valueSize || this.initCollection.maxSize;
    const result: IEntityStructure = {
      code: data.subarray(0, 1).readIntBE(0, 1),
      value: data
        .subarray(1, size + 1)
        .subarray(0, data.indexOf(0x00) - 1)
        .toString(),
      filePath: "", // не реализовано
      createDate: data.subarray(size + 1, size + 5).readUint32BE(),
      changeDate: data.subarray(size + 5, size + 9).readUint32BE(),
      deleteDate: data.subarray(size + 9, size + 13).readUint32BE(),
      key: data.subarray(size + 13).readUint32BE(),
    };
    return result;
  }

  @TryCatch(
    "Проблемы с инициализацией или использованы не реализованные функции"
  )
  async setValue(
    value: ValuesTypeEntity,
    key?: KeyTypeEntity | undefined,
    file?: boolean,
    fileStream?: Readable | undefined
  ): Promise<number | false> {
    let newKey: number;
    if (key) {
      // throw new Error("Функция кастомных ключей не реализана");
      newKey = key;
    } else {
      newKey = (await this.getLastKey()) + 1;
    }
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (!this.collect.db.db) throw new Error("Не инициализирована база данных");

    const { dataArr, size, maxSize, getCode, info, path } =
      this.convectToBuffer(newKey, value);
    const filePath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );

    const res = await this.collect.db.fstruct.fsDB.addDatatoEnd(
      dataArr,
      filePath
    );

    if (getCode === "big string" && path && info) {
      await this.setBigString(this.concatBigStringBuffer(value, info), path);
    }
    if (getCode === "file" && path && fileStream && file) {
      await this.setFileStream(fileStream, path);
    }
    if (res) {
      await this.writeCollMap(maxSize + size, "lastOffset");
      await this.writeKeyMap(newKey);
      await this.initRepository(
        this.collect.db.db.name.split(".")[0],
        this.initCollection.name
      );
    }

    return newKey;
  }

  @TryCatch("Проблемы с инициализацией")
  async changeValue(
    key: KeyTypeEntity,
    value: ValuesTypeEntity
  ): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const oldValue = await this.getById(key);
    const { dataArr, size, maxSize } = this.convectToBuffer(
      key as number,
      value,
      {
        createDate: oldValue ? oldValue.createDate : undefined,
        changeDate: Date.now(),
      }
    );
    console.log(dataArr);

    const pathFile = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );
    const offset = await this.getOffsetForKey(
      this.collect.db.db.KeysTypeDB,
      key
    );
    console.log(offset);

    await this.collect.db.fstruct.fsDB.writeFilePart(pathFile, dataArr, offset);
    await this.writeCollMap(offset, "empty", true);
    return true;
  }

  async getById(key: KeyTypeEntity): Promise<false | IEntityStructure> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const offSet = await this.getOffsetForKey(
      this.collect.db.db.KeysTypeDB,
      key
    );
    const pathFile = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );

    const dataBuf = await this.collect.db.fstruct.fsDB.readFilePart(
      pathFile,
      this.initCollection.maxSize + this.addByte,
      offSet
    );
    const dataConv = this.convectToValue(dataBuf);
    if (dataConv.code === 2) {
      const infoFile = JSON.parse(dataConv.value) as {
        valuePart: string;
        filePath: string;
        valueSize: number;
      };
      return await this.getBigString(infoFile.filePath, infoFile.valueSize);
    }
    return dataConv;
  }

  @TryCatch("Проблемы с файлом")
  async getFileById(key: KeyTypeEntity): Promise<ReadStream | false> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const offSet = await this.getOffsetForKey(
      this.collect.db.db.KeysTypeDB,
      key
    );
    const pathFile = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );

    const dataBuf = await this.collect.db.fstruct.fsDB.readFilePart(
      pathFile,
      this.initCollection.maxSize + this.addByte,
      offSet
    );
    const dataConv = this.convectToValue(dataBuf);
    const filePath = (
      JSON.parse(dataConv.value) as {
        valuePart: string;
        filePath: string;
        valueSize: number;
      }
    ).filePath;
    return this.getFileStream(filePath);
  }

  @TryCatch("Невозможно прочитать файл коллекции")
  private async getManyValues(
    getDel: boolean = false,
    check?: string | false,
    limit?: number | undefined,
    offset?: number | undefined
  ): Promise<IEntityStructure[]> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    const pathFile = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );
    await access(pathFile);
    const file = await open(pathFile);
    const stream = file.createReadStream({
      highWaterMark: this.initCollection.maxSize + this.addByte,
    });
    const result: IEntityStructure[] = [];
    let checkDel: boolean;
    let value: IEntityStructure;
    let number = 0;
    let offsetCalk = !!offset ? offset : 0;
    let checkOffset: boolean;
    const endOfStream = (await new Promise((resolve, reject) => {
      stream.on("data", async (chunk: Buffer) => {
        checkOffset = number >= offsetCalk;
        value = this.convectToValue(chunk);
        if (value.code === 2) {
          const infoFile = JSON.parse(value.value) as {
            valuePart: string;
            filePath: string;
            valueSize: number;
          };
          value =
            (await this.getBigString(infoFile.filePath, infoFile.valueSize)) ||
            value;
        }
        if (value.code === 3) {
          const infoFile = JSON.parse(value.value) as {
            valuePart: string;
            filePath: string;
            valueSize: number;
          };
          value.value = "Файл <" + infoFile.valuePart + ">. Доступ по ключу.";
        }
        checkDel = getDel ? true : !value.deleteDate;
        if (!check && checkDel && checkOffset) {
          result.push(value);
        } else if (
          check &&
          value.value.toLowerCase().includes(check.toLowerCase()) &&
          checkDel &&
          checkOffset
        ) {
          result.push(value);
        }
        number++;
      });
      if (limit && result.length >= limit) stream.emit("end");
      stream.on("end", async () => {
        stream.destroy();
        await file.close();
        resolve(result);
      });
      stream.on("error", async (err) => {
        await stream.destroy();
        await file.close();
        console.log(err);
        reject([]);
      });
    })) as IEntityStructure[];
    await stream.destroy();
    await file.close();
    return endOfStream;
  }

  async getAll(limit?: number | undefined): Promise<IEntityStructure[]> {
    return await this.getManyValues(false, false, limit);
  }

  async getAllRange(start: number, end?: number): Promise<IEntityStructure[]> {
    return await this.getManyValues(false, false, end, start);
  }

  async getAllandDel(limit?: number | undefined): Promise<IEntityStructure[]> {
    return await this.getManyValues(true, false, limit);
  }

  async findByValue(findWord: string): Promise<IEntityStructure[]> {
    return await this.getManyValues(false, findWord);
  }

  async deleteByKey(key: KeyTypeEntity): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const offset = await this.getOffsetForKey(
      this.collect.db.db.KeysTypeDB,
      key
    );
    const pathFile = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );
    const oldValue = await this.getById(key);
    const { dataArr, size, maxSize } = this.convectToBuffer(key as number, "", {
      createDate: oldValue ? oldValue.createDate : undefined,
      changeDate: oldValue ? oldValue.changeDate : undefined,
      delDate: Date.now(),
    });
    await this.collect.db.fstruct.fsDB.writeFilePart(pathFile, dataArr, offset);
    await this.writeCollMap(offset, "empty");
    await this.initRepository(
      this.collect.db.db.name.split(".")[0],
      this.initCollection.name
    );
    return true;
  }
  async deleteByKeySoft(key: KeyTypeEntity): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");

    const oldValue = await this.getById(key);
    if (!oldValue) return false;
    const offset = await this.getOffsetForKey(
      this.collect.db.db.KeysTypeDB,
      key
    );
    const pathFile = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.fileCollectionPath,
      this.initCollection.name + this.initCollection.expansionFile
    );
    const { dataArr, size, maxSize } = this.convectToBuffer(
      key as number,
      oldValue.value,
      {
        createDate: oldValue ? oldValue.createDate : undefined,
        changeDate: oldValue ? oldValue.changeDate : undefined,
        delDate: Date.now(),
      }
    );
    await this.collect.db.fstruct.fsDB.writeFilePart(pathFile, dataArr, offset);
    return true;
  }
}
