import CustomProtocol from "./src";
const { CustomProtocolServer } = CustomProtocol;

const host = "127.0.0.1";
const port = 1337;
CustomProtocolServer.createConnection(host, port);
