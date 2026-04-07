/**
 * 文件下载
 *
 * @param   {[AnyObject]}  res  接口回调
 * @param   {string}     fileNameKey  下载文件键名
 */
export declare function $downloadFile(res: AnyObject, fileNameKey?: string): void;

/**
 * API then回调处理
 * @param {Object} res  [resolve参数]
 */
export declare function $thenBack(res: AnyObject): any;

export declare interface AnyObject {
    [key: string]: any;
}

export declare interface AxiosInstance {
    <T = any>(...value: T[]): Promise<T>;
}

/**
 * 链式访问器
 * @param {Any} result  [访问对象]
 * @param {String} path [访问链地址，例：'data.pageInfo.list.0']
 * @return {Any}
 */
export declare function chainAccess(result: AnyObject, path: string): any;

/**
 * 并发管理
 */
export declare class ConcurrencyManager {
    #private;
    constructor(max?: number);
    dequeue(task: Task): Promise<unknown>;
}

/**
 * 深拷贝函数
 */
export declare function deepCopy(data: any): any;

/**
 * 查找对象中特定值的路径
 */
export declare function findValuePath(obj: any, target: any, path?: string[]): string[] | null;

/**
 * 生成并行异步请求列表
 *
 * @param   {[Promise]}  apis  [Promise.all([...])]
 *
 * @return  {[Promise]}        [return description]
 */
export declare function genrateParallels(apis: any[]): Promise<any>[];

/**
 * [链式取值]
 *
 * @param   {Function}   fn            [于函数中返回的取值对象]
 * @param   {any}  defaultValue  [可选默认返回值]
 *
 * @return  {[type]}                   [return description]
 */
export declare function getValue(fn: () => any, defaultValue?: any): any;

/**
 * item字段映射
 */
export declare function itemFiledsMap(fieldsMap: AnyObject): (item?: AnyObject) => AnyObject;

/**
 * 防抖
 *
 * @return  {[Function]}     [return 防抖加工后的新方法]
 */
export declare function joinDebounce(): (func: () => any, ms?: number) => void;

export declare function random(min: number, max: number): number;

export declare type Task = () => Promise<any>;

export declare interface TaskItem {
    task: Task;
    resolve: (value?: any) => void;
    reject: (value?: any) => void;
}

export { }
