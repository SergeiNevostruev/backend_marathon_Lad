import axios from "axios";
import config from "../../config";
import { IYaResponse, IYaRequest, TypeMethod } from "../../interface";
import natural from "natural";
import dictionaryRu from "dictionary-ru";
import NSpell from "nspell";

interface ITextCorrector {
  correctText(text: string): Promise<string>;
}

interface ISpotter {
  correctText(text: string): Promise<string>;
}

class YandexSpeller implements ISpotter {
  constructor() {}
  private async changeText(text: string): Promise<IYaResponse> {
    const reqText: IYaRequest = { text };
    try {
      const req = await axios.get(config.yaUrl, { params: reqText });
      const result: IYaResponse = req.data;
      return result;
    } catch (error) {
      console.log("Не удалось получить ответ");
      return [] as IYaResponse;
    }
  }
  async correctText(text: string): Promise<string> {
    let offset = 0;
    let changeText = text;
    let prefix: string;
    let postfix: string;
    let beginFindText: number;
    let mistakes: IYaResponse;
    if (text.length > 9500) return "введен слишком большой текст";
    mistakes = await this.changeText(text);
    for (const mistake of mistakes) {
      beginFindText = offset + mistake.pos;
      prefix = changeText.slice(0, beginFindText);
      postfix = changeText.slice(beginFindText);
      changeText = prefix + postfix.replace(mistake.word, mistake.s[0]);
      offset = mistake.s[0].length - mistake.word.length;
    }
    return changeText;
  }
}

class NSpeller implements ISpotter {
  constructor() {}
  private dictionaryChange = (
    text: string[],
    dictionary: (callback: any) => void //передаем нужный словарь
  ): Promise<any[any]> =>
    new Promise((resolve, rejact) => {
      dictionary(ondictionary);
      function ondictionary(err: any, dict: any) {
        if (err) {
          rejact(err);
          throw err;
        }
        const spell = NSpell(dict);
        const correctWord = text
          .map((v) => [v, spell.suggest(v)])
          .filter((v) => v[1].length > 0);
        resolve(correctWord);
      }
    });
  async correctText(text: string): Promise<string> {
    let newText = text;
    let reg: RegExp;
    const tokenazer = new natural.CaseTokenizer();
    const wordsToken = tokenazer.tokenize(text);
    const correctedWords = await this.dictionaryChange(
      wordsToken,
      dictionaryRu
    );
    for (const word of correctedWords) {
      reg = new RegExp(word[0], "g");
      newText = newText.replace(
        reg,
        word[1].length === 1 ? word[1][0] : `<?? ${word[1].join(" | ")} ??>`
      );
    }
    return newText;
  }
}

export class TextCorrector implements ITextCorrector {
  private spotter: ISpotter;
  constructor(method: TypeMethod) {
    switch (method) {
      case "nspell":
        this.spotter = new NSpeller();
        break;
      case "yandex-speller-api":
        this.spotter = new YandexSpeller();
        break;
      default:
        throw new Error("Не верно указан корректировщик текста");
        break;
    }
  }

  async correctText(text: string): Promise<string> {
    return await this.spotter.correctText(text);
  }
}
