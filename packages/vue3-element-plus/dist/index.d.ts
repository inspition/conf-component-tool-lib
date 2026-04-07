import { $downloadFile } from '@conf-tool/shared';
import { $thenBack } from '@conf-tool/shared';
import { AnyObject } from '@conf-tool/shared';
import { default as CommonTable } from './components/CommonTable/index.vue';
import { ComponentInstance } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { DefineComponent } from 'vue';
import { ElSelect } from 'element-plus';
import { ExtractPropTypes } from 'vue';
import { JSX } from 'vue/jsx-runtime';
import { PaginationProps } from 'element-plus';
import { PropType } from 'vue';
import { PublicProps } from 'vue';
import { TableColumnCtx } from 'element-plus';
import { TableProps } from 'element-plus';

/**
 * API catch回调处理 (Element Plus)
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

declare const __VLS_component: DefineComponent<ExtractPropTypes<    {
modelValue: PropType<any[]>;
headTitle: {
type: PropType<string | any[]>;
};
tableConf: {
type: PropType<TableConf>;
required: true;
};
}>, {
initData: () => Promise<void>;
restTableLayout: typeof restTableLayout;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<    {
modelValue: PropType<any[]>;
headTitle: {
type: PropType<string | any[]>;
};
tableConf: {
type: PropType<TableConf>;
required: true;
};
}>> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

declare function __VLS_template(): {
    operaNav?(_: {
        row: null;
    }): any;
};

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

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

 /**
  * 定义通用下拉组件的选项接口
  */
 declare interface CmOptions {
     /**
      * 选项展示文本对应的属性名
      */
     key?: string;
     /**
      * 选项值对应的属性名
      */
     value?: string;
     /**
      * 数据路径，用于从接口返回的数据中提取数据
      */
     path?: string;
     /**
      * 异步获取数据的方法
      */
     api?: (...args: any[]) => Promise<any>;
 }

 /** 列配置类型 */
 declare interface ColumnDef extends ColumnProps {
     /** 自定义单元格渲染组件 */
     render?: ComponentInstance<any>;
     /** 自定义表头渲染组件 */
     headerRender?: ComponentInstance<any>;
     /** 其他自定义属性 */
     [key: string]: any;
 }

 declare type ColumnProps = Partial<TableColumnCtx<unknown>>;

 export declare const CommonSelect: DefineComponent<ExtractPropTypes<    {
 modelValue: StringConstructor;
 /**
 * 配置选项，通过传入一个 CmOptions 对象进行定制
 */
 options: {
 type: PropType<CmOptions>;
 default(): {};
 };
 /**
 * 直接传入的数据数组，用于显示下拉选项
 */
 data: {
 type: ArrayConstructor;
 default(): never[];
 };
 /**
 * 额外绑定的属性，类型定义参考 Element Plus 的 ElSelect 组件 props
 */
 bind: {
 type: PropType<SelectProp>;
 };
 }>, () => JSX.Element, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", PublicProps, Readonly<ExtractPropTypes<    {
 modelValue: StringConstructor;
 /**
 * 配置选项，通过传入一个 CmOptions 对象进行定制
 */
 options: {
 type: PropType<CmOptions>;
 default(): {};
 };
 /**
 * 直接传入的数据数组，用于显示下拉选项
 */
 data: {
 type: ArrayConstructor;
 default(): never[];
 };
 /**
 * 额外绑定的属性，类型定义参考 Element Plus 的 ElSelect 组件 props
 */
 bind: {
 type: PropType<SelectProp>;
 };
 }>> & Readonly<{
 "onUpdate:modelValue"?: ((...args: any[]) => any) | undefined;
 }>, {
 options: CmOptions;
 data: unknown[];
 }, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

 export { CommonTable }

 export declare const CommonTableTs: __VLS_WithTemplateSlots<typeof __VLS_component, ReturnType<typeof __VLS_template>>;

 /** 数据请求器配置 */
 declare interface Requester {
     /** 请求参数数组 */
     params?: [number, number, any];
     /** 请求API方法 */
     api?: (...args: any[]) => Promise<any>;
     /** 响应数据路径（支持链式访问，如 'data.list'） */
     path?: string;
     /** 数据转换方法 */
     getter?: (data: any) => any[];
 }

 /** 重置表格布局 */
 declare function restTableLayout(): void;

 /**
  * 通过 ElSelect 的实例类型获取其 props 类型
  */
 declare type SelectProp = InstanceType<typeof ElSelect>['$props'];

 /** 表格主配置类型（继承Element Table所有属性） */
 declare interface TableConf extends Partial<TableProps<any>> {
     /** 列配置数组（必需） */
     columnList: ColumnDef[];
     /** 多选列配置 */
     selection?: ColumnDef[];
     /** 数据请求配置 */
     requester?: Requester;
     /** 分页配置 */
     pagintion?: {
         /** Element Pagination组件属性 */
         bind?: PaginationProps;
         pageFiled?: string;
         totalFiled?: string;
     } | boolean;
     /** 事件监听配置 */
     on?: Record<string, (...args: any[]) => void>;
 }


 export * from "@conf-tool/shared";

 export { }
