import { $downloadFile } from '@conf-component-tool-lib/shared';
import { $thenBack } from '@conf-component-tool-lib/shared';
import { AnyObject } from '@conf-component-tool-lib/shared';
import { default as CmTableDynamicColumn } from './components/CommonTable/cm-table-dynamic-column.vue';
import { default as CommonDescriptions } from './components/CommonDescriptions/index.vue';
import { default as CommonSelect } from './components/CommonSelect/index.vue';
import { default as CommonTable } from './components/CommonTable/index.vue';

/**
 * API catch回调处理 (Element UI)
 * @param {String} errPrefix  [自定义错误前缀]
 */
export declare function $catchBack(errPrefix?: string): (err: AnyObject) => {
    [key: string]: any;
};

/**
 * 请求提交定制确认
 * @param {String} tip  [确认提示语]
 * @param {Function} thenBack  [确认后执行回调]
 */
export declare function $confirmReq(tip?: string, thenBack?: (res?: any) => null): Promise<void>;

/**
 * 接口请求封装
 *
 * @param {T} api [接口]
 * @returns {args<T><ReturnType><T> | undefined} return description
     */
 export declare function apiReq<T extends (...args: any[]) => any>(api: T): (...args: Parameters<T>) => ReturnType<T>;

 /**
  * API工具组合
  */
 export declare const apiTools: {
     apiReq: typeof apiReq;
     $thenBack: typeof $thenBack;
     $catchBack: typeof $catchBack;
     $downloadFile: typeof $downloadFile;
 };

 /**
  * 文件异常检测
  *
  * @param   {[type]}  fileBlob  [fileBlob description]
  *
  * @return  {[Boolean]}        是否异常
  */
 export declare function checkFileCatch(fileBlob?: Blob): Promise<boolean>;

 export { CmTableDynamicColumn }

 export { CommonDescriptions }

 export { CommonSelect }

 export { CommonTable }


 export * from "@conf-component-tool-lib/shared";

 export { }
