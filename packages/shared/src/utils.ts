import type { AnyObject, TaskItem, Task } from './types'

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
  let timer: ReturnType<typeof setTimeout>

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
  const parallels = apis.map((api) => (async () => await api)())
  return parallels
}

/**
 * API then回调处理
 * @param {Object} res  [resolve参数]
 */
export function $thenBack(res: AnyObject) {
  const data = res?.data
  const isError = data?.code !== 0

  if (isError) throw data

  return data
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
 */
export function itemFiledsMap(fieldsMap: AnyObject) {
  return function (item: AnyObject = {}) {
    const formatItem: AnyObject = {}

    Object.entries(fieldsMap).forEach(([key, path]) => {
      Object.defineProperty(formatItem, key, {
        value: chainAccess(item, path as string),
        writable: true,
        enumerable: true,
        configurable: true,
      })
    })

    return formatItem
  }
}

/**
 * 查找对象中特定值的路径
 */
export function findValuePath(
  obj: any,
  target: any,
  path: string[] = [],
): string[] | null {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const currentPath = [...path, key]

    if (obj[key] === target) return currentPath

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const result = findValuePath(obj[key], target, currentPath)
      if (result) return result
    }
  }

  return null
}

/**
 * 深拷贝函数
 */
export function deepCopy(data: any) {
  const valTypes = [Number.name, Boolean.name, String.name, 'Null', 'Undefined']
  const dataType = Object.prototype.toString.call(data)

  let copy: any

  if (dataType.includes(Array.name)) {
    copy = []
  } else if (dataType.includes(Object.name)) {
    copy = {}
  } else if (dataType.includes(Function.name)) {
    return
  } else if (valTypes.some((t) => dataType.includes(t))) {
    return data
  } else {
    copy = {}
  }

  for (const key in data) {
    const item = data[key]
    if (Object.prototype.toString.call(item).includes(Function.name)) continue
    copy[key] = deepCopy(item)
  }

  return copy
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
