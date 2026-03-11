<!--
  操作区容器
  left slot：左侧内容（标题、说明文字等）
  default slot：右侧操作按钮
-->
<template>
  <el-card class="operate-container" shadow="never">
    <div class="operate-inner">
      <div class="operate-left">
        <slot name="left" />
      </div>
      <div class="operate-right">
        <slot />
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.operate-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.operate-left,
.operate-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
