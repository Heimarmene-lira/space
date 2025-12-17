<template>
  <div class="articles-page">
    <div class="page-header">
      <h1><i class="fas fa-book-open"></i> {{ $t('articles.title') }}</h1>
      <p class="subtitle">{{ $t('articles.subtitle') }}</p>
    </div>
    
    <div class="articles-controls">
      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('articles.searchPlaceholder')"
            class="search-input"
          >
        </div>
        
        <div class="sort-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="date">{{ $t('articles.sortByDate') }}</option>
            <option value="title">{{ $t('articles.sortByTitle') }}</option>
            <option value="views">{{ $t('articles.sortByPopularity') }}</option>
          </select>
          
          <button 
            @click="toggleViewMode" 
            class="view-toggle"
            :title="$t('articles.toggleView')"
          >
            <i :class="viewMode === 'grid' ? 'fas fa-list' : 'fas fa-th-large'"></i>
          </button>
        </div>
      </div>
      
      <div class="categories">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="toggleCategory(category.id)"
          :class="{ active: selectedCategories.includes(category.id) }"
          class="category-btn"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
        </button>
      </div>
    </div>
    
    <div class="articles-container" :class="viewMode">
      <div 
        v-for="article in filteredArticles" 
        :key="article.id"
        class="article-card"
        :style="{ animationDelay: (article.id * 0.05) + 's' }"
      >
        <div class="article-image" @click="openArticle(article)">
          <img :src="article.image" :alt="article.title" class="article-img">
          <div class="article-category">
            <i :class="getCategoryIcon(article.category)"></i>
            {{ getCategoryName(article.category) }}
          </div>
          <div class="reading-time">
            <i class="fas fa-clock"></i> {{ article.readingTime }} {{ $t('articles.minRead') }}
          </div>
        </div>
        
        <div class="article-content">
          <h3 @click="openArticle(article)" class="article-title">{{ article.title }}</h3>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          
          <div class="article-meta">
            <div class="author-info">
              <img :src="article.author.avatar" :alt="article.author.name" class="author-avatar">
              <div>
                <span class="author-name">{{ article.author.name }}</span>
                <span class="article-date">{{ formatDate(article.date) }}</span>
              </div>
            </div>
            
            <div class="article-stats">
              <span class="stat">
                <i class="fas fa-eye"></i> {{ article.views }}
              </span>
              <span class="stat">
                <i class="fas fa-heart"></i> {{ article.likes }}
              </span>
              <span class="stat">
                <i class="fas fa-comment"></i> {{ article.comments }}
              </span>
            </div>
          </div>
          
          <div class="article-tags">
            <span 
              v-for="tag in article.tags" 
              :key="tag"
              class="tag"
              @click="searchByTag(tag)"
            >
              #{{ tag }}
            </span>
          </div>
          
          <button @click="openArticle(article)" class="read-more-btn">
            {{ $t('articles.readMore') }} <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно статьи -->
    <div class="article-modal-overlay" v-if="selectedArticle" @click="closeArticle">
      <div class="article-modal" @click.stop>
        <button class="modal-close" @click="closeArticle">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="modal-header">
          <img :src="selectedArticle.image" :alt="selectedArticle.title" class="modal-header-image">
          <div class="modal-title-section">
            <div class="modal-category">
              <i :class="getCategoryIcon(selectedArticle.category)"></i>
              {{ getCategoryName(selectedArticle.category) }}
            </div>
            <h1 class="modal-title">{{ selectedArticle.title }}</h1>
            <div class="modal-meta">
              <div class="modal-author">
                <img :src="selectedArticle.author.avatar" :alt="selectedArticle.author.name" class="modal-avatar">
                <div>
                  <div class="author-name">{{ selectedArticle.author.name }}</div>
                  <div class="article-date">{{ formatDate(selectedArticle.date) }}</div>
                </div>
              </div>
              <div class="modal-stats">
                <span><i class="fas fa-eye"></i> {{ selectedArticle.views }}</span>
                <span><i class="fas fa-heart"></i> {{ selectedArticle.likes }}</span>
                <span><i class="fas fa-clock"></i> {{ selectedArticle.readingTime }} min</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-content">
          <div class="article-body" v-html="selectedArticle.content"></div>
          
          <div class="article-tags-modal">
            <span 
              v-for="tag in selectedArticle.tags" 
              :key="tag"
              class="tag"
              @click="searchByTag(tag)"
            >
              #{{ tag }}
            </span>
          </div>
          
          <div class="article-actions">
            <button class="action-btn" @click="likeArticle(selectedArticle)">
              <i class="fas fa-heart" :class="{ liked: selectedArticle.liked }"></i>
              {{ $t('articles.like') }} ({{ selectedArticle.likes }})
            </button>
            <button class="action-btn" @click="shareArticle(selectedArticle)">
              <i class="fas fa-share-alt"></i> {{ $t('articles.share') }}
            </button>
            <button class="action-btn" @click="bookmarkArticle(selectedArticle)">
              <i class="fas fa-bookmark" :class="{ bookmarked: selectedArticle.bookmarked }"></i>
              {{ $t('articles.bookmark') }}
            </button>
          </div>
          
          <div class="comments-section" v-if="selectedArticle.comments > 0">
            <h3><i class="fas fa-comments"></i> {{ $t('articles.comments') }}</h3>
            <div class="comments-list">
              <div class="comment" v-for="comment in selectedArticle.commentList" :key="comment.id">
                <img :src="comment.avatar" :alt="comment.author" class="comment-avatar">
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-date">{{ comment.date }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="related-articles">
          <h3><i class="fas fa-link"></i> {{ $t('articles.related') }}</h3>
          <div class="related-grid">
            <div 
              v-for="related in relatedArticles" 
              :key="related.id"
              class="related-card"
              @click="openArticle(related)"
            >
              <img :src="related.image" :alt="related.title" class="related-image">
              <h4>{{ related.title }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="load-more" v-if="showLoadMore">
      <button @click="loadMoreArticles" class="load-more-btn">
        <i class="fas fa-spinner" :class="{ spinning: loading }"></i>
        {{ $t('articles.loadMore') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Articles',
  setup() {
    const searchQuery = ref('')
    const sortBy = ref('date')
    const viewMode = ref('grid')
    const selectedCategories = ref([])
    const selectedArticle = ref(null)
    const articles = ref([])
    const loading = ref(false)
    const showLoadMore = ref(true)
    
    const categories = ref([
      { id: 'astronomy', name: 'Астрономия', icon: 'fas fa-telescope' },
      { id: 'space-tech', name: 'Космические технологии', icon: 'fas fa-rocket' },
      { id: 'astrophysics', name: 'Астрофизика', icon: 'fas fa-atom' },
      { id: 'exploration', name: 'Исследование космоса', icon: 'fas fa-user-astronaut' },
      { id: 'history', name: 'История космонавтики', icon: 'fas fa-history' },
      { id: 'education', name: 'Образование', icon: 'fas fa-graduation-cap' }
    ])
    
    // Генерация тестовых статей
    const generateArticles = () => {
      const articleTitles = [
        'Тайны черных дыр: что мы знаем сегодня',
        'Миссия на Марс: новые открытия марсохода Perseverance',
        'Созвездия северного полушария: гид для начинающих',
        'Космический туризм: реальность ближайшего будущего',
        'Большой взрыв и происхождение Вселенной',
        'Солнечные бури и их влияние на Землю',
        'Международная космическая станция: жизнь на орбите',
        'Экзопланеты: поиск жизни за пределами Солнечной системы',
        'Телескоп Джеймса Уэбба: новые горизонты астрономии',
        'Астероидная опасность: как защитить Землю',
        'Темная материя: самая большая загадка космоса',
        'Колонизация Луны: планы и перспективы'
      ]
      
      const articleExcerpts = [
        'Исследование природы черных дыр и последние научные открытия в этой области.',
        'Подробный отчет о миссии NASA на красную планету и важных находках.',
        'Подробный гид по самым известным созвездиям, которые можно увидеть невооруженным глазом.',
        'Как развивается космический туризм и когда обычные люди смогут отправиться в космос.',
        'Современные теории о происхождении Вселенной и доказательства Большого взрыва.',
        'Как солнечная активность влияет на технологии и жизнь на Земле.',
        'Как живут и работают космонавты на МКС в условиях невесомости.',
        'Методы поиска и изучения планет у других звезд и признаки возможной жизни.',
        'Как новый космический телескоп революционизирует наше понимание Вселенной.',
        'Методы обнаружения и отклонения астероидов, угрожающих нашей планете.',
        'Что мы знаем о темной материи и почему она так важна для понимания космоса.',
        'Планы различных стран по созданию постоянных баз на Луне и технические вызовы.'
      ]
      
      const articleCategories = ['astrophysics', 'exploration', 'astronomy', 'space-tech', 
                               'astrophysics', 'astronomy', 'exploration', 'astrophysics',
                               'space-tech', 'astronomy', 'astrophysics', 'exploration']
      
      const articleImages = [
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3'
      ]
      
      const authors = [
        { name: 'Алексей Косминов', avatar: 'https://i.pravatar.cc/150?img=1' },
        { name: 'Мария Звездная', avatar: 'https://i.pravatar.cc/150?img=5' },
        { name: 'Дмитрий Галактиков', avatar: 'https://i.pravatar.cc/150?img=8' },
        { name: 'Елена Орбитова', avatar: 'https://i.pravatar.cc/150?img=11' },
        { name: 'Сергей Астрономов', avatar: 'https://i.pravatar.cc/150?img=12' },
        { name: 'Анна Небулина', avatar: 'https://i.pravatar.cc/150?img=15' }
      ]
      
      const articleContent = `<p>Это пример содержания статьи. В реальном приложении здесь был бы полноценный текст с изображениями, цитатами и другими элементами форматирования.</p>
        <h2>Заголовок раздела</h2>
        <p>Текст раздела с подробным описанием темы. Космос полон загадок, и каждая новая миссия приносит нам больше вопросов, чем ответов.</p>
        <blockquote>Важная цитата или интересный факт по теме статьи.</blockquote>
        <p>Продолжение статьи с дополнительной информацией и деталями исследования.</p>`
      
      const commentList = [
        { id: 1, author: 'Иван Смирнов', date: '2 дня назад', text: 'Отличная статья! Очень познавательно.', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: 2, author: 'Ольга Петрова', date: 'неделю назад', text: 'Спасибо за подробное объяснение сложной темы!', avatar: 'https://i.pravatar.cc/150?img=6' }
      ]
      
      return Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: articleTitles[i],
        excerpt: articleExcerpts[i],
        content: articleContent,
        image: `${articleImages[i]}&auto=format&fit=crop&w=800&q=80`,
        category: articleCategories[i],
        date: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        readingTime: Math.floor(Math.random() * 10) + 5,
        author: authors[Math.floor(Math.random() * authors.length)],
        views: Math.floor(Math.random() * 10000) + 1000,
        likes: Math.floor(Math.random() * 500) + 100,
        comments: Math.floor(Math.random() * 50) + 5,
        commentList: commentList,
        liked: Math.random() > 0.7,
        bookmarked: Math.random() > 0.8,
        tags: ['космос', 'наука', 'исследования', 'технологии'].slice(0, Math.floor(Math.random() * 3) + 1)
      }))
    }
    
    const filteredArticles = computed(() => {
      let filtered = [...articles.value]
      
      // Фильтрация по категориям
      if (selectedCategories.value.length > 0) {
        filtered = filtered.filter(article => 
          selectedCategories.value.includes(article.category)
        )
      }
      
      // Поиск по запросу
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // Сортировка
      filtered.sort((a, b) => {
        if (sortBy.value === 'date') {
          return new Date(b.date) - new Date(a.date)
        } else if (sortBy.value === 'title') {
          return a.title.localeCompare(b.title)
        } else if (sortBy.value === 'views') {
          return b.views - a.views
        }
        return 0
      })
      
      return filtered
    })
    
    const relatedArticles = computed(() => {
      if (!selectedArticle.value) return []
      return articles.value
        .filter(a => a.id !== selectedArticle.value.id && a.category === selectedArticle.value.category)
        .slice(0, 3)
    })
    
    const getCategoryIcon = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      return category ? category.icon : 'fas fa-file-alt'
    }
    
    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      return category ? category.name : 'Другое'
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    
    const toggleCategory = (categoryId) => {
      const index = selectedCategories.value.indexOf(categoryId)
      if (index > -1) {
        selectedCategories.value.splice(index, 1)
      } else {
        selectedCategories.value.push(categoryId)
      }
    }
    
    const toggleViewMode = () => {
      viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
    }
    
    const openArticle = (article) => {
      selectedArticle.value = { ...article }
      // Увеличиваем счетчик просмотров
      selectedArticle.value.views++
      document.body.style.overflow = 'hidden'
    }
    
    const closeArticle = () => {
      selectedArticle.value = null
      document.body.style.overflow = 'auto'
    }
    
    const likeArticle = (article) => {
      article.liked = !article.liked
      article.likes += article.liked ? 1 : -1
    }
    
    const bookmarkArticle = (article) => {
      article.bookmarked = !article.bookmarked
    }
    
    const shareArticle = (article) => {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        })
      } else {
        alert(`Поделиться статьей: ${article.title}`)
      }
    }
    
    const searchByTag = (tag) => {
      searchQuery.value = tag
    }
    
    const loadMoreArticles = () => {
      loading.value = true
      // Имитация загрузки
      setTimeout(() => {
        const newArticles = generateArticles()
        articles.value = [...articles.value, ...newArticles.map(article => ({
          ...article,
          id: articles.value.length + article.id
        }))]
        loading.value = false
        showLoadMore.value = articles.value.length < 50
      }, 1000)
    }
    
    onMounted(() => {
      articles.value = generateArticles()
    })
    
    return {
      searchQuery,
      sortBy,
      viewMode,
      selectedCategories,
      selectedArticle,
      articles,
      loading,
      showLoadMore,
      categories,
      filteredArticles,
      relatedArticles,
      getCategoryIcon,
      getCategoryName,
      formatDate,
      toggleCategory,
      toggleViewMode,
      openArticle,
      closeArticle,
      likeArticle,
      bookmarkArticle,
      shareArticle,
      searchByTag,
      loadMoreArticles
    }
  }
}
</script>

<style scoped>
.articles-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease-out;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #6ee7ff;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(110, 231, 255, 0.5);
}

.subtitle {
  color: #b0e6ff;
  font-size: 1.1rem;
  opacity: 0.9;
}

.articles-controls {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid rgba(110, 231, 255, 0.2);
  backdrop-filter: blur(10px);
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(110, 231, 255, 0.3);
  border-radius: 25px;
  padding: 10px 20px;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  color: #6ee7ff;
  margin-right: 10px;
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  width: 100%;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(110, 231, 255, 0.3);
  padding: 10px 15px;
  border-radius: 25px;
  cursor: pointer;
}

.view-toggle {
  background: rgba(0, 0, 0, 0.3);
  color: #6ee7ff;
  border: 1px solid rgba(110, 231, 255, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.view-toggle:hover {
  background: rgba(110, 231, 255, 0.1);
  transform: scale(1.1);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: #b0e6ff;
  border: 1px solid rgba(110, 231, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  background: rgba(110, 231, 255, 0.1);
  transform: translateY(-2px);
}

.category-btn.active {
  background: linear-gradient(45deg, #6ee7ff, #3b82f6);
  color: white;
  box-shadow: 0 5px 15px rgba(110, 231, 255, 0.3);
}

.articles-container {
  margin-bottom: 40px;
}

.articles-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.articles-container.list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.articles-container.list .article-card {
  display: flex;
  height: 200px;
}

.articles-container.list .article-image {
  flex: 0 0 300px;
  height: 100%;
}

.articles-container.list .article-content {
  flex: 1;
}

.article-card {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(110, 231, 255, 0.2);
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(110, 231, 255, 0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.article-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.article-card:hover .article-img {
  transform: scale(1.1);
}

.article-category {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: #6ee7ff;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(5px);
}

.reading-time {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: #b0e6ff;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  backdrop-filter: blur(5px);
}

.article-content {
  padding: 20px;
}

.article-title {
  color: #6ee7ff;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.3s;
}

.article-title:hover {
  color: #3b82f6;
}

.article-excerpt {
  color: #b0e6ff;
  margin-bottom: 15px;
  line-height: 1.6;
  opacity: 0.9;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(110, 231, 255, 0.1);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(110, 231, 255, 0.3);
}

.author-name {
  color: #6ee7ff;
  font-weight: bold;
  display: block;
}

.article-date {
  color: #b0e6ff;
  font-size: 0.9rem;
  opacity: 0.7;
}

.article-stats {
  display: flex;
  gap: 15px;
}

.stat {
  color: #b0e6ff;
  font-size: 0.9rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 5px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: rgba(110, 231, 255, 0.1);
  color: #6ee7ff;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.tag:hover {
  background: rgba(110, 231, 255, 0.2);
  transform: translateY(-2px);
}

.read-more-btn {
  background: linear-gradient(45deg, #6ee7ff, #3b82f6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.read-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(110, 231, 255, 0.4);
}

.article-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.article-modal {
  background: rgba(10, 25, 47, 0.98);
  border-radius: 20px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  border: 1px solid rgba(110, 231, 255, 0.3);
  backdrop-filter: blur(20px);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #6ee7ff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 2001;
}

.modal-header {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.modal-header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-title-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 4, 40, 0.95), transparent);
  padding: 40px;
}

.modal-category {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(110, 231, 255, 0.2);
  color: #6ee7ff;
  padding: 8px 20px;
  border-radius: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
}

.modal-title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.modal-author {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(110, 231, 255, 0.3);
}

.modal-stats {
  display: flex;
  gap: 20px;
  color: #b0e6ff;
}

.modal-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-content {
  padding: 40px;
}

.article-body {
  color: #b0e6ff;
  line-height: 1.8;
  margin-bottom: 30px;
}

.article-body h2 {
  color: #6ee7ff;
  margin: 30px 0 15px;
  font-size: 1.8rem;
}

.article-body p {
  margin-bottom: 15px;
}

.article-body blockquote {
  border-left: 4px solid #6ee7ff;
  padding-left: 20px;
  margin: 20px 0;
  font-style: italic;
  color: #b0e6ff;
  opacity: 0.9;
}

.article-tags-modal {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
}

.article-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: #b0e6ff;
  border: 1px solid rgba(110, 231, 255, 0.3);
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-actions .action-btn:hover {
  background: rgba(110, 231, 255, 0.1);
  transform: translateY(-2px);
}

.article-actions .action-btn .liked {
  color: #ff6b6b;
}

.article-actions .action-btn .bookmarked {
  color: #ffd166;
}

.comments-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 40px;
}

.comments-section h3 {
  color: #6ee7ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.comment-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(110, 231, 255, 0.3);
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  color: #6ee7ff;
  font-weight: bold;
}

.comment-date {
  color: #b0e6ff;
  font-size: 0.9rem;
  opacity: 0.7;
}

.comment-text {
  color: #b0e6ff;
  line-height: 1.6;
}

.related-articles {
  background: rgba(0, 0, 0, 0.2);
  padding: 30px;
  border-radius: 15px;
}

.related-articles h3 {
  color: #6ee7ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.related-card {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.related-card:hover {
  transform: translateY(-5px);
}

.related-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.related-card h4 {
  color: #6ee7ff;
  padding: 15px;
  margin: 0;
  font-size: 1rem;
}

.load-more {
  text-align: center;
  margin-top: 40px;
}

.load-more-btn {
  background: linear-gradient(45deg, #6ee7ff, #3b82f6);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
}

.load-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(110, 231, 255, 0.4);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .articles-container.grid {
    grid-template-columns: 1fr;
  }
  
  .articles-container.list .article-card {
    flex-direction: column;
    height: auto;
  }
  
  .articles-container.list .article-image {
    flex: none;
    height: 200px;
  }
  
  .modal-title {
    font-size: 1.8rem;
  }
  
  .modal-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
