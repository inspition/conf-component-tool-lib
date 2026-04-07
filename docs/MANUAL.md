# conf-component-tool-lib 操作手册

> 配置化组件工具库 — 通过 JSON 配置驱动复杂业务组件的渲染

---

## 目录

1. [什么是配置化组件](#1-什么是配置化组件)
2. [为什么选择它](#2-为什么选择它)
3. [安装与设置](#3-安装与设置)
4. [5 分钟快速上手](#4-5-分钟快速上手)
5. [核心概念深解](#5-核心概念深解)
6. [组件清单](#6-组件清单)
7. [跨框架兼容性指南](#7-跨框架兼容性指南)
8. [常见错误与排查](#8-常见错误与排查)

---

## 1. 什么是配置化组件

**配置化组件**是一种将复杂 UI 逻辑从模板代码转移到**结构化 JSON 配置对象**中的开发范式。

开发者只需定义配置即可实现表格、选择器、描述列表等复杂业务组件，无需编写冗长的模板和生命周期代码。

### 核心理念

```
传统方式：开发者编写「模板 + 逻辑 + 样式」三件套
配置化方式：开发者编写「配置对象」，组件库负责渲染
```

### 传统方式 vs 配置化方式

**传统方式**（~60 行）：
```vue
<template>
  <el-table :data="tableData" v-loading="loading">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="age" label="年龄" align="center" />
    <el-table-column prop="status" label="状态">
      <template slot-scope="scope">
        <el-tag :type="scope.row.active ? 'success' : 'danger'">
          {{ scope.row.active ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    @current-change="handlePageChange"
    @size-change="handleSizeChange"
    :current-page="page"
    :page-size="size"
    :total="total"
    layout="total, prev, sizes, pager, next"
  />
</template>

<script>
export default {
  data() {
    return { tableData: [], loading: false, page: 1, size: 10, total: 0 }
  },
  mounted() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      const res = await api(this.page, this.size)
      this.tableData = res.data.list
      this.total = res.data.total
      this.loading = false
    },
    handlePageChange(p) { this.page = p; this.fetchData() },
    handleSizeChange(s) { this.size = s; this.fetchData() },
  },
}
</script>
```

**配置化方式**（~25 行）：
```vue
<template>
  <CommonTable :tableConf="tableConf" />
</template>

<script>
export default {
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'age', label: '年龄', align: 'center' },
          { prop: 'status', label: '状态', render: StatusTag },
        ],
        requester: {
          api: fetchUserList,
          params: [1, 10],
          path: 'data.list',
        },
        pagintion: {},
      },
    }
  },
}
</script>
```

**减少约 60% 的代码量**，同时获得分页、loading、数据加载的自动管理。

---

## 2. 为什么选择它

| 优势 | 说明 |
|------|------|
| **开发效率** | 减少 50-60% 的模板和逻辑代码 |
| **跨框架通用** | 同一套配置协议适用于 Vue 2 Element、Vue 3 Element Plus、移动端 Vant |
| **灵活可扩展** | 通过 `render` 函数支持任意自定义渲染，不受配置限制 |
| **数据智能提取** | `chainAccess` + `path` 自动从嵌套 API 响应中提取数据 |
| **渐进式学习** | 新手可用静态配置快速上手，进阶后通过 render/formatter 释放全部能力 |
| **统一规范** | 团队共享一套配置协议，减少代码风格差异 |

---

## 3. 安装与设置

### 前提条件

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
# 按需安装对应包
pnpm add @conf-component-tool-lib/vue2-element    # Vue 2 + Element UI
pnpm add @conf-component-tool-lib/vue3-element-plus  # Vue 3 + Element Plus
pnpm add @conf-component-tool-lib/vue2-vant       # Vue 2 + Vant（移动端）

# 共享工具库（各包已自动依赖）
pnpm add @conf-component-tool-lib/shared
```

### Monorepo 开发

```bash
# 克隆仓库
git clone <repository-url>
cd conf-component-tool-lib

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 构建单个包
pnpm build:shared
pnpm build:vue2-element
pnpm build:vue3-element-plus
pnpm build:vue2-vant

# 运行 Demo
cd examples/vue2-demo && pnpm dev
cd examples/vue3-demo && pnpm dev
```

### 项目中引入

```js
// Vue 2 项目
import { CommonTable, CommonSelect, CommonDescriptions } from '@conf-component-tool-lib/vue2-element'

// Vue 3 项目
import { CommonTable, CommonSelect } from '@conf-component-tool-lib/vue3-element-plus'

// 移动端项目
import { CommonCardList } from '@conf-component-tool-lib/vue2-vant'

// 共享工具
import { chainAccess, getValue, itemFiledsMap } from '@conf-component-tool-lib/shared'
```

---

## 4. 5 分钟快速上手

### 示例 1：最简单的表格

```vue
<template>
  <CommonTable :tableConf="tableConf" />
</template>

<script>
import { CommonTable } from '@conf-component-tool-lib/vue2-element'

export default {
  components: { CommonTable },
  data() {
    return {
      tableConf: {
        data: [
          { name: '张三', age: 28, dept: '技术部' },
          { name: '李四', age: 32, dept: '市场部' },
        ],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'age', label: '年龄' },
          { prop: 'dept', label: '部门' },
        ],
      },
    }
  },
}
</script>
```

### 示例 2：从 API 自动加载数据

```vue
<CommonTable :tableConf="tableConf" />

<script>
export default {
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'status', label: '状态' },
        ],
        requester: {
          api: () => fetch('/api/users').then(r => r.json()),
          params: [1, 10],
          path: 'data.list',    // 从返回值中取 data.list
        },
        pagintion: {},          // 开启分页
      },
    }
  },
}
</script>
```

### 示例 3：下拉选择器

```vue
<CommonSelect
  v-model="selectedDept"
  :options="{
    api: fetchDeptList,
    key: 'deptName',
    value: 'deptId',
    path: 'data.list',
  }"
/>
```

---

## 5. 核心概念深解

### 5.1 配置对象三板斧

所有组件的核心能力都围绕三个配置展开：

| 配置 | 作用 | 适用组件 |
|------|------|---------|
| `requester` | 异步数据加载 | Table、Select、Descriptions、CardList |
| `render` | 自定义渲染 | Table、Descriptions、CardList |
| `formatter` | 单元格格式化 | Table、Descriptions |

### 5.2 chainAccess 与 path 机制

`chainAccess` 是整个框架的数据提取引擎。它通过字符串路径从嵌套对象中提取数据。

**工作原理**：
```
输入: chainAccess({ data: { list: [1, 2, 3] } }, 'data.list')
过程: 'data.list' → ['data', 'list'] → obj['data'] → result['list']
输出: [1, 2, 3]
```

**实际场景**：

假设你的 API 返回如下结构：
```json
{
  "code": 0,
  "data": {
    "pageInfo": {
      "list": [
        { "id": 1, "name": "张三" },
        { "id": 2, "name": "李四" }
      ],
      "total": 100,
      "pageNum": 1
    }
  }
}
```

配置方式：
```js
requester: {
  api: fetchUsers,
  params: [1, 10],
  path: 'data.pageInfo.list',   // ← 精确到列表位置
}
```

> **⚠️ 易错点**：`path` 是从 `$thenBack` 处理后的数据开始的。`$thenBack` 已经取出了 `res.data`，所以如果 API 返回 `{ code: 0, data: { list: [...] } }`，那么 `path` 应该是 `'list'` 而不是 `'data.list'`。

### 5.3 render 函数自定义渲染

当配置化不够灵活时，`render` 函数让你可以注入任意 Vue 组件：

```js
{
  prop: 'status',
  label: '状态',
  render: {
    props: ['data', 'row', 'scope', 'conf'],
    render() {
      // data = 当前单元格值（row[prop]）
      // row  = 当前行完整数据
      // scope = el-table slot-scope
      // conf  = 当前列配置

      if (this.data === '正常') {
        return <el-tag type="success">正常</el-tag>
      }
      return <el-tag type="danger">异常</el-tag>
    }
  }
}
```

**数据流向**：
```
tableConf.data[rowIndex]  →  scope.row
scope.row[conf.prop]      →  render.props.data
scope                     →  render.props.scope
columnDef                 →  render.props.conf
```

### 5.4 requester 异步数据生命周期

```
组件挂载 (mounted)
    ↓
检查 requester 是否存在
    ↓ 存在
isLoading = true
    ↓
调用 api(...params)
    ↓
$thenBack 处理返回值（检查 code === 0）
    ↓
chainAccess(response, path) → 提取表格数据
    ↓
getter?.(data) → 可选的二次转换
    ↓
tableConf.data = 处理后的数据
pageInfo = 原始响应（用于分页）
    ↓
isLoading = false
```

### 5.5 formatter 格式化

`formatter` 用于在不需要完整 render 组件时对显示值进行简单转换：

```js
// 基础格式化
{ prop: 'amount', label: '金额', formatter: (row, col, val) => `¥${val}` }

// 条件渲染
{ 
  prop: 'score', 
  label: '评分',
  formatter: (row) => row.totalFlag === 'Y' ? '' : row.score 
}

// 数值保留小数
{ prop: 'rate', label: '利率', formatter: (row, col, val) => (val * 100).toFixed(2) + '%' }
```

> **注意**：`formatter` 的参数是 `(row, column, cellValue)`，不是 `(cellValue)`。

---

## 6. 组件清单

| 组件 | 所属包 | 功能 |
|------|--------|------|
| `CommonTable` | vue2-element, vue3-element-plus | 配置化数据表格 |
| `CommonTableTs` | vue3-element-plus | TypeScript 版表格（支持 v-model） |
| `CommonSelect` | vue2-element, vue3-element-plus | 配置化下拉选择器 |
| `CommonDescriptions` | vue2-element | 配置化详情描述列表 |
| `CommonCardList` | vue2-vant | 配置化卡片列表（移动端） |

### 详细 API 文档

- [CommonTable (Vue 2)](./api/vue2-element/CommonTable.md)
- [CommonTable (Vue 3)](./api/vue3-element-plus/CommonTable.md)
- [CommonSelect (Vue 2)](./api/vue2-element/CommonSelect.md)
- [CommonSelect (Vue 3)](./api/vue3-element-plus/CommonSelect.md)
- [CommonDescriptions](./api/vue2-element/CommonDescriptions.md)
- [CommonCardList](./api/vue2-vant/CommonCardList.md)
- [Shared 工具库](./api/shared/tools.md)

---

## 7. 跨框架兼容性指南

### Vue 2 vs Vue 3 写法对比

| 差异点 | Vue 2 Element UI | Vue 3 Element Plus |
|--------|-----------------|-------------------|
| **API 风格** | Options API | `<script setup>` / Composition API |
| **插槽语法** | `slot-scope="scope"` | `#default="scope"` |
| **v-model** | `v-model` (model选项) | `v-model` (modelValue) |
| **事件绑定** | `v-on="tableConf.on"` | `v-on="tableConf.on ?? {}"` |
| **动态列** | `cm-table-dynamic-column` 递归子组件 | 内联 `ElTableColumn` |
| **分页字段** | `currentPage` / `totalPages` | 可配置 `pageFiled` / `totalFiled` |
| **API 响应** | `{ object }` | `{ data }` |
| **Ref 访问** | `this.$refs.commonTable` | `commonTable.value` |
| **暴露方法** | 自动暴露 | `defineExpose({ initData, ... })` |

### 移动端 Vant 特殊性

| 特性 | 桌面端 Table | 移动端 CardList |
|------|-------------|----------------|
| **布局** | 表格行列 | 卡片列表 |
| **分页** | el-pagination 组件 | van-list 虚拟滚动加载 |
| **刷新** | 手动调用方法 | van-pull-refresh 下拉 |
| **参数格式** | 数组 `[page, size]` | 对象 `{ page, size }` |
| **数据模式** | 替换 | 追加（infinite scroll） |

### 配置协议统一性

所有框架共享以下核心概念：

✅ `requester` — 异步数据加载  
✅ `render` — 自定义渲染  
✅ `chainAccess` + `path` — 数据路径提取  
✅ `formatter` — 格式化函数  
✅ `apiReq` — API 请求封装  

---

## 8. 常见错误与排查

### ❌ 错误 1：path 路径配置错误

**症状**：表格加载后数据为空

**原因**：`$thenBack` 已经从 `res.data` 中取出了数据，`path` 应该基于处理后的数据

```js
// API 返回: { code: 0, data: { list: [...], total: 100 } }

// ❌ 错误:
requester: { path: 'data.list' }    // data 已经被 $thenBack 取出

// ✅ 正确:
requester: { path: 'list' }         // 直接从 data 对象中取 list
```

### ❌ 错误 2：render props 理解错误

**症状**：render 组件中无法访问数据

```js
// ❌ 错误: 未声明 props
render: {
  render() {
    return <span>{this.data}</span>   // this.data 是 undefined
  }
}

// ✅ 正确: 声明需要的 props
render: {
  props: ['data', 'row'],
  render() {
    return <span>{this.data}</span>   // ✅ 正常访问
  }
}
```

### ❌ 错误 3：formatter 参数混淆

**症状**：formatter 返回 undefined

```js
// ❌ 错误: 参数顺序错误
formatter: (cellValue) => cellValue + '元'

// ✅ 正确: 三个参数 (row, column, cellValue)
formatter: (row, column, cellValue) => cellValue + '元'
```

### ❌ 错误 4：分页参数未重置

**症状**：下拉刷新后显示旧数据

```js
// ❌ 错误: 刷新时未重置页码
onRefresh() {
  this.search()         // 仍然使用旧的页码参数
}

// ✅ 正确: 先重置页码再搜索
onRefresh() {
  this.requester.params.page = 1
  this.search()
}
```

### ❌ 错误 5：数值 0 显示为 '--'

**症状**：数值为 0 的单元格显示占位符 `--`

**解决**：`cm-table-dynamic-column` 已内置处理，会将数值 0 转为字符串 `'0'` 避免被 falsy 判断。如果仍出现问题，检查是否使用了自定义 formatter：

```js
// ❌ 有问题的 formatter
formatter: (row, col, val) => val || '--'  // 0 会变成 '--'

// ✅ 正确的 formatter
formatter: (row, col, val) => val === null || val === undefined ? '--' : val
```

---

## 附录

### 项目结构

```
conf-component-tool-lib/
├── packages/
│   ├── shared/            # 共享工具库
│   ├── vue2-element/      # Vue 2 + Element UI 组件包
│   ├── vue3-element-plus/ # Vue 3 + Element Plus 组件包
│   └── vue2-vant/         # Vue 2 + Vant 移动端组件包
├── examples/
│   ├── vue2-demo/         # Vue 2 示例项目
│   ├── vue3-demo/         # Vue 3 示例项目
│   └── react-demo/        # React 示例项目（预留）
├── src/                   # 原始组件源代码（含完整注释）
├── docs/                  # 文档
│   ├── MANUAL.md          # 本操作手册
│   ├── api/               # API 参考文档
│   ├── guides/            # 使用指南
│   └── examples/          # 使用示例
└── scripts/               # 构建脚本
```

### 构建命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | 构建所有包 |
| `pnpm build:shared` | 构建共享工具库 |
| `pnpm build:vue2-element` | 构建 Vue 2 Element 包 |
| `pnpm build:vue3-element-plus` | 构建 Vue 3 Element Plus 包 |
| `pnpm build:vue2-vant` | 构建 Vue 2 Vant 包 |
| `pnpm clean` | 清理所有构建产物 |
| `pnpm new-package` | 创建新的子包 |
