export interface IFileStructure {
  dbFiles: {
    title: string;
    dbMap: string;
    cache: string;
    collections: {
      title: string;
      mapKeys: string;
      mapValues: string;
    }[];
  };
}
export interface IDataBaseStructure {
  name: string;
  code: number;
  folderDbPath: string;
  dbMap: IMapDB;
}
export interface ICollectionStructure {
  name: string;
  code: number;
  entities: IEntityStructure["id"][];
  fileCollectionPath: string[];
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

export interface IOptionsInit {}

export interface IDataBases {
  init: (options: IOptionsInit) => ReturnMessage;
  createNewBD: (
    dbName: string,
    keyType: KeysTypeDB,
    typeValue?: ValuesTypeDB,
    OneEntrySize?: SizeType
  ) => ReturnMessage;
  deleteBD: (dbName: string) => ReturnMessage;
  deleteBDsoft: (dbName: string) => ReturnMessage;
  getNamesDB: () => string[];
}

export interface ICollections {
  connectCollection: (NameCollection: string) => ICollectionStructure;
  createCollection: (title: string) => ReturnMessage;
  deleteCollection: (title: string) => ReturnMessage;
  deleteCollectionSoft: (title: string) => ReturnMessage;
  getNamesCollection: () => string[];
  normalizeKeys: () => ReturnMessage;
}

export interface IRepository {
  setValue: (value: IEntityStructure, key?: KeyTypeEntity) => ReturnMessage;
  changeValue: (key: KeyTypeEntity, value: IEntityStructure) => ReturnMessage;
  getById: (key: KeyTypeEntity) => IEntityStructure | ReturnMessage;
  getAll: (
    offset?: number,
    limit?: number
  ) => IEntityStructure[] | ReturnMessage;
  findByValue: (findWord: string) => IEntityStructure[] | ReturnMessage;
  deleteByKey: (key: KeyTypeEntity) => ReturnMessage;
  deleteByKeySoft: (key: KeyTypeEntity) => ReturnMessage;
}

export interface IFileSystem {
  calcOffset: (key: number, lengthOneEntity: number) => number;
  createDir: (dirName: string) => boolean;
  createfile: (file: string, dirName?: string) => boolean;
  addDatatoEnd: (data: Buffer, path: string, size: number) => boolean;
  readFilePart: (path: string, length: number, offset: OffsetType) => Buffer;
  writeFilePart: (path: string, length: number, offset: OffsetType) => boolean;
  deleteFile: (file: string) => ReturnMessage;
  deleteDir: (dirName: string) => ReturnMessage;
  deleteFileEnd: (path: string, length: number) => ReturnMessage;
  normalizeFile: () => ReturnMessage;
}

export interface ISearch {}

export interface ICacheEntityStructure extends IEntityStructure {
  importance: number;
}
export interface ICache {
  maxSize: number;
  mostUseless: KeyTypeEntityCache;
  cache: Map<KeyTypeEntityCache, ICacheEntityStructure>;
  makeKeyTypeEntityCache: (
    nameDB: IDataBaseStructure["code"],
    nameCollection: ICollectionStructure["code"],
    key: IEntityStructure["id"]
  ) => KeyTypeEntityCache;
  ejection: () => void;
  setValue: (key: KeyTypeEntityCache, value: IEntityStructure) => ReturnMessage;
  getValue: (key: KeyTypeEntityCache) => IEntityStructure[] | ReturnMessage;
  update: (key: KeyTypeEntityCache, value: IEntityStructure) => ReturnMessage;
  updateImportance: (key: KeyTypeEntityCache) => void;
  deleteUseless: (key: KeyTypeEntityCache) => void;
  writeToFile: (path: string) => void;
  readFromFile: (path: string) => void;
}

export interface IMapDB {
  map: Map<
    ICollectionStructure["name"],
    ICollectionStructure["fileCollectionPath"]
  >;
  filePath: string;
  getCollectionPath: (
    nameColl: ICollectionStructure["name"]
  ) => ICollectionStructure["fileCollectionPath"];
}

export interface ISearchKeyTree {
  map: Map<IEntityStructure["id"], OffsetType>;
  filePath: string;
  getEntityOffset: (id: IEntityStructure["id"]) => OffsetType;
}
export interface ISearchValueTree {
  map: any;
  filePath: string;
  getEntityOffset: (searchWord: string) => OffsetType;
}
