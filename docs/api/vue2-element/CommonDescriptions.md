# CommonDescriptions API（Vue 2 Element UI）

> 配置化详情描述列表组件，用于展示单条记录的键值对信息，支持自定义渲染和富文本。

## 引入方式

```js
import { CommonDescriptions } from '@conf-tool/vue2-element'
```

---

## Props

| 属性名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `headTitle` | `String \| Array` | 否 | — | 头部标题 |
| `tableConf` | `Object` | 是 | `{}` | 描述列表配置对象（核心配置），详见下方 |

### tableConf 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `headTitle` | `String` | 标题文本（如 `'客户基本信息'`） |
| `icon` | `String` | 标题图标 URL |
| `data` | `Object` | 数据对象，键值对形式 |
| `requester` | `Object` | 异步数据请求配置（同 CommonTable） |
| `trList` | `Array<TrDef>` | 行配置数组 |

### TrDef 行配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `attrs` | `Object` | 绑定到 `<tr>` 的属性 |
| `tdList` | `Array<TdDef>` | 单元格配置数组 |

### TdDef 单元格配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `label` | `String` | 标签名 |
| `prop` | `String` | 数据字段名（从 `tableConf.data[prop]` 取值） |
| `attrs_label` | `Object` | 标签列 `<th>` 的绑定属性 |
| `attrs_info` | `Object` | 内容列 `<td>` 的绑定属性 |
| `render` | `Object` | 自定义渲染组件（同 CommonTable render 模式） |
| `v_html` | `Boolean` | 是否启用富文本渲染（`v-html`） |
| `formatter` | `Function` | 格式化函数：`(fieldValue) => displayValue` |
| `text` | `String` | 固定显示文本 |

#### render 对象传入的 Props

| Prop | 说明 |
|------|------|
| `data` | 当前字段值（`tableConf.data[prop]`） |
| `dataParent` | 整条数据对象（`tableConf.data`） |
| `conf` | 当前单元格配置对象 |

### requester 数据请求配置

与 CommonTable 的 `requester` 结构相同：

```js
requester: {
  api: fetchUserDetail,
  params: [userId],
  path: 'data',
  getter: (data) => data,
}
```

---

## Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `initData()` | — | 通过 requester 加载数据 |
| `decodeData(res)` | API 响应 | 解析数据（path 提取 + getter 转换） |
| `calcText(td)` | 单元格配置 | 计算单元格内容（formatter → 字段值 → 默认 `'--'`） |
| `getPropVal(td)` | 单元格配置 | 获取字段值 |

---

## 使用示例

### 基础用法

```vue
<CommonDescriptions :tableConf="descConf" />

<script>
export default {
  data() {
    return {
      descConf: {
        data: {
          name: '张三',
          code: 'P0001',
          status: '正常',
          level: 'A级',
        },
        trList: [
          {
            tdList: [
              { label: '客户名称', prop: 'name' },
              { label: '客户编号', prop: 'code' },
            ],
          },
          {
            tdList: [
              { label: '状态', prop: 'status' },
              { label: '信用评级', prop: 'level' },
            ],
          },
        ],
      },
    }
  },
}
</script>
```

### 自定义渲染 + 富文本

```js
trList: [
  {
    tdList: [
      {
        label: '状态',
        prop: 'status',
        render: {
          props: ['data'],
          render() {
            const color = this.data === '正常' ? 'green' : 'red'
            return <el-tag type={color}>{this.data}</el-tag>
          },
        },
      },
      {
        label: '备注',
        prop: 'remark',
        v_html: true,  // 启用富文本渲染
      },
    ],
  },
]
```

### 异步数据加载

```vue
<CommonDescriptions :tableConf="descConf" />

<script>
export default {
  data() {
    return {
      descConf: {
        requester: {
          api: fetchCustomerDetail,
          params: [this.$route.params.id],
          path: 'data',
        },
        trList: [
          { tdList: [{ label: '名称', prop: 'name' }, { label: '编号', prop: 'code' }] },
        ],
      },
    }
  },
}
</script>
```
