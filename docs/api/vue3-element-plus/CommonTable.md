# CommonTable API（Vue 3 Element Plus）

> 配置化数据表格组件的 Vue 3 版本，支持 `<script setup>` 和 TypeScript。

## 引入方式

```ts
import { CommonTable } from '@conf-component-tool-lib/vue3-element-plus'
// 或 TypeScript 版本
import { CommonTableTs } from '@conf-component-tool-lib/vue3-element-plus'
```

---

## 两个版本对比

| 版本 | 文件 | API 风格 | 类型安全 | v-model |
|------|------|---------|---------|---------|
| `CommonTable` | `index.vue` | `<script setup>` (JS) | 否 | 否 |
| `CommonTableTs` | `CommonTableTs.vue` | `<script setup>` (TS) | 是 | 支持 `v-model` |

---

## Props（TypeScript 版本）

```ts
interface TableProps {
  headTitle?: any[] | string     // 顶部标题
  tableConf: TableConf           // 表格配置（核心）
}
```

### TableConf 类型定义

```ts
interface TableConf extends Partial<TableProps<any>> {
  columnList: ColumnDef[]              // 列配置数组（必需）
  selection?: ColumnDef[]              // 多选列配置
  requester?: Requester                // 数据请求配置
  pagintion?: {                        // 分页配置
    bind?: PaginationProps             // Element Pagination 组件属性
    pageFiled?: string                 // 页码字段名（默认 'page'）
    totalFiled?: string                // 总数字段名（默认 'total'）
  } | boolean
  on?: Record<string, (...args: any[]) => void>  // 事件监听
}
```

### ColumnDef 列配置类型

```ts
interface ColumnDef extends Partial<TableColumnCtx<unknown>> {
  render?: ComponentInstance<any>       // 自定义单元格渲染组件
  headerRender?: ComponentInstance<any> // 自定义表头渲染组件
  [key: string]: any                   // 其他自定义属性
}
```

### Requester 数据请求器

```ts
interface Requester {
  params?: [number, number, any]                // 请求参数数组
  api?: (...args: any[]) => Promise<any>        // 请求 API 方法
  path?: string                                 // 响应数据路径（如 'data.list'）
  getter?: (data: any) => any[]                 // 数据转换方法
}
```

---

## v-model 支持（TypeScript 版本）

TypeScript 版本支持 `v-model` 双向绑定表格数据：

```vue
<CommonTableTs v-model="tableData" :tableConf="tableConf" />
```

当传入 `v-model` 时，数据同步到 `model`；否则同步到 `tableConf.data`。

---

## Slots

| 插槽名 | 作用域 | 说明 |
|--------|--------|------|
| `operaNav` | `{ row }` | 操作栏插槽 |

---

## Expose（暴露方法）

```ts
defineExpose({ initData, search, restTableLayout })
```

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `initData()` | — | 初始化表格数据 |
| `search(...params)` | 搜索参数 | 自定义搜索（仅 JS 版本） |
| `restTableLayout()` | — | 重置表格布局 |

---

## 与 Vue 2 版本的差异

| 差异点 | Vue 2 Element | Vue 3 Element Plus |
|--------|---------------|-------------------|
| **API 风格** | Options API | `<script setup>` |
| **插槽语法** | `slot-scope="scope"` | `#default="scope"` |
| **v-model** | 不支持 | TypeScript 版支持 |
| **分页字段** | `currentPage` / `totalPages` | `pageFiled`(默认 `'page'`) / `totalFiled`(默认 `'total'`） |
| **API 响应** | `{ object }` | `{ data }` |
| **列子组件** | `cm-table-dynamic-column` 递归 | 直接内联 `ElTableColumn` |
| **布局修复** | `this.$refs.commonTable.doLayout()` | `commonTable.value?.doLayout()` |

---

## 使用示例

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import CommonTable from '@conf-component-tool-lib/vue3-element-plus'

const tableConf = ref({
  data: [
    { name: '张三', age: 28 },
    { name: '李四', age: 32 },
  ],
  columnList: [
    { prop: 'name', label: '姓名' },
    { prop: 'age', label: '年龄', align: 'center' },
  ],
})
</script>

<template>
  <CommonTable :tableConf="tableConf" />
</template>
```

### TypeScript + v-model

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import type { TableConf } from '@conf-component-tool-lib/vue3-element-plus'
import { CommonTableTs } from '@conf-component-tool-lib/vue3-element-plus'
import { fetchUsers } from '@/api/user'

const tableData = ref<any[]>([])

const tableConf: TableConf = {
  columnList: [
    { prop: 'name', label: '姓名' },
    { prop: 'status', label: '状态' },
  ],
  requester: {
    api: fetchUsers,
    params: [1, 10, {}],
    path: 'list',
  },
  pagintion: {
    pageFiled: 'pageNum',
    totalFiled: 'total',
  },
}
</script>

<template>
  <CommonTableTs v-model="tableData" :tableConf="tableConf" />
</template>
```
