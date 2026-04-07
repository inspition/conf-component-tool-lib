# Shared 工具库 API

> 跨框架共享的工具函数库，提供数据访问、防抖、文件下载等通用能力。

## 引入方式

```ts
import { getValue, chainAccess, joinDebounce, ... } from '@conf-tool/shared'
```

---

## 核心函数

### getValue(fn, defaultValue?)

安全取值函数，在 `fn()` 执行出错或返回 `null`/`undefined` 时返回默认值。

```ts
function getValue(fn: () => any, defaultValue?: any): any
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `fn` | `Function` | 返回取值对象的函数 |
| `defaultValue` | `any` | 可选默认返回值 |

```js
// 安全访问深层属性
getValue(() => response.data.user.name, '未知')

// 安全赋值
getValue(() => (config.requester.params[0] = 2))
```

---

### chainAccess(result, path)

链式访问器，支持通过字符串路径访问嵌套对象。

```ts
function chainAccess(result: AnyObject, path: string): any
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `result` | `Object` | 访问对象 |
| `path` | `String` | 访问链地址，如 `'data.pageInfo.list.0'` |

```js
const data = { user: { profile: { name: '张三' } } }

chainAccess(data, 'user.profile.name')   // '张三'
chainAccess(data, 'user.profile.age')    // undefined
chainAccess(data, 'user.contacts.0')     // 支持数组索引
```

> **⚠️ 常见错误**：路径字符串中不要包含多余的空格，如 `'data. list'` 是错误的。

---

### joinDebounce()

防抖函数工厂，返回一个防抖加工后的函数。

```ts
function joinDebounce(): (func: () => any, ms?: number) => void
```

```js
const debounce = joinDebounce()

// 在输入框 change 事件中使用
debounce(() => {
  fetchSearchResults(keyword)
}, 300)
```

---

### genrateParallels(apis)

生成并行异步请求列表，用于 `Promise.all`。

```ts
function genrateParallels(apis: any[]): Promise<any>[]
```

```js
const results = await Promise.all(
  genrateParallels([fetchUsers(), fetchDepts(), fetchRoles()])
)
```

---

## API 请求工具

### $thenBack(res)

API 成功回调处理，检查 `code !== 0` 则抛出异常。

```ts
function $thenBack(res: AnyObject): any
```

### apiReq(api)

接口请求封装，自动处理 then/catch 回调链。

```ts
function apiReq<T>(api: T): (...args: Parameters<T>) => ReturnType<T>
```

```js
// 封装前
const res = await fetchUsers(1, 10).then($thenBack).catch($catchBack())

// 封装后（等价）
const res = await apiReq(fetchUsers)(1, 10)
```

> **注意**：各包（vue2-element、vue3-element-plus、vue2-vant）各自实现了 `$catchBack`，
> 分别使用 Element UI `Message`、Element Plus `ElMessage`、Vant `Toast` 显示错误。

---

## 文件工具

### $downloadFile(res, fileNameKey?)

文件下载，从响应的 Blob 数据和 headers 中提取文件名并触发浏览器下载。

```ts
function $downloadFile(res: AnyObject, fileNameKey?: string): void
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `res` | `Object` | — | 接口回调（包含 `data` 和 `headers`） |
| `fileNameKey` | `String` | `'filename='` | 下载文件键名 |

### checkFileCatch(fileBlob?)

文件异常检测，解析 Blob 内容判断是否包含错误信息。

```ts
function checkFileCatch(fileBlob?: Blob): Promise<boolean>
```

---

## 数据转换工具

### itemFiledsMap(fieldsMap)

字段映射函数工厂，将嵌套数据扁平化为指定结构。

```ts
function itemFiledsMap(fieldsMap: AnyObject): (item: any) => any
```

```js
const fieldsMap = {
  name: 'user.name',
  age: 'user.age',
  address: 'user.contact.address',
}

const mapFields = itemFiledsMap(fieldsMap)
const result = mapFields({
  user: {
    name: 'John',
    age: 30,
    contact: { address: '123 Main St' },
  },
})
// result: { name: 'John', age: 30, address: '123 Main St' }
```

---

## 其他工具

### $confirmReq(tip, thenBack)

请求提交定制确认弹窗。

```ts
function $confirmReq(tip?: string, thenBack?: Function): Promise<void>
```

> 各包使用对应UI框架的弹窗：Element UI `MessageBox`、Element Plus `ElMessageBox`。

### ConcurrencyManager

并发管理器，控制最大并发数。

```ts
class ConcurrencyManager {
  constructor(max?: number)      // 最大并发数，默认 5
  dequeue(task: Task): Promise   // 入队任务
}
```

```js
const manager = new ConcurrencyManager(3)

urls.forEach(url => {
  manager.dequeue(() => fetch(url))
})
```

### findValuePath(obj, target)

查找对象中特定值的路径。

```ts
function findValuePath(obj: any, target: any, path?: string[]): string[] | null
```

### deepCopy(data)

深拷贝函数。

```ts
function deepCopy(data: any): any
```

---

## 类型定义

```ts
interface AnyObject {
  [key: string]: any
}

interface AxiosInstance {
  <T = any>(...value: T[]): Promise<T>
}

type Task = () => Promise<any>

interface TaskItem {
  task: Task
  resolve: (value?: any) => void
  reject: (value?: any) => void
}
```
