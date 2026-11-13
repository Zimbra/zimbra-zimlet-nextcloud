import { preactI18nConfig } from '@zimbra/eslint-config';

export function preactI18nConfigFunc(intlPathOverride) {
  process.env.ESLINT_INTL_PATH = intlPathOverride;

  // Major issues with translation in zimlets, so disabling the rule for now. Will need to be re-enabled once translations are fixed.
  preactI18nConfig.rules['preact-i18n/no-unknown-key'] = 'off';

  return preactI18nConfig;
}
