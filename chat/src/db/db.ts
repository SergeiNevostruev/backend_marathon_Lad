import mongoose from "mongoose";
import { mongo_config } from "./db_config";

export async function dbStart() {
  await mongoose.connect(
    mongo_config.url
    //   {
    //   user: mongo_config.user,
    //   pass: mongo_config.pwd,
    // }
  );
}
