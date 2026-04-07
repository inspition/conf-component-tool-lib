# Vue 2 Element UI 包 使用指南

> `@conf-tool/vue2-element` — 基于 Element UI 的配置化组件集合

## 安装

```bash
pnpm add @conf-tool/vue2-element
```

**前置依赖**：
- Vue 2.x
- Element UI 2.x

## 组件列表

| 组件 | 说明 |
|------|-----|
| `CommonTable` | 配置化数据表格，支持分页、异步加载、多级表头、自定义渲染 |
| `CommonSelect` | 配置化下拉选择器，支持静态/远程数据源 |
| `CommonDescriptions` | 配置化描述列表，用于详情展示 |

## 引入方式

```js
// 按需引入组件
import { CommonTable, CommonSelect, CommonDescriptions } from '@conf-tool/vue2-element'

// 引入工具函数
import { apiReq, $confirmReq } from '@conf-tool/vue2-element'
```

## CommonTable 完全指南

### 基础用法

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
          { prop: 'age', label: '年龄', align: 'center' },
          { prop: 'department', label: '部门' },
        ],
      },
    }
  },
}
</script>
```

### 异步加载 + 分页

```vue
<template>
  <CommonTable ref="commonTable" :tableConf="tableConf">
    <!-- 操作栏插槽 -->
    <template #operaNav="{ row }">
      <el-button @click="handleEdit(row)">编辑</el-button>
    </template>
  </CommonTable>
</template>

<script>
import { CommonTable } from '@conf-tool/vue2-element'
import { getUserList } from '@/api/user'

export default {
  components: { CommonTable },
  data() {
    return {
      tableConf: {
        data: [],
        columnList: [
          { prop: 'name', label: '姓名' },
          { prop: 'status', label: '状态', formatter: (row, col, val) => val === 1 ? '启用' : '禁用' },
        ],
        // 异步数据配置
        requester: {
          api: getUserList,       // 接口函数
          params: [1, 10],        // 页码, 条数
          path: 'list',           // 数据列表路径（在 $thenBack 取出 data 后的相对路径）
        },
        // 分页配置
        pagintion: {
          pageSize: 10,           // 每页条数（默认10）
          pageSizes: [10, 20, 50],
        },
        // 选择列
        selection: false,
        // el-table 属性透传
        bind: {
          border: true,
          stripe: true,
        },
        // el-table 事件透传
        on: {
          'selection-change': (val) => { /* 多选回调 */ },
        },
      },
    }
  },
  methods: {
    handleEdit(row) { /* ... */ },
    // 外部触发搜索
    doSearch() {
      this.$refs.commonTable.search(1, 20)
    },
  },
}
</script>
```

### 多级树形表头

通过 `columnList` 的嵌套实现多级表头，由 `cm-table-dynamic-column` 组件递归渲染：

```js
columnList: [
  { prop: 'name', label: '姓名' },
  {
    label: '基本信息',       // 父级列
    columnList: [             // 子列
      { prop: 'age', label: '年龄' },
      { prop: 'gender', label: '性别' },
      {
        label: '地址信息',    // 可继续嵌套
        columnList: [
          { prop: 'province', label: '省' },
          { prop: 'city', label: '市' },
        ],
      },
    ],
  },
]
```

### 自定义渲染 (render)

```js
columnList: [
  {
    prop: 'status',
    label: '状态',
    render: {
      props: ['data', 'row', 'scope', 'conf'],
      render() {
        // data = row[conf.prop] = 每个单值
        // row  = 每行完整数据
        return (
          <el-tag type={this.data === 1 ? 'success' : 'danger'}>
            {this.data === 1 ? '启用' : '禁用'}
          </el-tag>
        )
      },
    },
  },
  {
    prop: 'avatar',
    label: '头像',
    render: {
      props: ['data'],
      render() {
        return <el-image src={this.data} style="width: 40px; height: 40px" />
      },
    },
  },
]
```

### 自定义表头 (headerRender)

```js
{
  prop: 'score',
  label: '评分',
  headerRender: {
    props: ['conf'],
    render() {
      return (
        <span>
          {this.conf.label}
          <el-tooltip content="满分100分">
            <i class="el-icon-question" />
          </el-tooltip>
        </span>
      )
    },
  },
}
```

### 暴露的方法

| 方法 | 参数 | 说明 |
|-----|------|-----|
| `search(page, size)` | 页码, 条数 | 触发搜索（重新调 API） |
| `initData()` | 无 | 初始化数据（组件挂载时自动调用） |
| `restTableLayout()` | 无 | 重新计算表格布局 |

```js
// 通过 ref 调用
this.$refs.commonTable.search(1, 20)
```

### 插槽

| 插槽名 | 作用域 | 说明 |
|--------|--------|-----|
| `headTitle` | 无 | 头部标题区域 |
| `operaNav` | `{ row }` | 操作栏（当前选中行数据） |

---

## CommonSelect 完全指南

### 基础用法（静态数据）

```vue
<CommonSelect
  v-model="selectedId"
  :data="staticList"
  :options="{
    key: 'label',
    value: 'id',
  }"
/>
```

### 远程数据

```vue
<CommonSelect
  v-model="selectedCity"
  :options="{
    api: getCityList,
    key: 'cityName',
    value: 'cityId',
    path: 'list',
    params: { province: '广东省' },
  }"
/>
```

### 远程搜索

```vue
<CommonSelect
  v-model="selectedUser"
  :options="{
    api: searchUser,
    key: 'name',
    value: 'id',
    path: 'list',
  }"
  :bind="{
    filterable: true,
    remote: true,
    'remote-method': (query) => { /* 搜索参数加工 */ },
  }"
/>
```

### 配置项

| 参数 | 类型 | 说明 |
|------|------|------|
| `options.api` | `Function` | 数据请求接口 |
| `options.key` | `String` | 显示文本的字段名 |
| `options.value` | `String` | 选中值的字段名 |
| `options.path` | `String` | 数据路径 |
| `options.params` | `Object` | 远程搜索参数加工函数 |
| `options.change` | `Function` | 自定义值更新回调 |
| `bind` | `Object` | el-select API 覆盖（透传） |

---

## CommonDescriptions 完全指南

### 基础用法

```vue
<template>
  <CommonDescriptions :tableConf="descConf" />
</template>

<script>
import { CommonDescriptions } from '@conf-tool/vue2-element'
import { getOrderDetail } from '@/api/order'

export default {
  components: { CommonDescriptions },
  data() {
    return {
      descConf: {
        data: {},
        requester: {
          api: getOrderDetail,
          params: [this.$route.params.id],
          path: 'detail',
        },
        trList: [
          {
            tdList: [
              { label: '订单编号', prop: 'orderNo', span: 1 },
              { label: '创建时间', prop: 'createTime', span: 1 },
            ],
          },
          {
            tdList: [
              { label: '客户名称', prop: 'customerName', span: 1 },
              {
                label: '订单状态',
                prop: 'status',
                span: 1,
                render: {
                  props: ['data'],
                  render() {
                    const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
                    return <el-tag>{map[this.data]}</el-tag>
                  },
                },
              },
            ],
          },
          {
            tdList: [
              { label: '备注', prop: 'remark', span: 2, richText: true },
            ],
          },
        ],
      },
    }
  },
}
</script>
```

### TrList / TdList 结构

```
tableConf
├── trList               # 行列表
│   └── tr
│       └── tdList       # 该行的单元格列表
│           └── td
│               ├── label    # 标签文本
│               ├── prop     # 字段名
│               ├── span     # 占列数
│               ├── render   # 自定义渲染
│               └── richText # 是否 v-html 渲染
```

---

## 工具函数

### apiReq

封装 API 请求，自动处理 loading 和错误通知：

```js
import { apiReq } from '@conf-tool/vue2-element'

// 基础用法
const result = await apiReq(updateUser, [userId, formData])

// 自定义调用
apiReq(deleteUser, [userId]).then(data => {
  this.$message.success('删除成功')
  this.refresh()
})
```

### $confirmReq

带确认弹窗的 API 请求：

```js
import { $confirmReq } from '@conf-tool/vue2-element'

// 删除前确认
$confirmReq('确定删除该记录?', deleteUser, [recordId], () => {
  this.$message.success('删除成功')
  this.refresh()
})
```

更多工具函数参见 [Shared 工具库 API](../api/shared/tools.md)。
