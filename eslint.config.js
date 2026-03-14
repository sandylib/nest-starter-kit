import nestjsConfig from "@leap/eslint-config-content-creator/nestjs";

export default [
  ...nestjsConfig.map((config) => ({
    ...config,
    ...(config.languageOptions?.parserOptions?.project
      ? {
          languageOptions: {
            ...config.languageOptions,
            parserOptions: {
              ...config.languageOptions.parserOptions,
              project: "./tsconfig.eslint.json",
            },
          },
        }
      : {}),
  })),
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
];
