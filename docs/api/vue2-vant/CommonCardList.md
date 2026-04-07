# CommonCardList API（Vue 2 Vant）

> 配置化卡片列表组件，基于 Vant 的 `van-list` + `van-cell`，专为移动端设计，支持下拉刷新和虚拟滚动分页。

## 引入方式

```js
import { CommonCardList } from '@conf-component-tool-lib/vue2-vant'
```

---

## Props

| 属性名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `listConf` | `Object` | 是 | 见下方 | 列表总配置（核心协议） |
| `overlayLoadDisabled` | `Boolean` | 否 | `false` | 遮罩加载禁用 |

### listConf 配置详解

| 属性 | 类型 | 说明 |
|------|------|------|
| `data` | `Array` | 列表数据源 |
| `modeLoading` | `Boolean` | van-list 加载状态 |
| `hasPagination` | `Boolean` | 是否开启分页 |
| `requester` | `Object` | 请求与分页相关参数（见下方） |
| `refreshConf` | `Object` | 下拉刷新配置 |
| `rows` | `Array<RowDef>` | 行内容渲染配置 |
| `cellBind` | `Object` | 透传给 van-cell 的属性 |
| `operation` | `Object` | 操作栏渲染配置 |
| `bind` | `Object` | 透传给 van-list 的属性 |
| `listeners` | `Object` | 透传给 van-list 的事件 |
| `slots` | `Array` | 自定义具名插槽配置 |
| `key` | `String` | 列表项的唯一键字段名 |
| `cellClick` | `Function` | 单元格点击回调 |

### requester 数据请求配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `params` | `Object` | `{ page: 1, size: 10 }` | 请求参数对象 |
| `pageIndexProp` | `String` | `'page'` | 参数中页码字段名 |
| `pageSizeProp` | `String` | `'size'` | 参数中每页个数字段名 |
| `path` | `String` | `''` | list 数据路径 |
| `paramGetter` | `Function` | `params => params` | 请求参数加工函数 |
| `pageInfoPath` | `String` | `''` | 分页信息路径 |
| `pageInfoTotalProp` | `String` | `'total'` | 总条数字段名 |
| `pageInfo` | `Object` | `null` | 分页信息缓存 |
| `handleFinally` | `Function` | — | 接口完成回调 |
| `incrementPageNo` | `Function` | — | 分页递进回调 |
| `api` | `Function` | — | 请求 API 函数 |

### refreshConf 下拉刷新配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `isLoading` | `Boolean` | 刷新加载状态 |
| `onRefresh` | `Function` | 刷新前的业务方回调 |

### RowDef 行配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `String` | `'info'` 为标准行（label + value） |
| `label` | `String` | 行标签文本 |
| `prop` | `String` | 数据字段名 |
| `render` | `Object` | 自定义渲染组件（JSX） |
| `bind` | `Object` | van-row 绑定属性 |
| `labelBind` | `Object` | 标签列 van-col 属性 |
| `valueBind` | `Object` | 值列 van-col 属性 |

### operation 操作栏配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `bind` | `Object` | 传给操作栏组件的属性 |
| `render` | `Object` | 操作栏渲染组件 |

### slots 插槽配置

```js
slots: [
  { name: 'title', render: TitleComponent, bind: {} },
]
```

---

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `loading` | `Boolean` | 加载状态变化（用于局部阻断导航栏操作） |

---

## Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `init()` | — | 初始化入口：分页模式下触发首轮加载 |
| `initData()` | — | 重置状态并拉取第一页数据 |
| `reqList()` | — | 请求列表数据并合并到 data |
| `search()` | — | 分页请求：loading → reqList → 结束态处理 |
| `onRefresh()` | — | 下拉刷新：清空数据后重新加载 |
| `handleFinished(result)` | 请求结果 | 处理分页结束状态 |
| `getTotal(pageInfo)` | 分页信息 | 获取总条数 |
| `handleIncrement(options)` | 分页选项 | 页码叠加回调 |

---

## 数据加载流程

```
1. init() → hasPagination ? initData() : 等待 van-list @load
2. initData():
   ├── 重置状态（finished=false, data=[]）
   ├── reqList() → api(params) → chainAccess(res, path)
   └── 设置 finished=true
3. van-list @load → search():
   ├── reqList() → 数据追加到 data
   ├── handleFinished() → 检查 data.length >= total
   └── handleIncrement() → 页码+1（或自定义回调）
4. 下拉刷新 → onRefresh():
   ├── 清空 data
   ├── 重置页码
   └── hasPagination ? search() : initData()
```

---

## 使用示例

### 基础卡片列表

```vue
<CommonCardList :listConf="listConf" />

<script>
import { fetchOrderList } from '@/api/order'

export default {
  data() {
    return {
      listConf: {
        hasPagination: true,
        data: [],
        key: 'orderId',
        requester: {
          api: fetchOrderList,
          params: { page: 1, size: 10 },
          path: 'data.list',
          pageInfoPath: 'data',
          pageInfoTotalProp: 'total',
        },
        refreshConf: {
          isLoading: false,
        },
        rows: [
          { type: 'info', label: '订单号', prop: 'orderNo' },
          { type: 'info', label: '金额', prop: 'amount' },
          { type: 'info', label: '状态', prop: 'status' },
        ],
        bind: { finished: false },
      },
    }
  },
}
</script>
```

### 自定义行渲染 + 操作栏

```js
listConf: {
  // ...
  rows: [
    { type: 'info', label: '名称', prop: 'name' },
    {
      render: {
        props: ['data'],
        render() {
          return <van-tag type="primary">{this.data.status}</van-tag>
        },
      },
    },
  ],
  operation: {
    render: {
      props: ['data'],
      render() {
        return <van-button size="small" type="primary"
          onClick={() => this.$router.push(`/detail/${this.data.id}`)}>
          查看详情
        </van-button>
      },
    },
  },
}
```
