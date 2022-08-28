import {
  ICollections,
  ICollectionStructure,
  ReturnMessage,
} from "../interface";

export class Collections implements ICollections {
  connectCollection(NameCollection: string): ICollectionStructure {
    throw new Error("Method not implemented.");
  }
  createCollection(title: string): ReturnMessage {
    throw new Error("Method not implemented.");
  }
  deleteCollection(title: string): ReturnMessage {
    throw new Error("Method not implemented.");
  }
  deleteCollectionSoft(title: string): ReturnMessage {
    throw new Error("Method not implemented.");
  }
  getNamesCollection(): string[] {
    throw new Error("Method not implemented.");
  }
  normalizeKeys(): ReturnMessage {
    throw new Error("Method not implemented.");
  }
}
