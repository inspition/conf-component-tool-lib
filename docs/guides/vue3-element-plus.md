# Vue 3 Element Plus 包 使用指南

> `@conf-component-tool-lib/vue3-element-plus` — 基于 Element Plus 的配置化组件集合

## 安装

```bash
pnpm add @conf-component-tool-lib/vue3-element-plus
```

**前置依赖**：
- Vue 3.x
- Element Plus 2.x

## 组件列表

| 组件 | 说明 |
|------|------|
| `CommonTable` | 配置化数据表格（JS 版，`<script setup>`） |
| `CommonTableTs` | TypeScript 版表格（支持 v-model） |
| `CommonSelect` | 配置化下拉选择器（TSX） |

## 引入方式

```ts
// 按需引入
import { CommonTable, CommonTableTs, CommonSelect } from '@conf-component-tool-lib/vue3-element-plus'

// 工具函数
import { apiReq, $confirmReq } from '@conf-component-tool-lib/vue3-element-plus'
```

---

## CommonTable（JS 版）

### 基础用法

```vue
<template>
  <CommonTable ref="commonTable" :tableConf="tableConf">
    <template #operaNav="{ row }">
      <el-button @click="handleEdit(row)">编辑</el-button>
    </template>
  </CommonTable>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { CommonTable } from '@conf-component-tool-lib/vue3-element-plus'

const commonTable = ref(null)

const tableConf = reactive({
  data: [],
  columnList: [
    { prop: 'name', label: '姓名' },
    { prop: 'status', label: '状态' },
  ],
  requester: {
    api: fetchUserList,
    params: [1, 10],
    path: 'list',
  },
  pagintion: {},
})

// 外部触发搜索
function doSearch() {
  commonTable.value.search(1, 20)
}
</script>
```

### 暴露的方法

通过 `defineExpose` 暴露：

```ts
commonTable.value.initData()
commonTable.value.search(page, size)
commonTable.value.restTableLayout()
```

---

## CommonTableTs（TypeScript 版）

### 与 JS 版的区别

| 特性 | CommonTable (JS) | CommonTableTs (TS) |
|------|-------------------|---------------------|
| **语言** | JavaScript | TypeScript |
| **类型安全** | 无 | 完整泛型支持 |
| **v-model** | 不支持 | `v-model:tableConf` |
| **接口定义** | 无 | `TableConf`, `ColumnDef`, `Requester` |

### v-model 用法

```vue
<template>
  <CommonTableTs v-model:tableConf="tableConf" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { CommonTableTs } from '@conf-component-tool-lib/vue3-element-plus'
import type { TableConf } from '@conf-component-tool-lib/vue3-element-plus'

const tableConf = reactive<TableConf>({
  data: [],
  columnList: [
    { prop: 'name', label: '姓名' },
    { prop: 'age', label: '年龄', align: 'center' },
  ],
  requester: {
    api: fetchUsers,
    params: [1, 10],
    path: 'list',
  },
  pagintion: {},
})
</script>
```

### TypeScript 类型定义

```ts
/** 列定义 */
interface ColumnDef {
  prop: string           // 字段名
  label: string          // 表头文本
  align?: string         // 对齐方式
  width?: string | number
  formatter?: (row: any, column: any, cellValue: any) => string
  render?: object        // 自定义渲染组件
  headerRender?: object  // 自定义表头渲染
  columnList?: ColumnDef[] // 子列（多级表头）
}

/** 请求器 */
interface Requester {
  api: (...args: any[]) => Promise<any>
  params?: any[]
  path?: string
  getter?: (data: any) => any
}

/** 表格配置 */
interface TableConf {
  data: any[]
  columnList: ColumnDef[]
  requester?: Requester
  selection?: boolean
  pagintion?: {
    pageSize?: number
    pageSizes?: number[]
    pageFiled?: string    // 页码字段名（默认 'pageNum'）
    totalFiled?: string   // 总数字段名（默认 'total'）
  }
  bind?: Record<string, any>
  on?: Record<string, Function>
}
```

---

## CommonSelect（Vue 3 TSX）

### 基础用法

```vue
<template>
  <CommonSelect v-model="value" :options="options" />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CommonSelect } from '@conf-component-tool-lib/vue3-element-plus'

const value = ref('')

const options = reactive({
  api: fetchTypeList,
  key: 'typeName',
  value: 'typeId',
  path: 'list',
})
</script>
```

### CmOptions 接口

```ts
interface CmOptions {
  api?: (...args: any[]) => Promise<any>   // 异步数据接口
  key?: string         // 显示字段（默认 'label'）
  value?: string       // 值字段（默认 'value'）
  path?: string        // 数据路径
  params?: any         // 请求参数（远程搜索时可为函数）
  change?: Function    // 值变更时自定义回调
}
```

### 静态数据

```vue
<CommonSelect
  v-model="selected"
  :data="[
    { label: '选项一', value: 1 },
    { label: '选项二', value: 2 },
  ]"
/>
```

---

## 与 Vue 2 版的差异

| 方面 | Vue 2 Element | Vue 3 Element Plus |
|------|---------------|---------------------|
| **插槽** | `<template slot-scope="scope">` | `<template #default="scope">` |
| **Ref** | `this.$refs.commonTable` | `const ref = ref(null)` |
| **事件** | `@update="fn"` | `@update:tableConf="fn"` |
| **动态列** | 独立 `cm-table-dynamic-column` 递归子组件 | 内联 `ElTableColumn` |
| **分页字段** | `currentPage` / `totalPages` | 可配置 `pageFiled` / `totalFiled` |
| **Loading** | `v-loading="isLoading"` | `v-loading="isLoading"` |
| **工具函数** | `$catchBack` 使用 `Message` | `$catchBack` 使用 `ElMessage` |

### 迁移提示

从 Vue 2 迁移到 Vue 3 时，`tableConf` 配置结构基本不变，调整点：

1. **组件导入路径**改为 `@conf-component-tool-lib/vue3-element-plus`
2. **Ref 访问**改为 Composition API 风格
3. **分页参数**可能需要通过 `pageFiled` / `totalFiled` 配置字段名
4. **v-on 绑定**需要确保 `tableConf.on` 不为 `undefined`（Vue 3 要求明确对象）

更多信息参见 [API 文档](../api/vue3-element-plus/CommonTable.md)。
