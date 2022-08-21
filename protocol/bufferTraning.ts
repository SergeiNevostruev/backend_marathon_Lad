import { read, write, close } from "fs";
import { open, writeFile, readFile } from "fs/promises";
import { join } from "path";

(async () => {
  const buf = Buffer.alloc(20, 0x0f7);

  buf.write("one two three", 2, "utf8");
  const filePath = join(__dirname, "file", "buf");
  writeFile(filePath, buf);
  console.log(buf);

  const buf2 = Buffer.alloc(20);
  const readBufFile = (await new Promise(async (resolve, reject) => {
    const fdFileBuf = await open(filePath);
    read(fdFileBuf.fd, buf2, 2, 3, 2, (e, b, buffer) => {
      if (e) reject(e);
      resolve(b);
    });
    close(fdFileBuf.fd);
  })) as any;
  console.log(buf2);
})();
