export interface IFileStructure {
  dbFileSystemStruct: {
    title: "easydbfiles";
    databasesMapName: string;
    dbDirName: "dbFiles";
    // dbFiles: { //описание структуры папок и файлов, не знаю как описать в классе
    //   title: string;
    //   dbMap: string;
    //   cache: string;
    //   logfile: string;
    //   collections: {
    //     title: string;
    //     mapKeys: string;
    //     mapValues: string;
    //   }[];
    // }[];
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
}
export interface ICollectionStructure {
  name: string;
  code: number;
  entities: IEntityStructure["id"][];
  fileCollectionPath: string[];
  expansionFile: ".edbc"; // easydb collection
  maxSize: number;
  mapKey?: ISearchKeyTree;
  mapValueSearch?: ISearchValueTree;
}
export interface IEntityStructure {
  id: KeyTypeEntity;
  value: ValuesTypeEntity;
  filePath?: string;
  // metadata
  createDate: Date;
  changeDate: Date;
  deleteDate?: Date | null;
}

export type ValuesTypeDB = "string" | "file" | "mix";
export type ValuesTypeEntity = number | string;
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
  connectCollection(NameCollection: string): ICollectionStructure;
  createCollection(title: string): ReturnMessage;
  deleteCollection(title: string): ReturnMessage;
  deleteCollectionSoft(title: string): ReturnMessage;
  getNamesCollection(): string[];
  normalizeKeys(): ReturnMessage;
}

export interface IRepository {
  setValue(value: IEntityStructure, key?: KeyTypeEntity): ReturnMessage;
  changeValue(key: KeyTypeEntity, value: IEntityStructure): ReturnMessage;
  getById(key: KeyTypeEntity): IEntityStructure | ReturnMessage;
  getAll(offset?: number, limit?: number): IEntityStructure[] | ReturnMessage;
  findByValue(findWord: string): IEntityStructure[] | ReturnMessage;
  deleteByKey(key: KeyTypeEntity): ReturnMessage;
  deleteByKeySoft(key: KeyTypeEntity): ReturnMessage;
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
    key: IEntityStructure["id"]
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
  map: Map<IEntityStructure["id"], OffsetType>;
  filePath: string;
  expansionFile: ".edbkt"; // easydb key tree
  getEntityOffset(id: IEntityStructure["id"]): OffsetType;
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
