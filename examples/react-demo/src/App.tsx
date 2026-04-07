import React from 'react'
import {
  random,
  getValue,
  chainAccess,
  deepCopy,
  joinDebounce,
} from '@conf-component-tool-lib/shared'

const App: React.FC = () => {
  const testData = {
    user: {
      name: '张三',
      profile: {
        age: 28,
        dept: '技术部',
      },
    },
  }

  const name = chainAccess(testData, 'user.name')
  const age = chainAccess(testData, 'user.profile.age')
  const randomNum = random(1, 100)
  const safeValue = getValue(() => testData.user.name, '默认值')
  const copied = deepCopy(testData)

  return (
    <div style={{ padding: 24 }}>
      <h1>React Demo - @conf-component-tool-lib/shared 工具测试</h1>

      <h2>chainAccess 链式访问</h2>
      <p>user.name: {name}</p>
      <p>user.profile.age: {age}</p>

      <h2>random 随机数</h2>
      <p>random(1, 100): {randomNum}</p>

      <h2>getValue 安全取值</h2>
      <p>getValue: {safeValue}</p>

      <h2>deepCopy 深拷贝</h2>
      <p>拷贝结果: {JSON.stringify(copied)}</p>
      <p>是否独立对象: {String(copied !== testData)}</p>
    </div>
  )
}

export default App
