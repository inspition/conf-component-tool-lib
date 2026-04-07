# CommonSelect API（Vue 2 Element UI）

> 配置化下拉选择器，支持本地数据、异步数据获取和远程搜索。

## 引入方式

```js
import { CommonSelect } from '@conf-component-tool-lib/vue2-element'
```

---

## Props

| 属性名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `value` / `v-model` | `Array` | 否 | `[]` | 当前选中值，支持 `v-model` 双向绑定 |
| `options` | `Object` | 否 | 见下方 | 配置项 |
| `data` | `Array` | 否 | `[]` | 直接传入的数据数组 |
| `bind` | `Object` | 否 | 见下方 | el-select API 覆盖 |

### options 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `String` | `'label'` | 选项展示文本对应的属性名 |
| `value` | `String` | `'value'` | 选项值对应的属性名 |
| `path` | `String` | `''` | 数据路径，用于从接口返回中提取列表数据 |
| `api` | `Function` | — | 异步获取数据的方法 |
| `searchParams` | `Function` | `(query) => query` | 远程搜索参数加工函数 |
| `customChange` | `Function` | `(e, list) => e` | 自定义值更新回调 |

### bind 默认值

```js
{
  style: { width: '100%' },
  filterable: true,
  clearable: true,
  remote: true,
  multiple: true,
  'multiple-limit': 3,
}
```

---

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `change` | `value` | 值变化时触发，经 `customChange` 处理后的值 |

---

## Computed

| 名称 | 说明 |
|------|------|
| `dynamicOptions` | 合并传入的 options 与默认配置 |

---

## Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `init(...params)` | 请求参数 | 异步初始化数据：调用 API 获取列表 |
| `remoteMethod(query)` | 搜索关键词 | 远程搜索：清空列表后重新请求 |

---

## 使用示例

### 本地数据

```vue
<CommonSelect v-model="selected" :data="options" />

<script>
export default {
  data() {
    return {
      selected: [],
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' },
      ],
    }
  },
}
</script>
```

### 异步数据

```vue
<CommonSelect
  v-model="selected"
  :options="{
    api: fetchDeptList,
    key: 'deptName',
    value: 'deptId',
    path: 'data.list',
  }"
/>
```

### 远程搜索

```vue
<CommonSelect
  v-model="selected"
  :options="{
    api: searchUsers,
    key: 'userName',
    value: 'userId',
    searchParams: (query) => ({ keyword: query }),
  }"
  :bind="{ remote: true, filterable: true, clearable: true }"
/>
```

### 自定义值转换

```vue
<CommonSelect
  v-model="selected"
  :options="{
    api: fetchList,
    customChange: (value, list) => {
      // 把选中的值转为完整对象
      return list.find(item => item.id === value)
    },
  }"
/>
```
