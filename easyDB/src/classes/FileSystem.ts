import { close, existsSync, read } from "fs";
import {
  access,
  appendFile,
  mkdir,
  open,
  rm,
  rmdir,
  writeFile,
} from "fs/promises";
import { join } from "path";
import { TryCatch } from "../decorators";
import { IFileStructure, IFileSystem, ReturnMessage } from "../interface";

export class FileSystemDB implements IFileSystem {
  public pathFS: string;
  constructor() {
    const FS_DIR_NAME: IFileStructure["dbFileSystemStruct"]["title"] =
      "easydbfiles";
    this.pathFS = join(__dirname, "..", "..", FS_DIR_NAME);
  }

  calcOffset(key: number, lengthOneEntity: number): number {
    return key * lengthOneEntity;
  }

  @TryCatch("Не возможно создать дирректорию, она уже существует")
  async createDir(dirName: string): Promise<boolean | void> {
    const dirPath = join(this.pathFS, dirName);
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
      return true;
    } else {
      await Promise.reject(new Error(`${dirName} существует в ${this.pathFS}`));
    }
  }

  @TryCatch("Не возможно создать файл, он уже существует")
  async createFile(
    file: string,
    data?: any,
    dirName?: string | undefined
  ): Promise<boolean | void> {
    let pathFile = join(this.pathFS, file);
    if (dirName) {
      await this.createDir(dirName);
      pathFile = join(this.pathFS, dirName, file);
    }
    if (!existsSync(pathFile)) {
      await writeFile(pathFile, data || "");
      return true;
    } else {
      await Promise.reject(new Error(`${file} существует в ${pathFile}`));
    }
  }

  @TryCatch("Не возможно добавить инфомарцию в файл")
  async addDatatoEnd(data: Buffer, path: string): Promise<boolean | void> {
    await access(path);
    await appendFile(path, data);
    return true;
  }

  @TryCatch("Не возможно считать с файла")
  async readFilePart(
    path: string,
    length: number,
    offset: number
  ): Promise<Buffer> {
    await access(path);
    const resultBuffer = Buffer.alloc(length);
    const readBufFile = new Promise(async (resolve, reject) => {
      const fdFileBuf = await open(path);
      read(
        fdFileBuf.fd,
        resultBuffer,
        0,
        length,
        offset,
        (err, byteLen, buffer) => {
          if (err) reject(err);
          resolve(buffer);
        }
      );
      close(fdFileBuf.fd);
    }) as any;
    return await readBufFile;
  }

  @TryCatch("Не возможно записать в файл")
  async writeFilePart(
    path: string,
    data: Buffer,
    offset: number
  ): Promise<boolean> {
    await access(path);
    const fdFileBuf = await open(path, "r+");
    await fdFileBuf.write(data, 0, data.length, offset);
    close(fdFileBuf.fd);
    return true;
  }

  @TryCatch("Не возможно удалить файл")
  async deleteFile(filePath: string): Promise<boolean> {
    await access(filePath);
    await rm(filePath);
    return true;
  }

  @TryCatch("Не возможно удалить директорию")
  async deleteDir(dirPath: string): Promise<boolean> {
    await access(dirPath);
    await rm(dirPath, { recursive: true });
    return true;
  }

  @TryCatch("Не возможно удалить концовку в файле")
  async deleteFileEnd(path: string, length: number): Promise<boolean> {
    await access(path);
    const fdFileBuf = await open(path, "r+");
    const size = (await fdFileBuf.stat()).size;
    await fdFileBuf.truncate(size - length);
    fdFileBuf.close();
    return true;
  }
  // метод не реализован и должен производить удаление нулевых ячеек, чтобы уменьшить объем файла данных...
  normalizeFile(): Promise<ReturnMessage> {
    throw new Error("Method not implemented.");
  }
}
