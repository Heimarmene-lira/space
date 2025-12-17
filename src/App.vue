<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="cosmic-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="cosmic-footer">
      <p>© 2024 Космический портал. Исследуйте Вселенную с нами! 🚀</p>
      <div class="footer-links">
        <a href="#"><i class="fas fa-rocket"></i> О проекте</a>
        <a href="#"><i class="fas fa-envelope"></i> Контакты</a>
        <a href="#"><i class="fas fa-shield-alt"></i> Политика конфиденциальности</a>
      </div>
    </footer>
  </div>
</template>

<script>
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: { Header }
}
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 180px);
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.cosmic-fade-enter-active,
.cosmic-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.cosmic-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.cosmic-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.cosmic-footer {
  background: rgba(0, 30, 60, 0.8);
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(110, 231, 255, 0.3);
  backdrop-filter: blur(10px);
}

.footer-links {
  margin-top: 15px;
}

.footer-links a {
  color: #6ee7ff;
  margin: 0 15px;
  text-decoration: none;
  transition: text-shadow 0.3s;
}

.footer-links a:hover {
  text-shadow: 0 0 8px #6ee7ff;
}
</style>
