# CommonTable API（Vue 2 Element UI）

> 配置化数据表格组件，支持动态列、自定义渲染、异步数据加载和分页。

## 引入方式

```js
import { CommonTable } from '@conf-component-tool-lib/vue2-element'
```

---

## Props

| 属性名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `headTitle` | `String \| Array` | 否 | — | 表格头部标题，可覆盖 `tableConf.headTitle` |
| `tableConf` | `Object` | 是 | `{}` | 表格配置对象（核心配置），详见下方 |

### tableConf 配置详解

| 属性 | 类型 | 说明 |
|------|------|------|
| `data` | `Array` | 表格数据数组 |
| `header-cell-style` | `Object` | 表头样式，如 `{color: 'white', background: '#CF324A'}` |
| `on` | `Object` | el-table 事件绑定对象 |
| `highlight-current-row` | `Boolean` | 是否高亮当前行 |
| `selection` | `Array<Object>` | 多选列配置数组，每个对象透传给 `el-table-column` |
| `pagintion` | `Object` | 分页配置（见下方） |
| `columnList` | `Array<ColumnDef>` | 列配置数组（见下方） |
| `requester` | `Object` | 数据请求配置（见下方） |

### ColumnDef 列配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `prop` | `String` | 数据字段名 |
| `label` | `String` | 列标题 |
| `align` | `String` | 对齐方式：`'left'`、`'center'`、`'right'` |
| `width` | `Number` | 列宽度（像素） |
| `formatter` | `Function` | 格式化函数：`(row, column, cellValue) => displayValue` |
| `render` | `Object` | 自定义单元格渲染配置 |
| `headerRender` | `Object` | 自定义表头渲染配置 |
| `columnList` | `Array<ColumnDef>` | 子列配置，用于多级树表头 |

#### render 对象格式

```js
{
  props: ['data', 'row', 'scope', 'conf'],
  render() {
    return <el-link type="primary">{this.data}</el-link>
  }
}
```

**传入的 Props：**
| Prop | 类型 | 说明 |
|------|------|------|
| `data` | `*` | 当前单元格的字段值 |
| `row` | `Object` | 当前行的完整数据对象 |
| `scope` | `Object` | el-table slot-scope 完整对象 |
| `conf` | `Object` | 当前列的配置对象 |

#### headerRender 对象格式

```js
{
  render() {
    return <el-row>
      <el-col>表头标题</el-col>
      <el-col><el-button size="mini">导出</el-button></el-col>
    </el-row>
  }
}
```

**传入的 Props：**
| Prop | 类型 | 说明 |
|------|------|------|
| `scope` | `Object` | 表头 scope 对象 |
| `conf` | `Object` | 当前列的配置对象 |

### requester 数据请求配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `api` | `Function` | 数据请求 API 函数 |
| `params` | `Array` | 请求参数 `[pageIndex, pageSize]`，默认 `[1, 10]` |
| `path` | `String` | 接口返回数据解析路径，如 `'data.list'` |
| `getter` | `Function` | 数据过滤/转换函数，接收解析后的数据 |

```js
requester: {
  api: fetchUserList,
  params: [1, 10],
  path: 'data.list',        // 从响应中提取 res.data.list
  getter: (list) => list.filter(item => item.active)
}
```

### pagintion 分页配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `bind` | `Object` | 覆盖默认分页 el-pagination 属性 |

默认分页属性：
- `page-sizes`: `[5, 10, 20]`
- `layout`: `'total, prev, sizes, pager, next'`
- `background`: `true`

---

## Slots

| 插槽名 | 作用域 | 说明 |
|--------|--------|------|
| `operaNav` | `{ row }` | 操作栏插槽，`row` 为当前选中行数据 |

---

## Methods

通过 `ref` 获取组件实例后调用：

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `init()` | — | 初始化：加载数据并重置表格布局 |
| `initData()` | — | 调用 API 加载数据并更新表格 |
| `search(...params)` | `...params` 搜索参数 | 使用新参数调用 API 并更新表格数据 |
| `restTableLayout()` | — | 重置表格布局（处理动态列变化后的列宽问题） |

---

## 使用示例

### 基础用法

```vue
<template>
  <CommonTable :tableConf="tableConf" />
</template>

<script>
export default {
  data() {
    return {
      tableConf: {
        data: [
          { name: '张三', age: 28, dept: '技术部' },
          { name: '李四', age: 32, dept: '市场部' },
        ],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'age', label: '年龄', align: 'center' },
          { prop: 'dept', label: '部门' },
        ],
      },
    }
  },
}
</script>
```

### 异步数据 + 分页

```vue
<CommonTable :tableConf="tableConf" />

<script>
import { getUserList } from '@/api/user'

export default {
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'status', label: '状态', formatter: (row) => row.active ? '启用' : '禁用' },
        ],
        requester: {
          api: getUserList,
          params: [1, 10],
          path: 'data.list',
        },
        pagintion: {
          bind: { layout: 'total, sizes, prev, pager, next, jumper' },
        },
      },
    }
  },
}
</script>
```

### 多级树表头

```js
columnList: [
  { prop: 'name', label: '姓名' },
  {
    label: '库存礼品',
    columnList: [
      { prop: 'quantity', label: '数量' },
      { prop: 'checkTime', label: '盘库时间' },
    ],
  },
]
```

### 自定义单元格渲染

```js
columnList: [
  {
    prop: 'status',
    label: '状态',
    render: {
      props: ['data', 'row'],
      render() {
        const color = this.data === '启用' ? '#67C23A' : '#F56C6C'
        return <el-tag color={color}>{this.data}</el-tag>
      },
    },
  },
]
```
