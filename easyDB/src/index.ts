interface IDataBaseStructure {}
interface ICollectionStructure {}
interface IFileStructure {}
interface IEntityStructure {}

type ValuesTypeDB = "string" | "file" | "mix";
type KeysTypeDB = "simple" | "any-number" | "string";
type KeyTypeEntity = number | string;
type ReturnMessage = { message: string; done: boolean };
type SizeType = number;

interface IOptionsInit {}

interface IDataBases {
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

interface ICollections {
  connectCollection: (NameCollection: string) => ICollectionStructure;
  createCollection: (title: string) => ReturnMessage;
  deleteCollection: (title: string) => ReturnMessage;
  deleteCollectionSoft: (title: string) => ReturnMessage;
  getNamesCollection: () => string[];
  normalizeKeys: () => ReturnMessage;
}

interface IRepository {
  setValue: (value: IEntityStructure, key?: KeyTypeEntity) => ReturnMessage;
  getById: (key: KeyTypeEntity) => IEntityStructure | ReturnMessage;
  findValue: (findWord: string) => IEntityStructure[] | ReturnMessage;
}

interface IFileSystem {}
interface ISearch {}
interface ICache {}

interface observerChanges {}
interface ISearchNumberTree {}
interface ISearchValueTree {}
