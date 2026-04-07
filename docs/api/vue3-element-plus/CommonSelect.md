# CommonSelect API（Vue 3 Element Plus）

> 配置化下拉选择器的 Vue 3 版本，使用 TSX 编写，支持 `v-model:modelValue` 双向绑定。

## 引入方式

```ts
import { CommonSelect } from '@conf-tool/vue3-element-plus'
```

---

## Props

| 属性名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `modelValue` / `v-model` | `String` | 否 | — | 当前选中值 |
| `options` | `CmOptions` | 否 | `{}` | 配置选项 |
| `data` | `Array` | 否 | `[]` | 直接传入的数据数组 |
| `bind` | `SelectProp` | 否 | — | 额外绑定的属性（Element Plus ElSelect Props） |

### CmOptions 接口

```ts
interface CmOptions {
  key?: string      // 选项展示文本对应的属性名（默认 'label'）
  value?: string    // 选项值对应的属性名（默认 'value'）
  path?: string     // 数据路径，用于从接口返回中提取列表数据
  api?: (...args: any[]) => Promise<any>  // 异步获取数据的方法
}
```

---

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `value` | 值变化时触发 |

---

## 与 Vue 2 版本的差异

| 差异点 | Vue 2 Element | Vue 3 Element Plus |
|--------|---------------|-------------------|
| **v-model** | `v-model="value"` (model选项) | `v-model="value"` (modelValue) |
| **远程搜索** | 内置 `remoteMethod` | 未内置（通过 bind 配置） |
| **自定义变更** | `customChange(e, list)` | 暂不支持 |
| **API 风格** | Options API | TSX defineComponent |
| **默认属性** | `filterable clearable remote multiple` | `filterable clearable` |

---

## 使用示例

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { CommonSelect } from '@conf-tool/vue3-element-plus'

const selected = ref('')
const dataList = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
]
</script>

<template>
  <CommonSelect v-model="selected" :data="dataList" />
</template>
```

### 异步数据

```vue
<CommonSelect
  v-model="selected"
  :options="{
    api: fetchDeptList,
    key: 'deptName',
    value: 'deptId',
    path: 'list',
  }"
/>
```
