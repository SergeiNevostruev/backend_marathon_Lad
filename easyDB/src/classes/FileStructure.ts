import { existsSync } from "fs";
import { access, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { TryCatch } from "../decorators";
import {
  IDataBaseStructure,
  IFileStructure,
  IFileSystem,
  KeysTypeDB,
  ValuesTypeDB,
} from "../interface";

export class FileStructure implements IFileStructure {
  public dbFileSystemStruct: {
    title: "easydbfiles";
    databasesMapName: string;
    dbDirName: "dbFiles";
    // dbFiles: {
    //   title: string;
    //   dbMap: string;
    //   cache: string;
    //   logfile: string;
    //   collections: { title: string; mapKeys: string; mapValues: string }[];
    // }[];
    dbFiles: string[];
    lastCode: number;
  };
  public fsDB: IFileSystem;
  constructor(fsDB: IFileSystem) {
    this.dbFileSystemStruct = {
      title: "easydbfiles",
      databasesMapName: "databasesMap.json",
      dbDirName: "dbFiles",
      dbFiles: [],
      lastCode: 0,
    };
    this.fsDB = fsDB;
  }

  async createStructureFS(): Promise<void> {
    await this.fsDB.createDir("");
    await this.fsDB.createFile(
      this.dbFileSystemStruct.databasesMapName,
      JSON.stringify(this.dbFileSystemStruct, null, 2)
    );
    await this.fsDB.createDir(this.dbFileSystemStruct.dbDirName);
  }
  private async createDBStruct(
    dBName: string,
    code: number,
    typeValue: ValuesTypeDB,
    OneEntrySize: number,
    KeysTypeDB: KeysTypeDB = "simple"
  ): Promise<boolean> {
    const dirPath = join(this.fsDB.pathFS, this.dbFileSystemStruct.dbDirName);
    const files = await readdir(dirPath);
    if (files.includes(dBName + ".easydb")) return false;
    const defaultDbStructFile = {
      title: dBName + ".easydb",
      files: {
        dbMap: dBName + ".edb.map.json",
        cache: dBName + ".edb.cache.json",
        logfile: dBName + ".edb.logfile.txt",
      },
    };
    const dirPathDB = join(
      this.dbFileSystemStruct.dbDirName,
      defaultDbStructFile.title
    );
    const defaultDbMap: IDataBaseStructure = {
      name: defaultDbStructFile.title,
      code: code,
      folderDbPath: dirPathDB,
      expansionFile: ".easydb",
      OneEntrySize: OneEntrySize, // по умолчанию размер одной секции файлов
      typeValue,
      KeysTypeDB: KeysTypeDB,
      collections: [],
      createdDate: Date().toString(),
      deleteDate: "",
      lastCollCode: 0,
    };
    await this.fsDB.createDir(dirPathDB).catch();
    let fileName: keyof typeof defaultDbStructFile["files"];
    let data: string;
    for (fileName in defaultDbStructFile.files) {
      data = "";
      if (fileName === "dbMap") data = JSON.stringify(defaultDbMap, null, 2);
      await this.fsDB
        .createFile(join(dirPathDB, defaultDbStructFile.files[fileName]), data)
        .catch();
    }
    await this.fsDB.createDir(join(dirPathDB, "collections")).catch();
    return true;
  }

  @TryCatch("Проблемы при создании структуры базы данных")
  async createStructureDB(
    dbNames: string[],
    OneEntrySize: number = 256,
    KeysTypeDB: KeysTypeDB = "simple",
    typeValue: ValuesTypeDB = "string"
  ): Promise<void> {
    // await this.createStructureFS();
    const fsMapPath = join(
      this.fsDB.pathFS,
      this.dbFileSystemStruct.databasesMapName
    );
    const fsMap = await readFile(fsMapPath, "utf8");
    let fsMapChanged = JSON.parse(
      fsMap
    ) as IFileStructure["dbFileSystemStruct"];
    let count = fsMapChanged.lastCode;
    const createdDbStruct = [];
    for (const dbName of dbNames) {
      count++;
      let checkCreated = await this.createDBStruct(
        dbName,
        count,
        typeValue,
        OneEntrySize,
        KeysTypeDB
      ).catch();
      if (checkCreated) createdDbStruct.push(dbName + ".easydb");
      if (!checkCreated) {
        console.log(dbName, " существует...");
        count--;
      }
    }

    fsMapChanged.dbFiles = [...fsMapChanged.dbFiles, ...createdDbStruct];
    fsMapChanged.lastCode = count;
    await writeFile(fsMapPath, JSON.stringify(fsMapChanged, null, 2));
    // throw new Error("Method not implemented.");
  }
}
