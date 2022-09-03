import { readFile, writeFile, access, open, readdir } from "fs/promises";
import { join } from "path";
import { TryCatch } from "../decorators";
import {
  IDataBases,
  IDataBaseStructure,
  IFileStructure,
  //   IOptionsInit,
  KeysTypeDB,
  ReturnMessage,
  ValuesTypeDB,
} from "../interface";

export class DataBases implements IDataBases {
  fstruct: IFileStructure;
  db: IDataBaseStructure | undefined;
  constructor(fstruct: IFileStructure) {
    this.fstruct = fstruct;
  }

  @TryCatch("Не удалось инициализировать базу данных")
  async initDB(
    dbName: string
    // options?: IOptionsInit | undefined
  ): Promise<boolean> {
    const mapDbFile = await readFile(
      join(
        this.fstruct.fsDB.pathFS,
        "dbFiles",
        dbName + ".easydb",
        dbName + ".edb.map.json"
      ),
      "utf8"
    );
    if (mapDbFile) {
      this.db = JSON.parse(mapDbFile);
      return true;
    } else {
      return false;
    }
  }

  async createNewBD(
    dbName: string,
    keyType: KeysTypeDB = "simple",
    typeValue: ValuesTypeDB = "string",
    OneEntrySize: number = 256
  ): Promise<void> {
    this.fstruct.createStructureDB([dbName], OneEntrySize, keyType, typeValue);
  }

  async deleteBD(dbName: string): Promise<boolean> {
    const result = await this.fstruct.fsDB.deleteDir(
      join(
        this.fstruct.fsDB.pathFS,
        this.fstruct.dbFileSystemStruct.dbDirName,
        dbName + ".easydb"
      )
    );
    if (result) {
      const mapFSFile = await readFile(
        join(
          this.fstruct.fsDB.pathFS,
          this.fstruct.dbFileSystemStruct.databasesMapName
        ),
        "utf8"
      );
      const mapFSFileChange = JSON.parse(
        mapFSFile
      ) as IFileStructure["dbFileSystemStruct"];
      mapFSFileChange.dbFiles = mapFSFileChange.dbFiles.filter(
        (v) => v !== dbName + ".easydb"
      );

      await writeFile(
        join(
          this.fstruct.fsDB.pathFS,
          this.fstruct.dbFileSystemStruct.databasesMapName
        ),
        JSON.stringify(mapFSFileChange, null, 2),
        "utf8"
      );
    }
    return result;
  }

  @TryCatch("Не удалось удалить базу данных")
  async deleteBDsoft(dbName: string): Promise<boolean> {
    const pathToMapDB = join(
      this.fstruct.fsDB.pathFS,
      this.fstruct.dbFileSystemStruct.dbDirName,
      dbName + ".easydb",
      dbName + ".edb.map.json"
    );
    const mapDbFile = await readFile(pathToMapDB, "utf8");
    let mapDbFileChange = JSON.parse(mapDbFile) as IDataBaseStructure;
    mapDbFileChange.deleteDate = Date().toString();
    await writeFile(pathToMapDB, JSON.stringify(mapDbFileChange, null, 2));

    const mapFSFile = await readFile(
      join(
        this.fstruct.fsDB.pathFS,
        this.fstruct.dbFileSystemStruct.databasesMapName
      ),
      "utf8"
    );
    const mapFSFileChange = JSON.parse(
      mapFSFile
    ) as IFileStructure["dbFileSystemStruct"];
    mapFSFileChange.dbFiles = mapFSFileChange.dbFiles.filter(
      (v) => v !== dbName + ".easydb"
    );

    await writeFile(
      join(
        this.fstruct.fsDB.pathFS,
        this.fstruct.dbFileSystemStruct.databasesMapName
      ),
      JSON.stringify(mapFSFileChange, null, 2),
      "utf8"
    );
    return true;
    // throw new Error("Method not implemented.");
  }
  @TryCatch("Невозможно считать карту баз данных")
  async getNamesDB(): Promise<string[] | false> {
    const mapFSFile = await readFile(
      join(
        this.fstruct.fsDB.pathFS,
        this.fstruct.dbFileSystemStruct.databasesMapName
      ),
      "utf8"
    );
    return (
      JSON.parse(mapFSFile) as IFileStructure["dbFileSystemStruct"]
    ).dbFiles.map((v) => v.split(".")[0]);
  }

  @TryCatch("Невозможно считать информацию о базах данных")
  async getNamesDBAllfs(): Promise<string[] | false> {
    const pathDbDir = join(
      this.fstruct.fsDB.pathFS,
      this.fstruct.dbFileSystemStruct.dbDirName
    );
    await access(pathDbDir);
    const files = await readdir(pathDbDir, "utf8");
    const filesBD = files
      .filter((v) => v.endsWith(".easydb"))
      .map((v) => v.split(".")[0]);
    return filesBD;
  }
}
