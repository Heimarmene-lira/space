<template>
  <header class="cosmic-header">
    <div class="logo" @click="$router.push('/')">
      <i class="fas fa-star"></i>
      <span>Cosmic Portal</span>
    </div>
    
    <nav class="main-nav">
      <router-link to="/" class="nav-link" active-class="active">
        <i class="fas fa-map"></i> {{ $t('nav.starMap') }}
      </router-link>
      <router-link to="/gallery" class="nav-link" active-class="active">
        <i class="fas fa-images"></i> {{ $t('nav.gallery') }}
      </router-link>
      <router-link to="/articles" class="nav-link" active-class="active">
        <i class="fas fa-book-open"></i> {{ $t('nav.articles') }}
      </router-link>
    </nav>
    
    <div class="header-controls">
      <div class="language-switcher">
        <button 
          @click="changeLanguage('ru')" 
          :class="{ active: currentLang === 'ru' }"
          title="Русский"
        >
          🇷🇺 RU
        </button>
        <button 
          @click="changeLanguage('en')" 
          :class="{ active: currentLang === 'en' }"
          title="English"
        >
          🇺🇸 EN
        </button>
      </div>
      
      <div class="theme-toggle" @click="toggleTheme">
        <i class="fas" :class="themeIcon"></i>
      </div>
    </div>
  </header>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'

export default {
  name: 'Header',
  setup() {
    const { locale } = useI18n()
    const currentLang = ref(locale.value)
    const darkTheme = ref(true)
    
    const changeLanguage = (lang) => {
      locale.value = lang
      currentLang.value = lang
      localStorage.setItem('cosmic-lang', lang)
    }
    
    const toggleTheme = () => {
      darkTheme.value = !darkTheme.value
      document.body.classList.toggle('light-theme', !darkTheme.value)
    }
    
    const themeIcon = computed(() => 
      darkTheme.value ? 'fa-moon' : 'fa-sun'
    )
    
    return { currentLang, changeLanguage, toggleTheme, themeIcon }
  }
}
</script>

<style scoped>
.cosmic-header {
  background: linear-gradient(90deg, #0a0a2a, #1a1a40);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(110, 231, 255, 0.3);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  font-weight: bold;
  color: #6ee7ff;
  cursor: pointer;
  transition: transform 0.3s, text-shadow 0.3s;
}

.logo:hover {
  transform: scale(1.05);
  text-shadow: 0 0 15px #6ee7ff;
}

.logo i {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #b0e6ff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link:hover {
  background: rgba(110, 231, 255, 0.1);
  color: #6ee7ff;
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(110, 231, 255, 0.2);
  color: #6ee7ff;
  box-shadow: 0 0 15px rgba(110, 231, 255, 0.3);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-switcher {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 3px;
}

.language-switcher button {
  background: transparent;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 17px;
  cursor: pointer;
  transition: all 0.3s;
}

.language-switcher button:hover {
  background: rgba(110, 231, 255, 0.2);
}

.language-switcher button.active {
  background: rgba(110, 231, 255, 0.4);
  box-shadow: 0 0 10px rgba(110, 231, 255, 0.3);
}

.theme-toggle {
  color: #ffd166;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.theme-toggle:hover {
  transform: scale(1.2);
}

/* Светлая тема */
.light-theme .cosmic-header {
  background: linear-gradient(90deg, #4cc9f0, #4361ee);
}

.light-theme .nav-link {
  color: #333;
}

.light-theme .nav-link:hover {
  color: #4361ee;
}
</style>
