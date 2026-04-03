import { Toast } from 'vant'
import { $thenBack, $downloadFile, type AnyObject } from '@conf-tool/shared'

export * from '@conf-tool/shared'

/**
 * API catch回调处理 (Vant Toast)
 */
export function $catchBack(errPrefix = '') {
  return function (err: AnyObject) {
    const [backData, errorMsg] = [
      { ...err },
      errPrefix + (err?.errorMsg || err?.msg || err?.message || ''),
    ]

    Toast.fail(errorMsg)

    return backData
  }
}

/**
 * 接口请求封装
 */
export function apiReq<T extends (...args: any[]) => any>(
  api: T,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...params: any[]) =>
    api(...(params ?? []))
      .then($thenBack)
      .catch($catchBack())
}

/**
 * API工具组合
 */
export const apiTools = { apiReq, $thenBack, $catchBack, $downloadFile }
