#!/usr/bin/env node

/**
 * 新包生成脚手架
 *
 * 用法:
 *   node scripts/new-package.js --name my-component --framework vue3 --lib element-plus
 *   node scripts/new-package.js --name my-mobile --framework vue2 --lib vant
 *   node scripts/new-package.js --name my-react --framework react --lib antd
 */

const fs = require('fs')
const path = require('path')

// ==================== 参数解析 ====================
const args = process.argv.slice(2)

function getArg(flag) {
  const idx = args.indexOf(flag)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}

const name = getArg('--name')
const framework = getArg('--framework') || 'vue3'
const lib = getArg('--lib') || 'element-plus'

if (!name) {
  console.error('错误: 请提供 --name 参数')
  console.log(
    '用法: node scripts/new-package.js --name <包名> --framework <vue2|vue3|react> --lib <ui库>'
  )
  process.exit(1)
}

const validFrameworks = ['vue2', 'vue3', 'react']
if (!validFrameworks.includes(framework)) {
  console.error(`错误: --framework 必须为 ${validFrameworks.join(' | ')}`)
  process.exit(1)
}

// ==================== 模板配置 ====================
const pkgName = `@conf-component-tool-lib/${name}`
const pkgDir = path.resolve(__dirname, '..', 'packages', name)

if (fs.existsSync(pkgDir)) {
  console.error(`错误: 包目录已存在 ${pkgDir}`)
  process.exit(1)
}

function getFrameworkConfig() {
  switch (framework) {
    case 'vue2':
      return {
        peerDeps: {
          vue: '^2.6.0 || ^2.7.0',
          [lib]: '*',
        },
        devDeps: {
          vue: '^2.7.16',
          [lib]: '*',
          '@vitejs/plugin-vue2': '^2.3.0',
          typescript: '^5.4.0',
          vite: '^5.4.0',
          'vite-plugin-dts': '^3.9.0',
        },
        vitePlugin: `import vue2 from '@vitejs/plugin-vue2'`,
        vitePluginUse: 'vue2()',
        external: ['vue', lib],
        tsconfig: {
          jsx: 'preserve',
        },
        includes: ['src/**/*.ts', 'src/**/*.vue'],
        sampleComponent: generateVue2Component(),
      }
    case 'vue3':
      return {
        peerDeps: {
          vue: '^3.3.0',
          [lib]: '*',
        },
        devDeps: {
          vue: '^3.4.0',
          [lib]: '*',
          '@vitejs/plugin-vue': '^5.0.0',
          '@vitejs/plugin-vue-jsx': '^3.1.0',
          typescript: '^5.4.0',
          vite: '^5.4.0',
          'vite-plugin-dts': '^3.9.0',
        },
        vitePlugin: `import vue from '@vitejs/plugin-vue'\nimport vueJsx from '@vitejs/plugin-vue-jsx'`,
        vitePluginUse: 'vue(), vueJsx()',
        external: ['vue', lib],
        tsconfig: {
          jsx: 'preserve',
          jsxImportSource: 'vue',
        },
        includes: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        sampleComponent: generateVue3Component(),
      }
    case 'react':
      return {
        peerDeps: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          [lib]: '*',
        },
        devDeps: {
          react: '^18.3.0',
          'react-dom': '^18.3.0',
          [lib]: '*',
          '@types/react': '^18.3.0',
          '@types/react-dom': '^18.3.0',
          '@vitejs/plugin-react': '^4.3.0',
          typescript: '^5.4.0',
          vite: '^5.4.0',
          'vite-plugin-dts': '^3.9.0',
        },
        vitePlugin: `import react from '@vitejs/plugin-react'`,
        vitePluginUse: 'react()',
        external: ['react', 'react-dom', lib],
        tsconfig: {
          jsx: 'react-jsx',
        },
        includes: ['src/**/*.ts', 'src/**/*.tsx'],
        sampleComponent: generateReactComponent(),
      }
  }
}

function generateVue2Component() {
  return `<template>
  <div class="sample-component">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SampleComponent',
}
</script>

<style scoped></style>
`
}

function generateVue3Component() {
  return `<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="sample-component">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
  </div>
</template>

<style scoped></style>
`
}

function generateReactComponent() {
  return `import React from 'react'

export interface SampleComponentProps {
  title?: string
  children?: React.ReactNode
}

export const SampleComponent: React.FC<SampleComponentProps> = ({
  title,
  children,
}) => {
  return (
    <div className="sample-component">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}

export default SampleComponent
`
}

// ==================== 文件生成 ====================
const config = getFrameworkConfig()

function mkdirSync(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath)
  mkdirSync(dir)
  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`  创建: ${path.relative(process.cwd(), filePath)}`)
}

console.log(`\n正在创建包: ${pkgName}`)
console.log(`框架: ${framework} | UI库: ${lib}\n`)

// package.json
writeFile(
  path.join(pkgDir, 'package.json'),
  JSON.stringify(
    {
      name: pkgName,
      version: '1.0.0',
      description: `${framework} + ${lib} 配置化组件`,
      type: 'module',
      main: './dist/index.cjs',
      module: './dist/index.mjs',
      types: './dist/index.d.ts',
      exports: {
        '.': {
          import: './dist/index.mjs',
          require: './dist/index.cjs',
          types: './dist/index.d.ts',
        },
      },
      files: ['dist'],
      scripts: {
        build: 'vite build',
        dev: 'vite build --watch',
      },
      dependencies: {
        '@conf-component-tool-lib/shared': 'workspace:*',
      },
      peerDependencies: config.peerDeps,
      devDependencies: config.devDeps,
    },
    null,
    2
  ) + '\n'
)

// tsconfig.json
writeFile(
  path.join(pkgDir, 'tsconfig.json'),
  JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
        declaration: true,
        declarationDir: './dist',
        ...config.tsconfig,
        paths: {
          '@conf-component-tool-lib/shared': ['../shared/src'],
        },
      },
      include: config.includes,
    },
    null,
    2
  ) + '\n'
)

// vite.config.ts
const externalStr = config.external.map((e) => `'${e}'`).join(', ')
writeFile(
  path.join(pkgDir, 'vite.config.ts'),
  `${config.vitePlugin}
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [${config.vitePluginUse}, dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => \`index.\${format === 'es' ? 'mjs' : 'cjs'}\`,
    },
    rollupOptions: {
      external: [${externalStr}],
    },
  },
})
`
)

// src/index.ts
const isReact = framework === 'react'
const componentExt = isReact ? 'tsx' : 'vue'
const sampleExport = isReact
  ? `export { default as SampleComponent } from './components/SampleComponent'`
  : `export { default as SampleComponent } from './components/SampleComponent.${componentExt}'`

writeFile(
  path.join(pkgDir, 'src', 'index.ts'),
  `${sampleExport}\nexport * from '@conf-component-tool-lib/shared'\n`
)

// Sample component
const componentFileName = isReact
  ? 'SampleComponent.tsx'
  : 'SampleComponent.vue'
writeFile(
  path.join(pkgDir, 'src', 'components', componentFileName),
  config.sampleComponent
)

console.log(`\n✅ 包 ${pkgName} 创建完成！`)
console.log(`\n后续步骤:`)
console.log(`  1. pnpm install`)
console.log(`  2. cd packages/${name}`)
console.log(`  3. pnpm build`)
