# 项目初始化

nodejs 18 及以上

```bash
npm install pnpm -g
pnpm install
npm run dev
```

# 依赖说明

## 代码规范类

- eslint 代码规范
- @antfu/eslint-config 代码规范
- @rushstack/eslint-patch 代码规范
- @typescript-eslint/parser 代码规范
- @vue/eslint-config-typescript 代码规范
- eslint-plugin-vue 代码规范
- husky 提交代码规范
- cz-conventional-template-zh-cn 提交代码规范
- lint-staged 提交代码规范
- @commitlint/cli 提交代码规范
- @commitlint/config-conventional 提交代码规范

## css优化类

- tailwindcss 样式优化
- sass-loader sass 样式优化
- sass 样式优化
- postcss  样式优化
- autoprefixer  样式优化
- ant-design-vue UI 组件库

其中 tailwindcss 禁用 preflight ，防止与 antd 样式冲突，关闭之后就可以兼容其他UI框架了。

## 工具包

- axios 网络请求
- dayjs 时间处理
- js-cookie 本地存储
- jsencrypt 加密
- lodash 集成多种功能的强大工具库
- qs 解析和格式化 URL 查询字符串
- vue-clipboard3 复制粘贴
- pinia 状态管理
- vite-plugin-vue-devtools 开发调试工具

# 提交代码

无法直接提交，需要执行以下命令

```bash
npm run commit
```

# 项目结构说明

- src/components 公共组件
- src/locales 国际化文字支持，未完全支持
- src/utils 工具
- src/store 状态管理
- src/router 路由
- src/api 所有接口
- src/assets 静态资源
- src/types 所有类型
- src/views 页面
  - src/views 下面创建不同目录，表示不同页面,相当于一个大模块
  - 每个模块下面创建 index.vue 文件，作为模块的入口文件
  - 每个模块下面创建 components 目录，用于存放模块内部组件
    - 具体模块下 index.vue 与其他 xxx.vue 放在一起即可，无需再创建 components 目录，减少层级
  - 每个模块下还可以创建额外的目录，表示子页面，子页面结构与主页面结构一致，只是内容不同

