<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style />
    <n-message-provider>
    <n-dialog-provider>
    <div class="min-h-screen bg-gray-950 text-white flex flex-col">
      <!-- 顶部导航 -->
      <header class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🍅</span>
          <span class="text-xl font-bold tracking-wide">番茄时钟</span>
        </div>
        <nav class="flex gap-2">
          <router-link to="/timer">
            <n-button :type="$route.path === '/timer' ? 'primary' : 'default'" size="small">
              ⏱ 专注
            </n-button>
          </router-link>
          <router-link to="/stats">
            <n-button :type="$route.path === '/stats' ? 'primary' : 'default'" size="small">
              📊 统计
            </n-button>
          </router-link>
        </nav>
      </header>
      <!-- 内容区 -->
      <main class="flex-1 flex items-center justify-center p-6">
        <router-view />
      </main>
    </div>
    </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui'
</script>
