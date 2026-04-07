<template>
  <div id="app" style="padding: 20px">
    <h1>Vue2 + Vant 配置化组件示例</h1>

    <section>
      <h2>CommonCardList 组件</h2>
      <p>移动端卡片列表 - 支持下拉刷新、无限滚动</p>

      <CommonCardList
        :list="cardList"
        @refresh="handleRefresh"
        @loadMore="handleLoadMore"
      />
    </section>

    <section style="margin-top: 24px">
      <h2>工具函数示例</h2>
      <van-button type="primary" @click="testApiTools">
        测试 API 工具
      </van-button>
      <div v-if="testResult" class="result">
        结果: {{ testResult }}
      </div>
    </section>
  </div>
</template>

<script>
import { CommonCardList } from '@conf-component-tool-lib/vue2-vant'
import { chainAccess } from '@conf-component-tool-lib/shared'

export default {
  name: 'App',
  components: {
    CommonCardList,
  },
  data() {
    return {
      cardList: [
        { id: 1, title: '卡片 1', description: '这是第一个卡片' },
        { id: 2, title: '卡片 2', description: '这是第二个卡片' },
        { id: 3, title: '卡片 3', description: '这是第三个卡片' },
      ],
      testResult: '',
    }
  },
  methods: {
    handleRefresh() {
      console.log('下拉刷新触发')
    },
    handleLoadMore() {
      console.log('加载更多触发')
      this.cardList.push({
        id: this.cardList.length + 1,
        title: `卡片 ${this.cardList.length + 1}`,
        description: '新加载的卡片',
      })
    },
    testApiTools() {
      const testData = { user: { name: '张三' } }
      const name = chainAccess(testData, 'user.name')
      this.testResult = `chainAccess 结果: ${name}`
    },
  },
}
</script>

<style scoped>
h1 {
  color: #333;
  text-align: center;
  margin-bottom: 24px;
}

section {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

h2 {
  color: #666;
  border-bottom: 2px solid #07c160;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

p {
  color: #999;
  margin-bottom: 12px;
}

.result {
  margin-top: 12px;
  padding: 10px;
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}
</style>
