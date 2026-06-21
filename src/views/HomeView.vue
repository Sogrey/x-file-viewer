<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToViewer() {
  router.push('/viewer')
}

const features = [
  { icon: '📷', title: '图片预览', desc: '支持 jpg、png、gif、webp、avif、svg、bmp、tiff、heic、heif 等格式' },
  { icon: '🎬', title: '视频播放', desc: '支持 mp4、webm、mov、avi、mkv、flv、wmv、m3u8 等格式' },
  { icon: '🎵', title: '音频播放', desc: '支持 mp3、wav、ogg、aac、m4a、flac、opus 等格式' },
  { icon: '📝', title: '文本代码', desc: '支持 txt、md、json、yaml、xml、js、ts、vue、html、css、py、go、rs 等格式' },
  { icon: '📕', title: 'PDF 电子书', desc: '支持 pdf、epub、xps、oxps 等格式' },
  { icon: '📄', title: 'Office 文档', desc: '支持 docx、rtf、odt、xlsx、csv、pptx、odp、wps、et、dps 等格式' },
  { icon: '📦', title: '压缩包', desc: '支持 zip、rar、7z、tar、gz、tgz、bz2、xz 等格式' },
  { icon: '📧', title: '邮件', desc: '支持 eml、msg、mbox 等格式' },
  { icon: '📐', title: 'CAD 图纸', desc: '支持 dxf、dwg、dwf、step、stp、iges、ifc、skp 等格式' },
  { icon: '🗿', title: '3D 模型', desc: '支持 gltf、glb、obj、stl、fbx、dae、ply、3mf、usdz 等格式' },
  { icon: '🗺️', title: 'GIS 地理数据', desc: '支持 geojson、topojson、kml、kmz、gpx、shp 等格式' },
  { icon: '🎨', title: '设计资产', desc: '支持 ttf、woff2、psd、ai、eps、sqlite、wasm、parquet、avro 等格式' },
]

const stats = [
  { value: '110+', label: '支持格式' },
  { value: '4', label: '框架兼容' },
  { value: '15', label: '内置插件' },
  { value: '0', label: '服务端依赖' },
]
</script>

<template>
  <div class="home-container">
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-icon">📁</span>
            万能文档阅读器
          </h1>
          <p class="hero-subtitle">
            一款基于 Open File Viewer 的跨平台文档预览工具
          </p>
          <p class="hero-desc">
            无需安装任何软件，直接在浏览器中预览 110+ 种文件格式。
            支持图片、视频、音频、PDF、Office、压缩包、CAD、3D 模型、GIS 数据等。
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="goToViewer">
              <span class="btn-icon">🚀</span>
              立即使用
            </button>
            <a href="https://github.com/Sogrey/x-file-viewer" target="_blank" class="btn-secondary">
              <span class="btn-icon">⭐</span>
              GitHub
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="preview-card">
            <div class="preview-header">
              <div class="preview-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="preview-title">文档预览</span>
            </div>
            <div class="preview-content">
              <div class="file-icons">
                <span class="file-icon">📄</span>
                <span class="file-icon">📊</span>
                <span class="file-icon">📈</span>
                <span class="file-icon">🖼️</span>
                <span class="file-icon">🎬</span>
                <span class="file-icon">🎵</span>
              </div>
              <div class="preview-text">
                <p>支持多种文件格式</p>
                <p>安全 · 快速 · 便捷</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="stats-container">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-header">
        <h2>支持格式</h2>
        <p>覆盖 110+ 种文件格式，满足各种业务场景需求</p>
      </div>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <span class="feature-icon">{{ feature.icon }}</span>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <section class="tech-section">
      <div class="section-header">
        <h2>技术栈</h2>
        <p>现代化前端技术栈，稳定可靠</p>
      </div>
      <div class="tech-grid">
        <div class="tech-card">
          <span class="tech-icon">💚</span>
          <h3>Vue 3</h3>
          <p>Composition API，响应式设计</p>
        </div>
        <div class="tech-card">
          <span class="tech-icon">📘</span>
          <h3>TypeScript</h3>
          <p>类型安全，开发体验更佳</p>
        </div>
        <div class="tech-card">
          <span class="tech-icon">⚡</span>
          <h3>Vite</h3>
          <p>快速构建，热更新</p>
        </div>
        <div class="tech-card">
          <span class="tech-icon">👁️</span>
          <h3>Open File Viewer</h3>
          <p>强大的文件预览核心</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2>准备好开始了吗？</h2>
        <p>立即体验万能文档阅读器，无需安装任何软件</p>
        <button class="btn-primary" @click="goToViewer">
          <span class="btn-icon">🚀</span>
          立即使用
        </button>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <p>万能文档阅读器 · 基于 Open File Viewer 构建</p>
        <p>
          <a href="https://github.com/Sogrey/x-file-viewer" target="_blank">GitHub</a>
          <span class="separator">|</span>
          <a href="https://open-file-viewer-workspace.void.app/" target="_blank">Open File Viewer</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #f1f5f9;
}

.hero {
  padding: 80px 24px 120px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 80px;
  position: relative;
  z-index: 1;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  font-size: 56px;
}

.hero-subtitle {
  font-size: 20px;
  color: #94a3b8;
  margin: 0 0 16px;
}

.hero-desc {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.8;
  margin: 0 0 32px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  font-size: 18px;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
}

.preview-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.preview-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red {
  background: #ef4444;
}

.dot.yellow {
  background: #eab308;
}

.dot.green {
  background: #22c55e;
}

.preview-title {
  font-size: 14px;
  color: #94a3b8;
}

.preview-content {
  padding: 32px;
  text-align: center;
}

.file-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.file-icon {
  font-size: 36px;
}

.preview-text p {
  margin: 8px 0;
  color: #94a3b8;
}

.stats-section {
  padding: 40px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 80px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: #3b82f6;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}

.features-section {
  padding: 80px 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px;
}

.section-header p {
  font-size: 16px;
  color: #94a3b8;
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.feature-card:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
}

.feature-desc {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
}

.tech-section {
  padding: 80px 24px;
  background: rgba(255, 255, 255, 0.02);
}

.tech-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.tech-card {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.tech-card:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(59, 130, 246, 0.3);
}

.tech-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.tech-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
}

.tech-card p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.cta-section {
  padding: 100px 24px;
  text-align: center;
}

.cta-content h2 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px;
}

.cta-content p {
  font-size: 18px;
  color: #94a3b8;
  margin: 0 0 32px;
}

.footer {
  padding: 40px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-content p {
  font-size: 14px;
  color: #64748b;
  margin: 8px 0;
}

.footer-content a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-content a:hover {
  color: #3b82f6;
}

.separator {
  margin: 0 12px;
  color: #475569;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    gap: 48px;
    text-align: center;
  }

  .hero-title {
    font-size: 32px;
    flex-direction: column;
    gap: 8px;
  }

  .title-icon {
    font-size: 40px;
  }

  .hero-desc {
    margin: 0 auto 32px;
  }

  .stats-container {
    gap: 40px;
  }

  .stat-value {
    font-size: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cta-content h2 {
    font-size: 28px;
  }
}
</style>
