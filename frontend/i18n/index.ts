import { createI18n } from 'vue-i18n';

import en_us from './lang/en_us';

const lang = {
    en: en_us,
};

const i18n: any = createI18n({
    locale: 'en',
    messages: lang,
});

export default i18n;

export function parseLanguage(key: string): string {
    const value = i18n.global.t(key);
    if (!value) {
        console.error(
            `can not find multi-language value for key '${key}' with ${i18n.global.locale} environment. Check it please.`,
        );
    }
    return value;
}

export function t(key: string): string {
    return parseLanguage(key);
}
