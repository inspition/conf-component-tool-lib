# conf-component-tool-lib

> 配置化组件工具库 — 通过 JSON 配置驱动复杂业务组件的渲染，适配 Vue 2 / Vue 3 桌面端与移动端。

---

## 简介

`conf-component-tool-lib` 是一套基于配置驱动思想的 Vue 组件库 Monorepo。开发者只需定义结构化的 JSON 配置对象，即可渲染出带有分页、异步加载、自定义渲染的表格、选择器、详情描述等复杂业务组件，无需重复编写模板和生命周期代码。

**减少约 60% 的重复代码，同时保留完整的灵活性。**

---

## 包含子包

| 包名 | 说明 | UI 框架 |
|------|------|---------|
| [`@conf-tool/shared`](./packages/shared) | 共享工具函数（chainAccess、apiReq 等） | 无依赖 |
| [`@conf-tool/vue2-element`](./packages/vue2-element) | Vue 2 配置化组件集合 | Element UI 2.x |
| [`@conf-tool/vue3-element-plus`](./packages/vue3-element-plus) | Vue 3 配置化组件集合 | Element Plus |
| [`@conf-tool/vue2-vant`](./packages/vue2-vant) | Vue 2 移动端配置化组件 | Vant 2.x |

---

## 组件清单

| 组件 | 所属包 | 功能 |
|------|--------|------|
| `CommonTable` | vue2-element, vue3-element-plus | 配置化数据表格（分页、异步、多级表头） |
| `CommonTableTs` | vue3-element-plus | TypeScript 版表格（v-model 支持） |
| `CommonSelect` | vue2-element, vue3-element-plus | 配置化下拉选择器（静态/远程数据） |
| `CommonDescriptions` | vue2-element | 配置化详情描述列表 |
| `CommonCardList` | vue2-vant | 配置化移动端卡片列表（下拉刷新、无限滚动） |

---

## 快速开始

### 安装

```bash
# Vue 2 + Element UI
pnpm add @conf-tool/vue2-element

# Vue 3 + Element Plus
pnpm add @conf-tool/vue3-element-plus

# Vue 2 + Vant 移动端
pnpm add @conf-tool/vue2-vant
```

### 最简示例

```vue
<template>
  <CommonTable :tableConf="tableConf" />
</template>

<script>
import { CommonTable } from '@conf-tool/vue2-element'

export default {
  components: { CommonTable },
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'dept', label: '部门' },
        ],
        requester: {
          api: fetchUserList,
          params: [1, 10],
          path: 'list',         // 从 API 响应 data.list 中取数据
        },
        pagintion: {},          // 自动开启分页
      },
    }
  },
}
</script>
```

---

## 本地开发

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 启动

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行示例
cd examples/vue2-demo && pnpm dev
cd examples/vue3-demo && pnpm dev

# 新建子包
node scripts/new-package.js
```

### 构建命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | 构建所有子包 |
| `pnpm build:shared` | 仅构建 shared |
| `pnpm build:vue2-element` | 仅构建 vue2-element |
| `pnpm build:vue3-element-plus` | 仅构建 vue3-element-plus |
| `pnpm build:vue2-vant` | 仅构建 vue2-vant |
| `pnpm clean` | 清理所有构建产物 |

---

## 文档

| 文档 | 说明 |
|------|------|
| [操作手册](./docs/MANUAL.md) | 框架概念、快速上手、核心机制、常见错误 |
| [CommonTable (Vue 2)](./docs/api/vue2-element/CommonTable.md) | API 参考 |
| [CommonTable (Vue 3)](./docs/api/vue3-element-plus/CommonTable.md) | API 参考 |
| [CommonSelect (Vue 2)](./docs/api/vue2-element/CommonSelect.md) | API 参考 |
| [CommonSelect (Vue 3)](./docs/api/vue3-element-plus/CommonSelect.md) | API 参考 |
| [CommonDescriptions](./docs/api/vue2-element/CommonDescriptions.md) | API 参考 |
| [CommonCardList](./docs/api/vue2-vant/CommonCardList.md) | API 参考 |
| [Shared 工具库](./docs/api/shared/tools.md) | API 参考 |
| [Vue 2 Element 使用指南](./docs/guides/vue2-element.md) | 详细使用说明 |
| [Vue 3 Element Plus 使用指南](./docs/guides/vue3-element-plus.md) | 详细使用说明 |
| [Vue 2 Vant 使用指南](./docs/guides/vue2-vant.md) | 详细使用说明 |
| [Shared 工具指南](./docs/guides/shared.md) | 详细使用说明 |
| [使用示例](./docs/examples/usage-examples.md) | 6 个完整业务示例 |

---

## 项目结构

```
conf-component-tool-lib/
├── packages/
│   ├── shared/             # 共享工具库
│   ├── vue2-element/       # Vue 2 + Element UI 组件包
│   ├── vue3-element-plus/  # Vue 3 + Element Plus 组件包
│   └── vue2-vant/          # Vue 2 + Vant 移动端组件包
├── examples/
│   ├── vue2-demo/          # Vue 2 示例项目
│   └── vue3-demo/          # Vue 3 示例项目
├── docs/                   # 文档
│   ├── MANUAL.md           # 操作手册
│   ├── api/                # API 参考文档
│   ├── guides/             # 使用指南
│   └── examples/           # 使用示例
├── src/                    # 原始组件源码（含完整注释）
└── scripts/                # 脚本工具
```

