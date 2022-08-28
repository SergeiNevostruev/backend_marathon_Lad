import { read, write, close } from "fs";
import { open, writeFile, readFile } from "fs/promises";
import { join } from "path";

(async () => {
  const buf = Buffer.alloc(20, 0x0f7);

  // buf.write("one two three", 2, "utf8");
  console.log(buf);
  const filePath = join(__dirname, "file", "buf");
  writeFile(filePath, buf);
  const file = await readFile(filePath);
  console.log(file);

  const buf2 = Buffer.alloc(20);
  // const readBufFile = (await new Promise(async (resolve, reject) => {
  //   const fdFileBuf = await open(filePath);
  //   read(fdFileBuf.fd, buf2, 0, 4, 2, (e, b, buffer) => {
  //     if (e) reject(e);
  //     resolve(b);
  //   });
  //   close(fdFileBuf.fd);
  // })) as any;
  // console.log(buf2);

  const fdFileBuf1 = await open(filePath, "r+");
  // write(fdFileBuf1.fd, Buffer.alloc(4, 0x01), (e) => console.log(e));
  const written = await fdFileBuf1.write(Buffer.alloc(4, 0x01), 0, 4, 3);
  // const written1 = await fdFileBuf1.writev([Buffer.alloc(4, 0x01)], 3);

  close(fdFileBuf1.fd);
  // console.log(written);
  // console.log(buf);
  const file1 = await readFile(filePath);
  console.log(file1);
})();
