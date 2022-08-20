import * as Hapi from "@hapi/hapi";
import boom from "@hapi/boom";
import { TextCorrector } from "../../common/TextCorrector";

const yaSpellDesc: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { text } = payload as { text: string };
  const correctorYA = new TextCorrector("yandex-speller-api");
  try {
    return await correctorYA.correctText(text);
  } catch (error) {
    return boom.serverUnavailable("Неизвестная ошибка");
  }
};

const nSpellDesc: Hapi.Lifecycle.Method = async (request, h) => {
  const { payload } = request;
  const { text } = payload as { text: string };
  const correctorYA = new TextCorrector("nspell");
  try {
    return await correctorYA.correctText(text);
  } catch (error) {
    return boom.serverUnavailable("Неизвестная ошибка");
  }
};

export default { yaSpellDesc, nSpellDesc };
