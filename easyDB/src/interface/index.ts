import { DataBases } from "../classes/DataBases";

export interface IFileStructure {
  dbFileSystemStruct: {
    title: "easydbfiles";
    databasesMapName: string;
    dbDirName: "dbFiles";
    dbFiles: string[];
    lastCode: number;
  };
  fsDB: IFileSystem;
  createStructureFS(): Promise<void>;
  createStructureDB(
    dbNames: string[],
    OneEntrySize: number,
    KeysTypeDB: KeysTypeDB,
    typeValue?: ValuesTypeDB
  ): Promise<void>;
}
export interface IDataBaseStructure {
  name: string;
  code: number;
  folderDbPath: string;
  expansionFile: ".easydb";
  // dbMap: IMapDB;
  OneEntrySize: SizeType; // byte
  typeValue: ValuesTypeDB;
  KeysTypeDB: KeysTypeDB;
  collections: string[];
  createdDate: string;
  deleteDate: string;
  lastCollCode: number;
}
export interface ICollectionStructure {
  name: string;
  mapColl: string;
  code: number;
  // entities: IEntityStructure["id"][];
  fileCollectionPath: string;
  expansionFile: ".edbc"; // easydb collection
  maxSize: number; // + 13 byte info
  mapKeyPath: {
    title: string;
    path: string;
  };
  mapValueSearchPath: {
    title: string;
    path: string;
  };
  logfile: {
    title: string;
    path: string;
  };
  createdDate: string;
  deleteDate: string;
  lastOffset: number;
  empty: number[];
}
export interface IEntityStructure {
  code: number; // typeOf data 0x01 --> string
  // id: KeyTypeEntity;
  value: ValuesTypeEntity;
  filePath: string;
  // metadata
  createDate: number;
  changeDate: number;
  deleteDate: number;
}

export type ValuesTypeDB = "string" | "file" | "mix";
export type ValuesTypeEntity = string;
export type KeysTypeDB = "simple" | "any-number" | "string";
export type KeyTypeEntity = number | string;
export type KeyTypeEntityCache = string;
export type ReturnMessage = { message: string; done: boolean };
export type SizeType = number;
export type OffsetType = number;

// export interface IOptionsInit {
//   OneEntrySize: SizeType; // byte
// }

export interface IDataBases {
  fstruct: IFileStructure;
  db: IDataBaseStructure | undefined;
  initDB(
    dbName: string
    // options?: IOptionsInit
  ): Promise<boolean>;
  createNewBD(
    dbName: string,
    keyType: KeysTypeDB,
    typeValue?: ValuesTypeDB,
    OneEntrySize?: SizeType
  ): Promise<void>;
  deleteBD(dbName: string): Promise<boolean>;
  deleteBDsoft(dbName: string): Promise<boolean>;
  getNamesDB(): Promise<string[] | false>;
  getNamesDBAllfs(): Promise<string[] | false>;
}

export interface ICollections {
  db: DataBases;
  connectDB(dbName: string): Promise<boolean>;
  connectCollection(
    NameCollection: string
  ): Promise<{ collection: ICollectionStructure; pathMap: string }>;
  createCollection(title: string): Promise<boolean>;
  deleteCollection(title: string): Promise<boolean>;
  deleteCollectionSoft(title: string): Promise<boolean>;
  getNamesCollection(): Promise<string[]>;
  normalizeKeys(): Promise<boolean>;
}

export interface IRepository {
  collect: ICollections;
  setValue(value: ValuesTypeEntity, key?: KeyTypeEntity): Promise<boolean>;
  changeValue(key: KeyTypeEntity, value: ValuesTypeEntity): Promise<boolean>;
  getById(key: KeyTypeEntity): Promise<IEntityStructure | false>;
  getAll(
    limit?: number
    // ,offset?: number,
  ): Promise<IEntityStructure[]>;
  findByValue(findWord: string): Promise<IEntityStructure[]>;
  deleteByKey(key: KeyTypeEntity): Promise<boolean>;
  deleteByKeySoft(key: KeyTypeEntity): Promise<boolean>;
}

export interface IFileSystem {
  pathFS: string;
  calcOffset(key: number, lengthOneEntity: number): number;
  createDir(dirName: string): Promise<boolean | void>;
  createFile(
    file: string,
    data?: any,
    dirName?: string
  ): Promise<boolean | void>;
  addDatatoEnd(
    data: Buffer,
    path: string
    // size: number
  ): Promise<boolean | void>;
  readFilePart(
    path: string,
    length: number,
    offset: OffsetType
  ): Promise<Buffer>;
  writeFilePart(
    path: string,
    data: Buffer,
    // length: number,
    offset: OffsetType
  ): Promise<boolean>;
  deleteFile(filePath: string): Promise<boolean>;
  deleteDir(dirPath: string): Promise<boolean>;
  deleteFileEnd(path: string, length: number): Promise<boolean>;
  normalizeFile(): Promise<ReturnMessage>;
}

export interface ISearch {}

export interface ICacheEntityStructure extends IEntityStructure {
  importance: number;
}
export interface ICache {
  maxSize: number;
  mostUseless: KeyTypeEntityCache;
  cache: Map<KeyTypeEntityCache, ICacheEntityStructure>;
  pathFile: string;
  expansionFile: ".edbcam"; // easydb cache Map
  makeKeyTypeEntityCache(
    nameDB: IDataBaseStructure["code"],
    nameCollection: ICollectionStructure["code"],
    key: KeyTypeEntity
  ): KeyTypeEntityCache;
  ejection(): void;
  setValue(key: KeyTypeEntityCache, value: IEntityStructure): ReturnMessage;
  getValue(key: KeyTypeEntityCache): IEntityStructure[] | ReturnMessage;
  update(key: KeyTypeEntityCache, value: IEntityStructure): ReturnMessage;
  updateImportance(key: KeyTypeEntityCache): void;
  deleteUseless(key: KeyTypeEntityCache): void;
  writeToFile(path: string): void;
  readFromFile(path: string): void;
}

export interface IFsDbMap {
  databasesMap: string[];
  filePath: string;
  expansionFile: ".edb.map.json"; // easydb's  Map
  getAllDbName(): string[];
}

export interface IMapDB {
  map: Map<
    ICollectionStructure["name"],
    ICollectionStructure["fileCollectionPath"]
  >;
  filePath: string;
  expansionFile: ".edb.map.json"; // easydb Map
  getCollectionPath(
    nameColl: ICollectionStructure["name"]
  ): ICollectionStructure["fileCollectionPath"];
  getAllDbCollection(): string[];
}

export interface ISearchKeyTree {
  // map: Map<KeyTypeEntity, OffsetType>;
  // filePath: string;
  // expansionFile: ".edbkt"; // easydb key tree
  // getEntityOffset(id: KeyTypeEntity): OffsetType;
  type: KeysTypeDB;
  lastKey: number;
  keyMap: any;
}

export interface ISearchValueTree {
  map: any;
  filePath: string;
  expansionFile: ".edbvt"; // easydb value tree
  getEntityOffset(searchWord: string): OffsetType;
}

export interface ILogger {
  loggerFile: string;
  expansionFile: ".edb.logfile";
  logger(...data: string[]): void;
}
