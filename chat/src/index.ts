import init from "./server/lib/server";
import { dbStart } from "./db/db";

// console.log(process.env);

dbStart().catch((e) => console.log(e));
init().catch((e) => console.log(e));
