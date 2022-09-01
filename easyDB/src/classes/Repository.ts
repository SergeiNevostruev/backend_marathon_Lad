import { access, open, readFile, writeFile } from "fs/promises";
import { join } from "path";
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
} from "../interface";

export class Repository implements IRepository {
  public initCollection: ICollectionStructure | undefined;
  public codeType = {
    string: 0x01,
    file: 0x02,
    mix: 0x03,
  };
  public addByte = 13;
  constructor(public collect: ICollections) {}

  async initRepository(dbName: string, collName: string) {
    const checkDB = await this.collect.db.initDB(dbName);
    if (checkDB) {
      console.log("Некорректное наименование базы данных");
      return false;
    }
    const checkColl = await this.collect.connectCollection(collName);
    this.initCollection = checkColl.collection;
  }

  @TryCatch("Проблемы с проверкой карты коллекция")
  private async writeCollMap(
    data: number,
    mapKey: "lastOffset" | "empty",
    delEmptyOffset: boolean = false
  ) {
    if (!this.initCollection) {
      console.log("Не инициализирована коллекция");
      throw new Error("Не инициализирована коллекция");
    }
    const mapCollPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection?.mapColl
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
  private getOffsetForKey(KeysTypeDB: KeysTypeDB, key: KeyTypeEntity): number {
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (KeysTypeDB === "simple" && typeof key === "number") {
      return key * (this.initCollection.maxSize + this.addByte);
    }
    throw new Error("Остальные типы ключей не реализованы");
  } // offset

  @TryCatch("Проблемы с инициализацией")
  private async writeKeyMap(key: KeyTypeEntity): Promise<ISearchKeyTree> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    const mapCollPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.mapKeyPath.path
    );
    await access(mapCollPath);
    // const oldKeyMap = await readFile(mapCollPath, "utf8");
    // const oldKeyMapJson = JSON.parse(oldKeyMap) as ISearchKeyTree;
    if (this.collect.db.db.KeysTypeDB === "simple" && typeof key === "number") {
      let keyMap: ISearchKeyTree;
      keyMap = {
        type: this.collect.db.db.KeysTypeDB,
        lastKey: key,
        keyMap: {},
      };
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
      this.initCollection.mapKeyPath.path
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
    if (this.collect.db.db.KeysTypeDB !== "simple") {
      throw new Error("Функция кастомных ключей не реализана");
    }
    const mapCollPath = join(
      this.collect.db.fstruct.fsDB.pathFS,
      this.initCollection.mapKeyPath.path
    );
    await access(mapCollPath);
    const oldKeyMap = await readFile(mapCollPath, "utf8");
    if (!oldKeyMap) return false;
    const oldKeyMapJson = JSON.parse(oldKeyMap) as ISearchKeyTree;
    return key >= 0 && key <= +oldKeyMapJson.lastKey;
  }

  private convectToBuffer(
    value: IEntityStructure,
    changeDate?: number,
    delDate?: number
  ): {
    dataArr: Buffer;
    size: number;
    maxSize: number;
  } {
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (!this.collect.db.db) throw new Error("Не инициализирована база данных");
    const { maxSize, lastOffset } = this.initCollection;
    const code = Buffer.alloc(1, this.codeType[this.collect.db.db.typeValue]);
    const data = Buffer.alloc(maxSize);
    data.write(value.value);
    const seconds = Math.floor(Date.now() / 1000);
    const secondsChange = changeDate ? Math.floor(changeDate / 1000) : seconds;
    const createTimeBuffer = Buffer.alloc(4, 0x00);
    const changeTimeBuffer = Buffer.alloc(4, 0x00);
    const delTimeBuffer = Buffer.alloc(4, 0x00);
    createTimeBuffer.writeUInt32BE(seconds, 0);
    changeTimeBuffer.writeUInt32BE(secondsChange, 0);
    if (!!delDate) {
      const secondsDel = Math.floor(delDate / 1000);
      delTimeBuffer.writeUInt32BE(secondsDel, 0);
    }
    const arrBuffer = [
      code,
      data,
      createTimeBuffer,
      changeTimeBuffer,
      delTimeBuffer,
    ];
    const dataArr = Buffer.concat(arrBuffer);
    const size = dataArr.byteLength; // полная длина буффера вместе с метками
    return { dataArr, size, maxSize };
  }

  private convectToValue(data: Buffer): IEntityStructure {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (data.byteLength !== this.initCollection.maxSize + this.addByte) {
      throw new Error("Не корректные данные для конвертации");
    }
    if (this.collect.db.db.typeValue !== "string") {
      throw new Error("Функция других типов, кроме string, не реализована");
    }
    const result: IEntityStructure = {
      code: +data.subarray(0, 1).readUInt32BE(0).toString(16),
      value: data.subarray(1, 257).toString(),
      filePath: "", // не реализовано
      createDate: data.subarray(257, 261).readUint32BE(),
      changeDate: data.subarray(261, 265).readUint32BE(),
      deleteDate: data.subarray(265).readUint32BE(),
    };
    return result;
  }

  @TryCatch(
    "Проблемы с инициализацией или использованы не реализованные функции"
  )
  async setValue(
    value: IEntityStructure,
    key?: KeyTypeEntity | undefined
  ): Promise<boolean> {
    let newKey: number;
    if (key) {
      throw new Error("Функция кастомных ключей не реализана");
    } else {
      newKey = (await this.getLastKey()) + 1;
    }
    if (!this.initCollection) throw new Error("Не инициализирована коллекция");
    if (!this.collect.db.db) throw new Error("Не инициализирована база данных");
    const { dataArr, size, maxSize } = this.convectToBuffer(value);
    const res = await this.collect.db.fstruct.fsDB.addDatatoEnd(
      dataArr,
      join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.initCollection.fileCollectionPath
      )
    );
    await this.writeCollMap(maxSize + size, "lastOffset");
    await this.writeKeyMap(newKey);
    await this.initRepository(
      this.collect.db.db.name,
      this.initCollection.name
    );
    return !!res;
  }

  @TryCatch("Проблемы с инициализацией")
  async changeValue(
    key: KeyTypeEntity,
    value: IEntityStructure
  ): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const { dataArr, size, maxSize } = this.convectToBuffer(value, Date.now());
    await this.collect.db.fstruct.fsDB.writeFilePart(
      join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.initCollection.fileCollectionPath
      ),
      dataArr,
      this.initCollection.lastOffset
    );
    await this.writeCollMap(
      this.getOffsetForKey(this.collect.db.db.KeysTypeDB, key),
      "empty",
      true
    );
    return true;
  }

  async getById(key: KeyTypeEntity): Promise<false | IEntityStructure> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const offSet = this.getOffsetForKey(this.collect.db.db.KeysTypeDB, key);
    const dataBuf = await this.collect.db.fstruct.fsDB.readFilePart(
      this.initCollection.fileCollectionPath,
      this.initCollection.maxSize + this.addByte,
      offSet
    );
    const dataConv = this.convectToValue(dataBuf);
    return dataConv;
  }

  @TryCatch("Невозможно прочитать файл коллекции")
  private async getManyValues(
    check?: string | false,
    limit?: number | undefined,
    offset?: number | undefined
  ): Promise<IEntityStructure[]> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    const file = await open(this.initCollection.fileCollectionPath);
    const stream = file.createReadStream({
      highWaterMark: this.initCollection.maxSize + this.addByte,
    });
    const result: IEntityStructure[] = [];
    let value: IEntityStructure;
    const endOfStream = (await new Promise((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => {
        value = this.convectToValue(chunk);
        if (!check) {
          result.push(value);
        } else if (check && value.value.includes(check)) {
          result.push(value);
        }
      });
      if (limit && result.length >= limit) stream.emit("end");
      stream.on("end", () => {
        resolve(result);
      });
      stream.on("error", (err) => {
        console.log(err);
        reject([]);
      });
    })) as IEntityStructure[];
    return endOfStream;
  }

  async getAll(limit?: number | undefined): Promise<IEntityStructure[]> {
    return await this.getManyValues(false, limit);
  }

  async findByValue(findWord: string): Promise<IEntityStructure[]> {
    return await this.getManyValues(findWord);
  }

  async deleteByKey(key: KeyTypeEntity): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");
    if (!(await this.checkKey(key))) return false;
    const value: IEntityStructure = {
      code: 0,
      value: "",
      filePath: "",
      createDate: 0,
      changeDate: 0,
      deleteDate: Date.now(),
    };
    const offset = this.getOffsetForKey(this.collect.db.db.KeysTypeDB, key);
    const { dataArr, size, maxSize } = this.convectToBuffer(value, Date.now());
    await this.collect.db.fstruct.fsDB.writeFilePart(
      join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.initCollection.fileCollectionPath
      ),
      dataArr,
      offset
    );
    await this.writeCollMap(
      this.getOffsetForKey(this.collect.db.db.KeysTypeDB, key),
      "empty"
    );
    await this.initRepository(
      this.collect.db.db.name,
      this.initCollection.name
    );
    return true;
  }
  async deleteByKeySoft(key: KeyTypeEntity): Promise<boolean> {
    if (!this.initCollection || !this.collect.db.db)
      throw new Error("Не инициализирована коллекция");

    const value = await this.getById(key);
    if (!value) return false;
    const offset = this.getOffsetForKey(this.collect.db.db.KeysTypeDB, key);
    const { dataArr, size, maxSize } = this.convectToBuffer(
      value,
      Date.now(),
      Date.now()
    );
    await this.collect.db.fstruct.fsDB.writeFilePart(
      join(
        this.collect.db.fstruct.fsDB.pathFS,
        this.initCollection.fileCollectionPath
      ),
      dataArr,
      offset
    );
    return true;
  }
}
