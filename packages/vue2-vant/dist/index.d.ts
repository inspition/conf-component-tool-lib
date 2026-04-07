import { $downloadFile } from '@conf-component-tool-lib/shared';
import { $thenBack } from '@conf-component-tool-lib/shared';
import { AnyObject } from '@conf-component-tool-lib/shared';
import { default as CommonCardList } from './components/CommonCardList/index.vue';

/**
 * API catch回调处理 (Vant Toast)
 */
export declare function $catchBack(errPrefix?: string): (err: AnyObject) => {
    [key: string]: any;
};

/**
 * 接口请求封装
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

export { CommonCardList }


export * from "@conf-component-tool-lib/shared";

export { }
