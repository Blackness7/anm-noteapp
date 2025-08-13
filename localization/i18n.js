import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './en.json';
import ar from './ar.json';
import id from './id.json';

const i18n = new I18n({ en, ar, id });

i18n.locale = Localization.getLocales()[0].languageCode;
i18n.enableFallback = true;
i18n.defaultLocale = "en";

export default i18n;
