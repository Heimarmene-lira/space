import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import ru from './locales/ru.json'
import en from './locales/en.json'

const i18n = createI18n({
    locale: localStorage.getItem('cosmic-lang') || 'ru',
    fallbackLocale: 'en',
    messages: { ru, en }
})

// Глобальные звездные анимации
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelector('.stars');
    if (stars) {
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.background = 'white';
            star.style.borderRadius = '50%';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.opacity = Math.random() * 0.7 + 0.3;
            star.style.animation = `pulse ${Math.random() * 3 + 2}s infinite alternate`;
            stars.appendChild(star);
        }
    }
});

// Добавляем стили для пульсации звезд
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
    0% { opacity: 0.3; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.2); }
}
`;
document.head.appendChild(style);

createApp(App).use(router).use(i18n).mount('#app')
