import { MessageBox, Message } from 'element-ui'

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

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * [链式取值]
 *
 * @param   {Function}   fn            [于函数中返回的取值对象]
 * @param   {any}  defaultValue  [可选默认返回值]
 *
 * @return  {[type]}                   [return description]
 */
export function getValue(fn: () => any, defaultValue?: any) {
  try {
    const result = fn()
    const nullish = [null, undefined]

    if (!result && nullish.includes(result))
      throw new Error(`get fn() error: ${result}`)

    return result
  } catch (error) {
    // console.warn('get value error:', error)
    return defaultValue
  }
}

/**
 * 链式访问器
 * @param {Any} result  [访问对象]
 * @param {String} path [访问链地址，例：'data.pageInfo.list.0']
 * @return {Any}
 */
export function chainAccess(result: AnyObject, path: string) {
  const aPath = path.split('.')
  let newRes = result?.[aPath?.shift?.() || '']

  if (aPath.length && newRes) newRes = chainAccess(newRes, aPath.join('.'))

  return newRes
}

/**
 * 防抖
 *
 * @return  {[Function]}     [return 防抖加工后的新方法]
 */
export function joinDebounce() {
  let timer: NodeJS.Timeout

  return (func: () => any, ms = 500) => {
    clearTimeout(timer)
    timer = setTimeout(func, ms)
  }
}

/**
 * 生成并行异步请求列表
 *
 * @param   {[Promise]}  apis  [Promise.all([...])]
 *
 * @return  {[Promise]}        [return description]
 */
export function genrateParallels(apis: any[]) {
  const parallels = apis.map(api => (async () => await api)())

  return parallels
}

/**
 * API then回调处理
 * @param {Object} res  [resolve参数]
 */
export function $thenBack(res: AnyObject) {
  const data = res?.data
  // const isError = !data;
  const isError = data?.code !== 0

  if (isError) throw data

  return data
}

/**
 * API catch回调处理
 * @param {String} errPrefix  [自定义错误前缀]
 */
export function $catchBack(errPrefix = '') {
  return function (err: AnyObject) {
    const [backData, errorMsg] = [
      { ...err },
      errPrefix + (err?.errorMsg || err?.msg || err?.message || ''),
    ]

    Message.error(errorMsg)

    return backData
  }
}

/**
 * 接口请求封装
 *
 * @param {T} api [接口]
 * @returns {args<T><ReturnType><T> | undefined} return description
 */
export function apiReq<T extends (...args: any[]) => any>(
  api: T
): (...args: Parameters<T>) => ReturnType<T> {
  return (...params: any[]) =>
    api(...(params ?? []))
      .then($thenBack)
      .catch($catchBack())
}

/**
 * 文件下载
 *
 * @param   {[AnyObject]}  res  接口回调
 * @param   {string}     fileNameKey  下载文件键名
 */
export function $downloadFile(res: AnyObject, fileNameKey?: string) {
  const { data, headers } = res || {}
  const isError = !data
  const key = fileNameKey ?? 'filename='

  if (isError) throw res

  const { 'content-disposition': contDesc, 'content-type': contType } =
    headers || {}

  const type = contType
    ?.split(';')
    .find((v: AnyObject) => v.includes('application'))
  const fileName = contDesc
    ?.split(';')
    .find((v: AnyObject) => v.includes(key))
    ?.replace(key, '')

  const decodeName = fileName ? decodeURIComponent(fileName) : '附件'

  const [blob, eLink] = [
    new Blob([data], { type }),
    document.createElement('a'),
  ]

  eLink.download = decodeName
  eLink.style.display = 'none'
  eLink.href = URL.createObjectURL(blob)
  document.body.appendChild(eLink)
  eLink.click()
  URL.revokeObjectURL(eLink.href)
  document.body.removeChild(eLink)
}

/**
 * item字段映射
 *
 * @param   {[Object]}  fieldsMap  [传入字段映射表，返回返]
 *
 * @example
 * ```typescript
 * const fieldsMap = {
 *   name: 'user.name',
 *   age: 'user.age',
 *   address: 'user.contact.address'
 * };
 *
 * const item = {
 *   user: {
 *     name: 'John Doe',
 *     age: 30,
 *     contact: {
 *       address: '123 Main St'
 *     }
 *   }
 * };
 *
 * const mapFields = itemFiledsMap(fieldsMap);
 * const formattedItem = mapFields(item);
 *
 * console.log(formattedItem);
 * // Output:
 * // {
 * //   name: 'John Doe',
 * //   age: 30,
 * //   address: '123 Main St'
 * // }
 * ```
 *
 * @return  {[Function]}             [return 映射转换]
 */
export function itemFiledsMap(fieldsMap: AnyObject) {
  return function (item = {}) {
    const formatItem = {}

    Object.entries(fieldsMap).forEach(([key, path]) => {
      Object.defineProperty(formatItem, key, {
        value: chainAccess(item, path),
        writable: true,
        enumerable: true,
        configurable: true,
      })
      // formatItem[key] = chainAccess(item, path);
    })

    return formatItem
  }
}

/**
 * 请求提交定制确认
 * @param {String} tip  [确认提示语]
 * @param {Function} thenBack  [确认后执行回调]
 */
export async function $confirmReq(tip = '', thenBack = (res?: any) => null) {
  await MessageBox.confirm(tip, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then((res?: any) => {
    setTimeout(() => thenBack(res), 300) // 避免遮罩层关闭时与下一个弹窗开启冲突
  })
}

/**
 * 文件异常检测
 *
 * @param   {[type]}  fileBlob  [fileBlob description]
 *
 * @return  {[Boolean]}        是否异常
 */
export async function checkFileCatch(fileBlob = new Blob()) {
  // const { $catchBack } = this;
  const text = await fileBlob?.text?.()
  let isError = false

  try {
    const fileInfo = JSON.parse(text ?? null) ?? {}
    isError = fileInfo.code !== 0
    $catchBack()(fileInfo)
  } catch (err) {
    console.log('JSON 无法解析', err)
  }

  return isError
}

/**
 * 并发管理
 */
export class ConcurrencyManager {
  #actives: number = 0
  #maxConcurrent: number = 0
  #queue: Array<TaskItem> = []

  constructor(max = 5) {
    this.#maxConcurrent = max
  }

  dequeue(task: Task) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ task, resolve, reject })

      this.#enqueue()
    })
  }

  #enqueue() {
    if (this.#actives < this.#maxConcurrent && this.#queue.length > 0) {
      const { task, resolve, reject } = this.#queue.shift() as TaskItem

      this.#actives++

      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.#actives--
          this.#enqueue()
        })
    }
  }
}

/**
 * 查找对象中特定值的路径
 * @param {Object} obj - 要搜索的对象
 * @param {*} target - 要查找的值
 * @param {string} path - 当前路径（递归时使用）
 * @returns {Array} - 返回路径数组，找不到返回 null
 */
export function findValuePath(
  obj: any,
  target: any,
  path: string[] = []
): string[] | null {
  // 遍历对象的所有属性
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue

    const currentPath = [...path, key]

    // 如果当前值等于目标值，返回路径
    if (obj[key] === target) return currentPath

    // 如果当前值是对象或数组，递归查找
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const result = findValuePath(obj[key], target, currentPath)

      if (result) return result
    }
  }

  return null
}

/**
 * API工具组合
 *
 * @var {[type]}
 */
export const apiTools = { apiReq, $thenBack, $catchBack, $downloadFile }
