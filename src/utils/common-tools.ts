import { MessageBox, Message } from "element-ui";

interface AnyObject {
  [key: string]: any;
}

interface AxiosInstance {
  <T = any>(...value: T[]): Promise<T>;
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    const result = fn();
    const nullish = [null, undefined];

    if (!result && nullish.includes(result))
      throw new Error(`get fn() error: ${result}`);

    return result;
  } catch (error) {
    // console.warn('get value error:', error)
    return defaultValue;
  }
}

/**
 * 链式访问器
 * @param {Any} result  [访问对象]
 * @param {String} path [访问链地址，例：'data.pageInfo.list.0']
 * @return {Any}
 */
export function chainAccess(result: AnyObject, path: string) {
  const aPath = path.split(".");
  let newRes = result?.[aPath?.shift?.() || ""];

  if (aPath.length && newRes) newRes = chainAccess(newRes, aPath.join("."));

  return newRes;
}

/**
 * 防抖
 *
 * @return  {[Function]}     [return 防抖加工后的新方法]
 */
export function joinDebounce() {
  let timer: NodeJS.Timeout;

  return (func: () => any, ms = 500) => {
    clearTimeout(timer);
    timer = setTimeout(func, ms);
  };
}

/**
 * 生成并行异步请求列表
 *
 * @param   {[Promise]}  apis  [Promise.all([...])]
 *
 * @return  {[Promise]}        [return description]
 */
export function genrateParallels(apis: any[]) {
  const parallels = apis.map((api) => (async () => await api)());

  return parallels;
}

/**
 * API then回调处理
 * @param {Object} res  [resolve参数]
 */
export function $thenBack(res: AnyObject) {
  const data = res?.data;
  // const isError = !data;
  const isError = data?.code !== 0;

  if (isError) throw data;

  return data;
}

/**
 * API catch回调处理
 * @param {String} errPrefix  [自定义错误前缀]
 */
export function $catchBack(errPrefix = "") {
  return function (err: AnyObject) {
    const [backData, errorMsg] = [
      { ...err },
      errPrefix + (err?.msg || err?.errorMsg || err?.message || ""),
    ];

    Message.error(errorMsg);

    return backData;
  };
}

/**
 * 接口请求封装
 *
 * @param   {[Promise]}  api  [接口]
 *
 * @return  {[Promise]}       [回调处理后的新接口]
 */
export function apiReq(api: AxiosInstance) {
  return (...params: any[]) =>
    api(...(params ?? []))
      .then($thenBack)
      .catch($catchBack());
}

/**
 * 文件下载
 *
 * @param   {[any]}  res  接口回调
 *
 * @return  {[type]}       [return description]
 */
export function $downloadFile(res: AnyObject) {
  const { data, headers } = res || {};
  const isError = !data;

  if (isError) throw res;

  const { "content-disposition": contDesc, "content-type": contType } =
    headers || {};

  const type = contType
    ?.split(";")
    .find((v: AnyObject) => v.includes("application"));
  const fileName = contDesc
    ?.split(";")
    .find((v: AnyObject) => v.includes("filename="))
    ?.replace("filename=", "");

  const decodeName = fileName ? decodeURIComponent(fileName) : "附件";

  const [blob, eLink] = [
    new Blob([data], { type }),
    document.createElement("a"),
  ];

  eLink.download = decodeName;
  eLink.style.display = "none";
  eLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eLink);
  eLink.click();
  URL.revokeObjectURL(eLink.href);
  document.body.removeChild(eLink);
}

/**
 * item字段映射
 *
 * @param   {[Object]}  fieldsMap  [传入字段映射表，返回返]
 *
 * @return  {[Function]}             [return 映射转换]
 */
export function itemFiledsMap(fieldsMap: AnyObject) {
  return function (item = {}) {
    const formatItem = {};

    Object.entries(fieldsMap).forEach(([key, path]) => {
      Object.defineProperty(formatItem, key, {
        value: chainAccess(item, path),
        writable: true,
        enumerable: true,
        configurable: true,
      });
      // formatItem[key] = chainAccess(item, path);
    });

    return formatItem;
  };
}

/**
 * 请求提交定制确认
 * @param {String} tip  [确认提示语]
 * @param {Function} thenBack  [确认后执行回调]
 */
export async function $confirmReq(tip = "", thenBack = (res?: any) => null) {
  await MessageBox.confirm(tip, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then((res?: any) => {
    setTimeout(() => thenBack(res), 300); // 避免遮罩层关闭时与下一个弹窗开启冲突
  });
}

/**
 * API工具组合
 *
 * @var {[type]}
 */
export const apiTools = { apiReq, $thenBack, $catchBack, $downloadFile };