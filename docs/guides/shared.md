# Shared 工具库 使用指南

> `@conf-tool/shared` — 跨框架共享的工具函数集合

## 安装

```bash
pnpm add @conf-tool/shared
```

> 注意：`@conf-tool/vue2-element`、`@conf-tool/vue3-element-plus`、`@conf-tool/vue2-vant` 已自动依赖此包，通常不需要单独安装。

## 引入方式

```js
// 直接引入
import { chainAccess, getValue, itemFiledsMap, deepCopy } from '@conf-tool/shared'

// 各包的 tools.ts 已重新导出常用函数
import { apiReq, $confirmReq } from '@conf-tool/vue2-element'
```

---

## 核心工具函数

### chainAccess — 链式路径访问

从嵌套对象中通过字符串路径提取值。这是整个框架的**数据提取引擎**。

```js
import { chainAccess } from '@conf-tool/shared'

const response = {
  data: {
    userInfo: {
      list: [{ name: '张三' }, { name: '李四' }],
      total: 100,
    },
  },
}

// 基础用法
chainAccess(response, 'data.userInfo.list')
// → [{ name: '张三' }, { name: '李四' }]

chainAccess(response, 'data.userInfo.total')
// → 100

// 路径不存在时返回 undefined
chainAccess(response, 'data.nonExist.path')
// → undefined
```

**在组件中的用途**：
- `requester.path` 配置使用 `chainAccess` 从 API 返回值中提取列表数据
- `ColumnDef.prop` 使用 `chainAccess` 提取单元格值（支持嵌套路径如 `'address.city'`）

### getValue — 安全取值

```js
import { getValue } from '@conf-tool/shared'

getValue({ a: { b: 1 } }, 'a.b')  // → 1
getValue({ a: { b: 1 } }, 'a.c')  // → undefined
```

### itemFiledsMap — 字段映射转换

批量重命名对象字段，支持嵌套路径访问：

```js
import { itemFiledsMap } from '@conf-tool/shared'

const source = {
  user_name: '张三',
  user_age: 28,
  dept: { name: '技术部' },
}

const result = itemFiledsMap(source, {
  name: 'user_name',        // name ← user_name
  age: 'user_age',          // age ← user_age
  deptName: 'dept.name',    // deptName ← dept.name（嵌套路径）
})
// → { name: '张三', age: 28, deptName: '技术部' }
```

**典型场景**：后端字段名与前端展示不一致时的批量映射。

### joinDebounce — 防抖合并

```js
import { joinDebounce } from '@conf-tool/shared'

const debouncedSearch = joinDebounce((keyword) => {
  fetchResults(keyword)
}, 300)

// 300ms 内多次调用只执行最后一次
inputElement.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

### genrateParallels — 并行请求

```js
import { genrateParallels } from '@conf-tool/shared'

const [users, depts, roles] = await genrateParallels([
  fetchUsers(),
  fetchDepts(),
  fetchRoles(),
])
```

### deepCopy — 深拷贝

```js
import { deepCopy } from '@conf-tool/shared'

const original = { a: { b: [1, 2, 3] } }
const copy = deepCopy(original)
copy.a.b.push(4)
// original.a.b 仍为 [1, 2, 3]
```

### findValuePath — 路径查找

在嵌套对象中查找指定值的路径：

```js
import { findValuePath } from '@conf-tool/shared'

const tree = {
  a: { b: { c: 'target' } },
  d: 'other',
}

findValuePath(tree, 'target')
// → 'a.b.c'
```

---

## API 请求工具

> 以下函数在各包的 `tools.ts` 中有 UI 框架特定的实现（使用对应框架的 Message 组件显示提示）。

### $thenBack — 响应处理

统一处理 API 响应，检查 `code === 0` 或约定的成功标志：

```js
import { $thenBack } from '@conf-tool/shared'

const data = await api.fetchList().then($thenBack)
// 成功: 返回 response.data
// 失败: 自动显示错误提示
```

### apiReq — 标准 API 请求

封装 API 调用，自动处理 loading 和错误：

```js
import { apiReq } from '@conf-tool/vue2-element'  // 从对应包引入

const result = await apiReq(updateUser, [userId, formData])
// 自动处理: $thenBack → 成功提示 | 错误提示
```

### $confirmReq — 确认式请求

弹出确认框，确认后执行 API 请求：

```js
import { $confirmReq } from '@conf-tool/vue2-element'

$confirmReq(
  '确定删除该用户?',     // 确认文本
  deleteUser,            // API 函数
  [userId],              // 参数
  () => {                // 成功回调
    this.$message.success('已删除')
    this.refresh()
  }
)
```

### $downloadFile — 文件下载

```js
import { $downloadFile } from '@conf-tool/shared'

$downloadFile(fileBlob, 'report.xlsx')
```

### checkFileCatch — 文件 Blob 检查

检查返回的 Blob 是否为有效文件（排除 JSON 错误响应）：

```js
import { checkFileCatch } from '@conf-tool/shared'

const blob = await api.exportExcel()
const isValid = await checkFileCatch(blob)
if (isValid) {
  $downloadFile(blob, 'data.xlsx')
}
```

### ConcurrencyManager — 并发控制器

管理并发请求数量：

```js
import { ConcurrencyManager } from '@conf-tool/shared'

const manager = new ConcurrencyManager(3)  // 最大并发数 3

// 所有请求通过 manager 发起，超过并发数的请求自动排队
await manager.add(() => fetch('/api/1'))
await manager.add(() => fetch('/api/2'))
```

---

## 完整 API 参考

详见 [Shared 工具库 API 文档](../api/shared/tools.md)。
