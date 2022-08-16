import axios from "axios";
import config from "../config";

(async () => {
  const text = { text: `Берет котав` };
  const req = await axios({
    method: "GET",
    baseURL: config.yaUrl,
    params: text,
  });
  console.log(req.data);
})();
