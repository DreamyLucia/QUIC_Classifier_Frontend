# 项目初始化

nodejs 18 及以上

```bash
npm install pnpm -g
pnpm install
npm run dev
```

# 依赖说明

## 代码规范类

- eslint：JavaScript/TypeScript 代码检查工具
- @antfu/eslint-config：Anthony Fu 的 ESLint 配置集
- @rushstack/eslint-patch：ESLint 补丁，优化性能
- @typescript-eslint/parser：TypeScript ESLint 解析器
- @vue/eslint-config-typescript：Vue 项目的 TypeScript ESLint 配置
- eslint-plugin-vue：Vue 文件的 ESLint 插件
- husky：Git 钩子管理工具
- cz-conventional-template-zh-cn：中文版 Commitizen 提交模板
- lint-staged：只对暂存文件运行 Lint
- @commitlint/cli：提交信息规范检查
- @commitlint/config-conventional：约定式提交配置

## css优化类

- tailwindcss：原子化 CSS 框架（已禁用 preflight，防止与 Ant Design 样式冲突）
- sass：CSS 预处理器
- sass-loader：Webpack 的 Sass 加载器
- postcss：CSS 后处理工具
- autoprefixer：自动添加浏览器前缀
- ant-design-vue：Ant Design Vue 3 组件库

## 图表可视化
- echarts：百度开源数据可视化图表库

## 工具包

- axios：HTTP 请求库
- dayjs：轻量级时间处理库
- js-cookie：Cookie 操作库
- jsencrypt：RSA 加密库
- lodash：JavaScript 工具函数库
- qs：URL 查询字符串解析和格式化
- vue-clipboard3：剪贴板复制功能
- pinia：Vue 3 状态管理库
- pinia-plugin-persistedstate：Pinia 持久化插件
- vite-plugin-vue-devtools：Vue 开发调试工具
- uuid：生成唯一标识符
- typed.js：打字机动画效果
- vue-i18n：国际化多语言支持
- vue-router：Vue 官方路由
- vue3-otp-input：OTP 验证码输入组件

# 提交代码

无法直接提交，需要执行以下命令

```bash
npm run commit
```

# 项目结构说明

- src/api 所有接口
- src/assets 静态资源
- src/components 公共组件
- src/constants 常量配置
- src/hooks 逻辑复用层
- src/layouts 布局模板
- src/locales 国际化文字支持
- src/router 路由
- src/store 状态管理
- src/style 全局样式入口或变量文件
- src/types 所有类型
- src/views 页面
  - src/views 下面创建不同目录，表示不同页面,相当于一个大模块
  - 每个模块下面创建 index.vue 文件，作为模块的入口文件
  - 每个模块下面创建 components 目录，用于存放模块内部组件
    - 具体模块下 index.vue 与其他 xxx.vue 放在一起即可，无需再创建 components 目录，减少层级
  - 每个模块下还可以创建额外的目录，表示子页面，子页面结构与主页面结构一致，只是内容不同

