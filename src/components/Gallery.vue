<template>
  <div class="gallery-page">
    <div class="page-header">
      <h1><i class="fas fa-camera"></i> {{ $t('gallery.title') }}</h1>
      <p class="subtitle">{{ $t('gallery.subtitle') }}</p>
    </div>
    
    <div class="gallery-filters">
      <div class="filter-group">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="setActiveCategory(category.id)"
          :class="{ active: activeCategory === category.id }"
          class="filter-btn"
        >
          <i :class="category.icon"></i> {{ category.name }}
        </button>
      </div>
      
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="$t('gallery.searchPlaceholder')"
          class="search-input"
        >
      </div>
    </div>
    
    <div class="gallery-grid">
      <div 
        v-for="image in filteredImages" 
        :key="image.id"
        class="gallery-item"
        @click="openModal(image)"
        :style="{ animationDelay: (image.id * 0.1) + 's' }"
      >
        <div class="image-container">
          <img :src="image.url" :alt="image.title" class="gallery-image">
          <div class="image-overlay">
            <h3>{{ image.title }}</h3>
            <p>{{ image.description }}</p>
            <div class="image-meta">
              <span><i class="fas fa-calendar"></i> {{ image.date }}</span>
              <span><i class="fas fa-tag"></i> {{ image.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для просмотра изображения -->
    <div class="modal-overlay" v-if="selectedImage" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedImage.url" :alt="selectedImage.title" class="modal-image">
        <div class="modal-info">
          <h2>{{ selectedImage.title }}</h2>
          <p>{{ selectedImage.fullDescription }}</p>
          <div class="modal-meta">
            <div class="meta-item">
              <i class="fas fa-camera"></i>
              <span>{{ selectedImage.source }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ selectedImage.date }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ selectedImage.location }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="action-btn" @click="downloadImage(selectedImage)">
              <i class="fas fa-download"></i> {{ $t('gallery.download') }}
            </button>
            <button class="action-btn" @click="shareImage(selectedImage)">
              <i class="fas fa-share-alt"></i> {{ $t('gallery.share') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="load-more" v-if="showLoadMore">
      <button @click="loadMoreImages" class="load-more-btn">
        <i class="fas fa-spinner" :class="{ spinning: loading }"></i>
        {{ $t('gallery.loadMore') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Gallery',
  setup() {
    const activeCategory = ref('all')
    const searchQuery = ref('')
    const selectedImage = ref(null)
    const images = ref([])
    const loading = ref(false)
    const showLoadMore = ref(true)
    
    const categories = ref([
      { id: 'all', name: 'Все', icon: 'fas fa-globe' },
      { id: 'planets', name: 'Планеты', icon: 'fas fa-globe-americas' },
      { id: 'nebulas', name: 'Туманности', icon: 'fas fa-cloud' },
      { id: 'galaxies', name: 'Галактики', icon: 'fas fa-star' },
      { id: 'telescope', name: 'Телескоп', icon: 'fas fa-satellite' },
      { id: 'earth', name: 'Земля из космоса', icon: 'fas fa-earth-americas' }
    ])
    
    // Генерация тестовых изображений
    const generateImages = () => {
      const imageTitles = [
        'Туманность Ориона', 'Галактика Андромеды', 'Кольца Сатурна',
        'Поверхность Марса', 'Кратер на Луне', 'Северное сияние',
        'Млечный путь', 'Солнечное затмение', 'Международная космическая станция',
        'Великая красная пятно Юпитера', 'Галактика Сомбреро', 'Туманность Кошачий глаз'
      ]
      
      const imageDescriptions = [
        'Одна из самых ярких туманностей на ночном небе',
        'Ближайшая к Млечному пути крупная галактика',
        'Уникальная система колец газового гиганта',
        'Пейзаж красной планеты, снятый марсоходом',
        'Кратер Тихо, видимый с Земли в полнолуние',
        'Полярное сияние над северным полушарием',
        'Ядро нашей галактики в инфракрасном диапазоне',
        'Полное солнечное затмение 2017 года',
        'МКС на фоне земного горизонта',
        'Гигантский шторм, бушующий сотни лет',
        'Спиральная галактика в созвездии Девы',
        'Планетарная туманность в созвездии Дракона'
      ]
      
      const imageCategories = ['planets', 'nebulas', 'galaxies', 'planets', 'planets', 'earth',
                              'galaxies', 'earth', 'telescope', 'planets', 'galaxies', 'nebulas']
      
      // Используем реальные URL изображений NASA
      const imageUrls = [
        'https://apod.nasa.gov/apod/image/2301/OrionNebula_McDonald_960.jpg',
        'https://apod.nasa.gov/apod/image/2301/M31_Selby_960.jpg',
        'https://apod.nasa.gov/apod/image/2212/Saturn_Roques_960.jpg',
        'https://apod.nasa.gov/apod/image/2211/MarsPerseverance_NASA_960.jpg',
        'https://apod.nasa.gov/apod/image/2210/MoonCraters_Bartels_960.jpg',
        'https://apod.nasa.gov/apod/image/2212/AuroraSkags_Westphal_960.jpg',
        'https://apod.nasa.gov/apod/image/2211/MilkyWayCenter_NASA_960.jpg',
        'https://apod.nasa.gov/apod/image/2106/EclipseSequence_Zang_960.jpg',
        'https://apod.nasa.gov/apod/image/2211/ISS_Ullmann_960.jpg',
        'https://apod.nasa.gov/apod/image/2210/JupiterSpot_NASA_960.jpg',
        'https://apod.nasa.gov/apod/image/2205/SombreroGalaxy_Hubble_960.jpg',
        'https://apod.nasa.gov/apod/image/2204/CatsEye_Hubble_960.jpg'
      ]
      
      return Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: imageTitles[i],
        description: imageDescriptions[i],
        fullDescription: `Подробное описание ${imageTitles[i]}. Это удивительное космическое явление было запечатлено с помощью современных телескопов и спутников.`,
        url: imageUrls[i],
        category: imageCategories[i],
        date: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        source: 'NASA Astronomy Picture of the Day',
        location: i % 3 === 0 ? 'Хаббл' : i % 3 === 1 ? 'МКС' : 'Наземный телескоп'
      }))
    }
    
    const filteredImages = computed(() => {
      let filtered = images.value
      
      if (activeCategory.value !== 'all') {
        filtered = filtered.filter(img => img.category === activeCategory.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(img => 
          img.title.toLowerCase().includes(query) ||
          img.description.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })
    
    const setActiveCategory = (category) => {
      activeCategory.value = category
    }
    
    const openModal = (image) => {
      selectedImage.value = image
      document.body.style.overflow = 'hidden'
    }
    
    const closeModal = () => {
      selectedImage.value = null
      document.body.style.overflow = 'auto'
    }
    
    const downloadImage = (image) => {
      // В реальном приложении здесь была бы логика скачивания
      alert(`Скачивание: ${image.title}`)
    }
    
    const shareImage = (image) => {
      if (navigator.share) {
        navigator.share({
          title: image.title,
          text: image.description,
          url: image.url
        })
      } else {
        alert('Поделиться изображением: ' + image.title)
      }
    }
    
    const loadMoreImages = () => {
      loading.value = true
      // Имитация загрузки
      setTimeout(() => {
        const newImages = generateImages()
        images.value = [...images.value, ...newImages.map(img => ({
          ...img,
          id: images.value.length + img.id
        }))]
        loading.value = false
        showLoadMore.value = images.value.length < 50
      }, 1000)
    }
    
    onMounted(() => {
      images.value = generateImages()
    })
    
    return {
      activeCategory,
      searchQuery,
      selectedImage,
      images,
      loading,
      showLoadMore,
      categories,
      filteredImages,
      setActiveCategory,
      openModal,
      closeModal,
      downloadImage,
      shareImage,
      loadMoreImages
    }
  }
}
</script>

<style scoped>
.gallery-page {
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

.gallery-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  background: rgba(10, 25, 47, 0.7);
  padding: 20px;
  border-radius: 15px;
  border: 1px solid rgba(110, 231, 255, 0.2);
  backdrop-filter: blur(10px);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
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

.filter-btn:hover {
  background: rgba(110, 231, 255, 0.1);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(45deg, #6ee7ff, #3b82f6);
  color: white;
  box-shadow: 0 5px 15px rgba(110, 231, 255, 0.3);
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(110, 231, 255, 0.3);
  border-radius: 25px;
  padding: 10px 20px;
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.gallery-item {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  cursor: pointer;
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

.image-container {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  height: 300px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.5s, box-shadow 0.5s;
}

.image-container:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(110, 231, 255, 0.2);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.image-container:hover .gallery-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 4, 40, 0.9), transparent);
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.5s;
}

.image-container:hover .image-overlay {
  transform: translateY(0);
}

.image-overlay h3 {
  color: #6ee7ff;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.image-overlay p {
  color: #b0e6ff;
  font-size: 0.9rem;
  margin-bottom: 15px;
  opacity: 0.9;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  color: #b0e6ff;
  font-size: 0.8rem;
  opacity: 0.7;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: rgba(10, 25, 47, 0.95);
  border-radius: 20px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  display: flex;
  flex-direction: column;
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

.modal-image {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 20px 20px 0 0;
}

.modal-info {
  padding: 30px;
}

.modal-info h2 {
  color: #6ee7ff;
  margin-bottom: 15px;
  font-size: 2rem;
}

.modal-info p {
  color: #b0e6ff;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.modal-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #b0e6ff;
}

.meta-item i {
  color: #6ee7ff;
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(45deg, #6ee7ff, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s, box-shadow 0.3s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(110, 231, 255, 0.4);
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
  .gallery-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .modal-content {
    max-width: 95%;
    max-height: 95%;
  }
}
</style>
