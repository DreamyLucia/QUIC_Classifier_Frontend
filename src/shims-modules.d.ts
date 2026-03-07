declare module 'vue-markdown-shiki' {
  import { Plugin, DefineComponent } from 'vue';

  // 声明默认导出 (用于 main.ts 中的 app.use(markdownPlugin))
  const plugin: Plugin;
  export default plugin;

  // 声明具名导出 (用于组件中的 <VueMarkdownIt /> 和 <VueMarkdownItProvider />)
  // DefineComponent<{}, {}, any> 是一个通用的组件类型
  export const VueMarkdownIt: DefineComponent<{}, {}, any>;
  export const VueMarkdownItProvider: DefineComponent<{}, {}, any>;
}