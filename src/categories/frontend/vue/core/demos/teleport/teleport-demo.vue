<script setup lang="ts">
import { ref } from 'vue'

const openInside = ref(false)
const openTeleport = ref(false)
</script>

<template>
  <div class="demo">
    <div class="clip-box">
      <p class="caption">这个父容器使用 overflow: hidden，并限制了高度</p>
      <div class="row">
        <button class="btn" @click="openInside = !openInside">原地弹出（被裁剪）</button>
        <button class="btn" @click="openTeleport = !openTeleport">
          Teleport 到 body（完整显示）
        </button>
      </div>
      <div v-if="openInside" class="popup">我留在原地，下半部分被父容器裁掉了。</div>
      <Teleport to="body">
        <div v-if="openTeleport" class="popup popup-fixed">
          <p>我被传送到 body 下，仍由原组件的状态控制。</p>
          <button class="btn" @click="openTeleport = false">关闭</button>
        </div>
      </Teleport>
    </div>
    <p class="hint">两个弹层写在同一个组件内；区别只在于 Teleport 将第二个弹层的 DOM 挂到 body。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.clip-box {
  position: relative;
  height: 120px;
  padding: 10px 12px;
  overflow: hidden;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
}

.caption {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.btn {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  background: #fff;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.popup {
  width: 260px;
  margin-top: 8px;
  padding: 14px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-size: 13px;
}

.popup-fixed {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  margin-top: 0;
}

.popup-fixed p {
  margin: 0 0 8px;
}

.hint {
  margin-top: 8px;
  color: #6e6e73;
  font-size: 13px;
}
</style>
