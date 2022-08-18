import { TextCorrector } from "./common/TextCorrector";

const correctorYA = new TextCorrector("yandex-speller-api");
const correctorNS = new TextCorrector("nspell");
const misspelledText = `Пришло теплое лето. На
лисной апушки распускаюца колоколчики, незабутки, шыповник. Белые ромашки
пратягивают к сонцу свои нежные лепески. Вылитают из уютных гнёзд птинцы. У
зверей взраслеет смена. Мидвежата старше всех. Они радились еще холодной зимой
в берлоги. Теперь они послушно следуют за строгай матерью. Рыжые лесята весело
играют у нары. А кто мелькает в сасновых ветках? Да это лофкие бельчята
совершают свои первые высотные прышки. В сумерках выходят на охоту колючии
ежата.`;

(async () => {
  console.log(await correctorNS.correctText(misspelledText));
})();

(async () => {
  console.log(await correctorYA.correctText(misspelledText));
})();
