export interface IYaRequest {
  text: string;
  lang?: string;
  options?: string;
  format?: string;
  callback?: string;
}

interface IYaResponseOne {
  code: number;
  pos: number;
  row: number;
  col: number;
  len: number;
  word: string;
  s: string[];
}

export type IYaResponse = IYaResponseOne[];

export type TypeMethod = "yandex-speller-api" | "nspell"; // онлайн и офлайн обработка текста
