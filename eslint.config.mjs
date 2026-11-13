import path from 'node:path';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { coreJsConfig, customConfig, reactConfig, prettierConfig } from '@zimbra/eslint-config';

import { preactI18nConfigFunc } from './eslint.override.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const packagesDir = path.join(__dirname, 'packages');
const packageDirs = readdirSync(__dirname, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const testGlobals = {
  expect: true,
  it: true,
  describe: true
};

// Ignore directory patterns
const globalIgnores = [
  '**/node_modules/**',
  '**/build/**',
  '**/package-lock.json',
  '**/package.json',
  '**/archived/**'
];

// Helper function to merge a specific key from multiple configs
const mergeConfigKey = (configs, key) =>
  Object.assign({}, ...configs.map(config => config[key] || {}));

// Configs to merge for JavaScript files
const jsConfigs = [coreJsConfig, customConfig, reactConfig, prettierConfig];

// Config for modern zimlets
const jsConfig = {
  files: ['**/*.{js,mjs}'],

  languageOptions: coreJsConfig.languageOptions,

  plugins: mergeConfigKey(jsConfigs, 'plugins'),
  rules: mergeConfigKey(jsConfigs, 'rules'),
  settings: mergeConfigKey(jsConfigs, 'settings')
};

// Build unit tests config
const testsConfig = {
  ...jsConfig,
  files: ['**/*/tests/**/*.{js,mjs}'],
  languageOptions: {
    ...jsConfig.languageOptions,
    globals: {
      ...jsConfig.languageOptions.globals,
      ...testGlobals
    }
  }
};

const intlConfig = packageDirs.map(packageName => {
  const packagePath = path.join(__dirname, packageName);

  return {
    files: path.join(packagePath, 'src', 'intl', '*.json'),

    ...preactI18nConfigFunc(path.join(packagePath, 'src', 'intl'))
  };
});

export default [
  {
    ignores: globalIgnores
  },
  jsConfig,
  testsConfig,
  ...intlConfig
];
