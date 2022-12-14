// const a = +(0o101111).toString(10);
// const b = 0xffff;
// const c = +(50).toString(2);
// console.log(a, b, c);
// Buffer.from;
// console.log(Buffer.alloc(2, a), Buffer.alloc(2, b), Buffer.alloc(2, c));

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { Collections } from "./src/classes/Collections";
import { DataBases } from "./src/classes/DataBases";
import { FileStructure } from "./src/classes/FileStructure";
import { FileSystemDB } from "./src/classes/FileSystem";
import { Repository } from "./src/classes/Repository";

import { TryCatch } from "./src/decorators";

// class MyClass {
//   constructor() {}
//   @TryCatch("кастомная ошибка ")
//   log(a: number) {
//     setTimeout(() => {
//       if (a > 3) throw new Error("Какая-то ошибка");
//       console.log(a);
//     }, 500);
//   }
// }

// const obj = new MyClass();
// obj.log(1);
// obj.log(1);
// obj.log(5);
// obj.log(2);
(async () => {
  const fsDB = new FileSystemDB();
  const fsStruct = new FileStructure(fsDB);
  const db = new DataBases(fsStruct);
  const collection = new Collections(db);
  await collection.connectDB("second");
  // const repositoryOne = new Repository(collection);
  // await repositoryOne.initRepository("second", "collection_one");
  // console.log(await db.getNamesDB());
  // console.log(await collection.getNamesCollection());

  // await repositoryOne.setValue("Тестирование записи значений_1");
  // await repositoryOne.setValue("Тестирование записи значений_2");
  // await repositoryOne.setValue("Тестирование записи значений_3");
  // await repositoryOne.setValue("Тестирование записи значений_4");
  // console.log(await repositoryOne.getById(3));
  // repositoryOne.deleteByKeySoft(3);
  // repositoryOne.changeValue(0, "Замена значений");
  // console.log(await repositoryOne.getAllandDel());

  // await collection.createCollection("collection_one");
  // await collection.createCollection("collection_two");
  // await collection.deleteCollection("collection_one");
  // console.log(await collection.getNamesCollection());
  // console.log(await collection.getNamesCollectionAll());

  //   await fsDB.createDir("collection");
  //   await fsDB.createfile("collection #1.map");
  //   await fsDB.createfile("collection #1.map", "maps");
  //   await fsDB.createfile("collection #1.map", "maps2");
  //   await fsDB.addDatatoEnd(
  //     Buffer.alloc(5, 0x31),
  //     join(fsDB.pathFS, "collection #1.map")
  //   );
  //   console.log(
  //     await fsDB.readFilePart(join(fsDB.pathFS, "collection #1.map"), 4, 13)
  //   );
  //   fsDB.writeFilePart(
  //     join(fsDB.pathFS, "collection #1.map"),
  //     Buffer.alloc(2, 0x00),
  //     19
  //   );
  //   await fsDB.deleteDir(join(fsDB.pathFS, "maps"));
  // await fsDB.deleteFileEnd(join(fsDB.pathFS, "collection #1.map"), 2);
  // await fsStruct.createStructureFS();

  // try {
  //   const files = await readdir(fsDB.pathFS);
  //   console.log(files);

  //   for (const file of files) console.log(file);
  // } catch (err) {
  //   console.error(err);
  // }
  // await fsStruct.createStructureFS();
  // await fsStruct.createStructureDB(["first", "second"]);
  // await db.deleteBDsoft("first");
  // await db.deleteBD("five2");
  // await db.createNewBD("five2");
  // await db.getNamesDB();
  // await db.getNamesDBAllfs();
  // console.log(await db.getNamesDB(), await db.getNamesDBAllfs());
  // const seconds = Math.floor(Date.now() / 1000);
  // const timeBuffer = Buffer.alloc(4, 0x00);
  // timeBuffer.writeUInt32BE(seconds, 0);
  // console.log(timeBuffer.byteLength);
  // console.log(+("0x" + Date.now().toString(16)));
})();
