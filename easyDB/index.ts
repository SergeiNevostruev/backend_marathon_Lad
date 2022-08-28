// const a = +(0o101111).toString(10);
// const b = 0xffff;
// const c = +(50).toString(2);
// console.log(a, b, c);
// Buffer.from;
// console.log(Buffer.alloc(2, a), Buffer.alloc(2, b), Buffer.alloc(2, c));

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { DataBases } from "./src/classes/DataBases";
import { FileStructure } from "./src/classes/FileStructure";
import { FileSystemDB } from "./src/classes/FileSystem";

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
  await db.deleteBD("five2");
  // await db.createNewBD("five2");
  // await db.getNamesDB();
  // await db.getNamesDBAllfs();
  // console.log(await db.getNamesDB(), await db.getNamesDBAllfs());
})();
