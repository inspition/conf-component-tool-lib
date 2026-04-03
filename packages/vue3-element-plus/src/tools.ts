import { ElMessage, ElMessageBox } from 'element-plus'
import { $thenBack, $downloadFile, type AnyObject } from '@conf-tool/shared'

export * from '@conf-tool/shared'

/**
 * API catch回调处理 (Element Plus)
 */
export function $catchBack(errPrefix = '') {
  return function (err: AnyObject) {
    const [backData, errorMsg] = [
      { ...err },
      errPrefix + (err?.errorMsg || err?.msg || err?.message || ''),
    ]

    ElMessage.error(errorMsg)

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
 * 请求提交定制确认
 */
export async function $confirmReq(tip = '', thenBack = (res?: any) => null) {
  await ElMessageBox.confirm(tip, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then((res?: any) => {
    setTimeout(() => thenBack(res), 300)
  })
}

/**
 * 文件异常检测
 */
export async function checkFileCatch(fileBlob = new Blob()) {
  const text = await fileBlob?.text?.()
  let isError = false

  try {
    const fileInfo = JSON.parse(text ?? 'null') ?? {}
    isError = fileInfo.code !== 0
    $catchBack()(fileInfo)
  } catch (err) {
    console.log('JSON 无法解析', err)
  }

  return isError
}

/**
 * API工具组合
 */
export const apiTools = { apiReq, $thenBack, $catchBack, $downloadFile }
