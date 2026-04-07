# Vue 2 Vant 包 使用指南

> `@conf-tool/vue2-vant` — 基于 Vant 的移动端配置化组件

## 安装

```bash
pnpm add @conf-tool/vue2-vant
```

**前置依赖**：
- Vue 2.x
- Vant 2.x

## 组件列表

| 组件 | 说明 |
|------|------|
| `CommonCardList` | 配置化卡片列表，支持下拉刷新、无限滚动加载 |

## 引入方式

```js
import { CommonCardList } from '@conf-tool/vue2-vant'
```

---

## CommonCardList 完全指南

### 核心特性

- **下拉刷新**：基于 `van-pull-refresh`，支持自定义刷新文案
- **无限滚动**：基于 `van-list`，自动加载下一页数据（追加模式）
- **卡片布局**：每条数据独立渲染为 `van-cell` 卡片
- **操作栏**：支持底部操作按钮
- **自定义插槽**：支持 JSX render 和具名插槽

### 基础用法

```vue
<template>
  <CommonCardList :listConf="listConf" />
</template>

<script>
import { CommonCardList } from '@conf-tool/vue2-vant'
import { getOrderList } from '@/api/order'

export default {
  components: { CommonCardList },
  data() {
    return {
      listConf: {
        data: [],
        requester: {
          api: getOrderList,
          params: { page: 1, size: 10 },
          path: 'list',
        },
      },
    }
  },
}
</script>
```

### 完整配置示例

```js
listConf: {
  data: [],

  // 是否启用分页加载（默认 true）
  hasPagination: true,

  // 异步请求配置
  requester: {
    api: fetchList,
    params: { page: 1, size: 10 },  // 注意: 移动端用对象，不是数组
    path: 'list',                    // 数据路径
    pageField: 'page',              // 页码字段名
    pageSizeField: 'size',          // 条数字段名
    totalField: 'total',            // 总数字段名
  },

  // 下拉刷新配置
  refreshConf: {
    pullingText: '下拉刷新...',
    loosingText: '释放刷新...',
    loadingText: '加载中...',
  },

  // van-cell 属性透传
  cellBind: {
    'is-link': true,
    clickable: true,
  },

  // 操作栏
  operation: [
    {
      text: '编辑',
      type: 'primary',
      click: (row) => { /* 处理点击 */ },
    },
    {
      text: '删除',
      type: 'danger',
      click: (row) => { /* 处理删除 */ },
    },
  ],

  // 自定义插槽
  slots: {
    title: {
      props: ['data'],
      render() {
        return <span class="order-title">订单: {this.data.orderNo}</span>
      },
    },
    label: {
      props: ['data'],
      render() {
        return <span class="order-amount">¥{this.data.amount}</span>
      },
    },
  },
}
```

### 数据加载流程

```
组件挂载
  ↓
initData() — 首次加载
  ↓
api(params) — 调用接口
  ↓
$thenBack 处理返回
  ↓
chainAccess(response, path) — 提取列表
  ↓
data.push(...newItems) — 追加数据（非替换）
  ↓
判断是否还有更多数据
  ├─ 有: finished = false（允许继续滚动加载）
  └─ 无: finished = true（显示"没有更多了"）

┌────────────────────────────┐
│        下拉刷新触发          │
│  ↓                         │
│  重置 page = 1             │
│  清空 data = []            │
│  重新调用 initData()        │
└────────────────────────────┘

┌────────────────────────────┐
│        滚动到底触发          │
│  ↓                         │
│  page++                     │
│  调用 loadMore()            │
│  追加数据到 data            │
└────────────────────────────┘
```

### 与桌面端 CommonTable 的差异

| 特性 | CommonTable（桌面） | CommonCardList（移动端） |
|------|---------------------|--------------------------|
| **布局** | `el-table` 表格 | `van-cell` 卡片列表 |
| **分页** | `el-pagination` 页码翻页 | `van-list` 无限滚动 |
| **参数格式** | 数组 `[page, size]` | 对象 `{ page, size }` |
| **数据模式** | 替换整页数据 | 追加到已有数据 |
| **刷新** | 调用 `search()` 方法 | 下拉触发 `van-pull-refresh` |
| **Loading** | `v-loading` 指令 | `van-list` 内置 loading |
| **自定义渲染** | `columnList[].render` | `slots.title` / `slots.label` |

### 暴露的方法

| 方法 | 说明 |
|------|------|
| `initData()` | 初始化/重新加载数据 |
| `onRefresh()` | 手动触发下拉刷新 |
| `onLoad()` | 手动触发加载更多 |

### 注意事项

1. **参数格式**：移动端使用对象格式 `{ page, size }`，不是桌面端的数组 `[page, size]`
2. **数据追加**：`van-list` 每次加载更多时是追加数据，不是替换。刷新时才会清空重新加载
3. **下拉刷新**：刷新配置通过 `refreshConf` 传入，不设置则使用 Vant 默认文案
4. **遮罩加载**：由于使用了 Vant 内置的 loading 状态，默认禁用了 `v-loading` 遮罩
