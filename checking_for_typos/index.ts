import init from "./src/server/lib/server";
import path from "path";

export const pathDir = path.join(__dirname, "public");

init();
