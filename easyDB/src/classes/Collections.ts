import { access, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { TryCatch } from "../decorators";
import {
  ICollections,
  ICollectionStructure,
  IDataBaseStructure,
  ReturnMessage,
} from "../interface";
import { DataBases } from "./DataBases";

export class Collections implements ICollections {
  public collection: ICollectionStructure | undefined;
  constructor(public db: DataBases) {}

  async connectDB(dbName: string): Promise<boolean> {
    const specificDB = await this.db.initDB(dbName);
    return specificDB;
  }

  @TryCatch("Проблемы с картой базы данных")
  private async changeCollInDbMap(collection: string, action: "add" | "del") {
    const mapDbPath = join(
      this.db.fstruct.fsDB.pathFS,
      this.db.db!.folderDbPath,
      this.db.db!.name.split(".")[0] + ".edb.map.json"
    );
    access(mapDbPath);
    const oldDbMap = await readFile(mapDbPath, "utf8");
    const oldDbMapJson = JSON.parse(oldDbMap) as IDataBaseStructure;
    if (action === "add")
      oldDbMapJson.collections = [...oldDbMapJson.collections, collection];
    if (action === "del")
      oldDbMapJson.collections = oldDbMapJson.collections.filter(
        (v) => v !== collection
      );
    await writeFile(mapDbPath, JSON.stringify(oldDbMapJson, null, 2), "utf8");
  }

  @TryCatch("Проблемы с проверкой карты базы данных")
  private async checkTitleColl(collection: string) {
    const mapDbPath = join(
      this.db.fstruct.fsDB.pathFS,
      this.db.db!.folderDbPath,
      this.db.db!.name.split(".")[0] + ".edb.map.json"
    );
    await access(mapDbPath);
    const oldDbMap = await readFile(mapDbPath, "utf8");
    const oldDbMapJson = JSON.parse(oldDbMap) as IDataBaseStructure;
    return oldDbMapJson.collections.includes(collection);
  }

  @TryCatch("Невозможно подключиться к коллекции")
  async connectCollection(
    NameCollection: string
  ): Promise<{ collection: ICollectionStructure; pathMap: string }> {
    if (!this.db.db) {
      throw new Error("Не инициализирована база данных");
    }
    const pathToMapDB = join(
      this.db.fstruct.fsDB.pathFS,
      this.db.db.folderDbPath,
      "collections",
      NameCollection + ".edbc",
      NameCollection + ".edbc.map.json"
    );
    access(pathToMapDB);
    const mapColl = JSON.parse(
      await readFile(pathToMapDB, "utf8")
    ) as ICollectionStructure;

    return { collection: mapColl, pathMap: pathToMapDB };
  }

  @TryCatch("Невозможно создать коллекцию")
  async createCollection(title: string): Promise<boolean> {
    if (await this.checkTitleColl(title)) {
      console.log("такое наименование колелкции уже существует");
      return false;
    }
    if (this.db.db) {
      const folderPathAll = join(
        this.db.fstruct.fsDB.pathFS,
        this.db.db.folderDbPath,
        "collections"
      );
      const folderPath = join(
        this.db.db.folderDbPath,
        "collections",
        title + ".edbc"
      );
      access(folderPathAll);
      const emptyCollection: ICollectionStructure = {
        name: title,
        code: this.db.db.code + 1,
        fileCollectionPath: join(
          this.db.db.folderDbPath,
          "collections",
          title + ".edbc"
        ),
        expansionFile: ".edbc",
        maxSize: this.db.db.OneEntrySize,
        mapColl: title + ".edbc.map.json",
        mapKeyPath: {
          title: title + ".edbkt",
          path: join(this.db.db.folderDbPath, "collections", title + ".edbkt"),
        },
        mapValueSearchPath: {
          title: title + ".edbvt",
          path: join(this.db.db.folderDbPath, "collections", title + ".edbvt"),
        },
        logfile: {
          title: title + ".edb.logfile",
          path: join(
            this.db.db.folderDbPath,
            "collections",
            title + ".edb.logfile"
          ),
        },
        createdDate: Date().toString(),
        deleteDate: "",
        lastOffset: 0,
        empty: [],
      };
      await this.db.fstruct.fsDB.createDir(folderPath);
      await this.db.fstruct.fsDB.createFile(
        join(folderPath, emptyCollection.mapColl),
        JSON.stringify(emptyCollection, null, 2)
      );
      await this.db.fstruct.fsDB.createFile(
        join(folderPath, emptyCollection.name + emptyCollection.expansionFile)
      );
      await this.db.fstruct.fsDB.createFile(
        join(
          folderPath,
          emptyCollection.name + emptyCollection.expansionFile,
          emptyCollection.logfile.title
        )
      );
      await this.db.fstruct.fsDB.createFile(
        join(
          folderPath,
          emptyCollection.name + emptyCollection.expansionFile,
          emptyCollection.mapKeyPath.title
        )
      );
      await this.db.fstruct.fsDB.createFile(
        join(
          folderPath,
          emptyCollection.name + emptyCollection.expansionFile,
          emptyCollection.mapValueSearchPath.title
        )
      );
      await this.changeCollInDbMap(emptyCollection.name, "add");
      await this.db.initDB(this.db.db.name);
      return true;
    } else {
      console.log("Нужно подключить базу данных");
      return false;
    }
  }

  async deleteCollection(title: string): Promise<boolean> {
    if (this.db.db) {
      const result = await this.db.fstruct.fsDB.deleteDir(
        join(
          this.db.fstruct.fsDB.pathFS,
          this.db.db.folderDbPath,
          "collections",
          title + ".edbc"
        )
      );
      await this.changeCollInDbMap(title, "del");
      await this.db.initDB(this.db.db.name);
      return result;
    } else {
      return false;
    }
  }

  @TryCatch("Не удалось удалить файл")
  async deleteCollectionSoft(title: string): Promise<boolean> {
    if (!this.db.db) {
      console.log("Не инициализирована база данных");
      throw new Error("Не инициализирована база данных");
    }
    const { collection, pathMap } = await this.connectCollection(title);
    collection.deleteDate = Date().toString();
    await writeFile(pathMap, JSON.stringify(collection, null, 2));
    await this.changeCollInDbMap(title, "del");
    await this.db.initDB(this.db.db.name);
    return true;
  }
  async getNamesCollection(): Promise<string[]> {
    if (!this.db.db) {
      console.log("Не инициализирована база данных");
      throw new Error("Не инициализирована база данных");
    }
    await this.db.initDB(this.db.db.name.split(".")[0]);
    return this.db.db.collections;
  }

  @TryCatch("Не возможно прочитать карту базы данных")
  async getNamesCollectionAll(): Promise<string[]> {
    if (!this.db.db) {
      console.log("Не инициализирована база данных");
      throw new Error("Не инициализирована база данных");
    }
    const pathDbDir = join(
      this.db.fstruct.fsDB.pathFS,
      this.db.db.folderDbPath,
      "collections"
    );
    await access(pathDbDir);
    const files = await readdir(pathDbDir, "utf8");
    const filesColl = files
      .filter((v) => v.endsWith(".edbc"))
      .map((v) => v.split(".")[0]);
    return filesColl;
  }

  normalizeKeys(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
