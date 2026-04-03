export interface AnyObject {
  [key: string]: any
}

export interface AxiosInstance {
  <T = any>(...value: T[]): Promise<T>
}

export type Task = () => Promise<any>

export interface TaskItem {
  task: Task
  resolve: (value?: any) => void
  reject: (value?: any) => void
}
