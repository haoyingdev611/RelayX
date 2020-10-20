import I18n from "react-native-i18n";
import zh from "./zh";
import en from "./en";

I18n.fallbacks = true;
I18n.defaultLocale = "en";
I18n.translations = {
  en,
  zh
};

export default I18n;
