import axios from "axios";
import config from "../../config";
import { IYaResponse } from "../../interface";

interface ITextCorrector {
  correctText(text: string): string;
}

interface ISpotter {
  correctText(text: string): string;
}

type TypeMethod = "yandex-speller-api" | "nspell";

class YandexSpeller implements ISpotter {
  constructor() {}
  private async changeText(text: string): Promise<IYaResponse> {
    try {
      const req = await axios.get(config.yaUrl, { params: { text } });
      const result: IYaResponse = req.data;
      return result;
    } catch (error) {
      console.log("Не удалось получить ответ");
      return [] as IYaResponse;
    }
  }
  correctText(text: string): string {
    return "";
  }
}

class NSpeller implements ISpotter {
  constructor() {}
  correctText(text: string): string {
    return "";
  }
}

class TextCorrector implements ITextCorrector {
  private spotter: any;
  constructor(public method: TypeMethod) {}
  private changeText(text: string) {
    return [{}] as IYaResponse;
  }
  correctText(text: string): string {
    return "";
  }
}
