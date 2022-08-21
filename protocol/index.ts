import net from "net";
import { CustomProtocol } from "./src/common/CustomProtocol";

const host = "127.0.0.1";
const port = 1337;
const servers = CustomProtocol.createConnection(host, port);
// server.listen(1337, "127.0.0.1");
// server.on("listening", () => {
//   console.log("server start");
// });
// server.on("connection", (socket) => {
//   socket.write("Echo server\r\n");
//   socket.pipe(socket);
// });
