/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  extends: ['@antfu'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // 不允许使用控制台，除了 warn error
    'no-console': ["error", { allow: ["info", "warn", "error"] }],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'CallExpression[callee.object.name="console"][callee.property.name!=/^(log|warn|error|info|trace)$/]',
        message: 'Unexpected property on console object was called',
      },
    ],
    'vue/eqeqeq': ['off'],
    // 可以将this赋值给其他变量
    '@typescript-eslint/no-this-alias': ['off'],
    '@typescript-eslint/semi': ['off'],
    '@typescript-eslint/quotes': ['off'],
    '@typescript-eslint/member-delimiter-style': ['off'],
    'import/order': ['off'],
    'unused-imports/no-unused-imports': 'off', // 允许未使用的导入
  },
}
