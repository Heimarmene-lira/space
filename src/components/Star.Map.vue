<template>
  <div class="star-map-page">
    <div class="page-header">
      <h1><i class="fas fa-star-and-crescent"></i> {{ $t('starMap.title') }}</h1>
      <p class="subtitle">{{ $t('starMap.subtitle') }}</p>
    </div>
    
    <div class="controls-panel">
      <div class="city-selector">
        <div class="input-group">
          <i class="fas fa-map-marker-alt"></i>
          <input 
            v-model="cityInput" 
            type="text" 
            :placeholder="$t('starMap.placeholder')"
            @keyup.enter="updateMap"
            class="city-input"
          >
          <button @click="updateMap" class="search-btn">
            <i class="fas fa-search"></i> {{ $t('starMap.search') }}
          </button>
        </div>
        
        <div class="preset-cities">
          <button 
            v-for="city in presetCities" 
            :key="city.name"
            @click="selectPresetCity(city)"
            class="city-btn"
          >
            {{ city.name }}
          </button>
        </div>
      </div>
      
      <div class="time-controls">
        <div class="time-display">
          <i class="fas fa-clock"></i>
          <span>{{ currentTime }}</span>
        </div>
        <div class="time-slider">
          <input 
            type="range" 
            min="0" 
            max="23" 
            v-model="selectedHour"
            class="time-slider-input"
            @input="updateTime"
          >
          <div class="time-labels">
            <span>18:00</span>
            <span>Полночь</span>
            <span>06:00</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="star-map-container">
      <div class="map-display" ref="starMap">
        <!-- Здесь будет отрисовка созвездий -->
        <div class="constellations-container">
          <div 
            v-for="constellation in visibleConstellations" 
            :key="constellation.id"
            class="constellation"
            :style="{
              left: constellation.x + '%',
              top: constellation.y + '%',
              transform: `scale(${constellation.scale})`
            }"
            @mouseenter="highlightConstellation(constellation)"
            @mouseleave="unhighlightConstellation"
          >
            <div class="constellation-stars">
              <div 
                v-for="star in constellation.stars" 
                :key="star.id"
                class="star"
                :style="{
                  left: star.x + 'px',
                  top: star.y + 'px',
                  width: star.size + 'px',
                  height: star.size + 'px'
                }"
              ></div>
            </div>
            <div class="constellation-name" v-if="constellation.highlighted">
              {{ constellation.name }}
            </div>
          </div>
        </div>
        
        <!-- Планеты и особые объекты -->
        <div class="celestial-objects">
          <div 
            v-for="object in celestialObjects" 
            :key="object.name"
            class="celestial-object"
            :style="{
              left: object.x + '%',
              top: object.y + '%',
              '--object-color': object.color
            }"
            :title="object.name"
          >
            <i :class="object.icon"></i>
          </div>
        </div>
        
        <!-- Горизонт и направление -->
        <div class="compass">
          <div class="compass-point">N</div>
          <div class="compass-point">E</div>
          <div class="compass-point">S</div>
          <div class="compass-point">W</div>
        </div>
      </div>
      
      <div class="map-sidebar">
        <div class="sidebar-section">
          <h3><i class="fas fa-info-circle"></i> {{ $t('starMap.info') }}</h3>
          <div class="info-box" v-if="currentCity">
            <p><strong>{{ $t('starMap.viewingFor') }}:</strong> {{ currentCity }}</p>
            <p><strong>{{ $t('starMap.time') }}:</strong> {{ currentTime }}</p>
            <p><strong>{{ $t('starMap.visibleConstellations') }}:</strong> {{ visibleConstellations.length }}</p>
          </div>
          <div class="info-box" v-else>
            <p>{{ $t('starMap.prompt') }}</p>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3><i class="fas fa-star"></i> {{ $t('starMap.highlighted') }}</h3>
          <div class="constellation-list">
            <div 
              v-for="constellation in visibleConstellations" 
              :key="constellation.id"
              class="constellation-item"
              @mouseenter="highlightConstellation(constellation)"
              @mouseleave="unhighlightConstellation"
              @click="focusConstellation(constellation)"
            >
              <div class="constellation-preview" :style="{backgroundColor: constellation.color}"></div>
              <span>{{ constellation.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3><i class="fas fa-moon"></i> {{ $t('starMap.moonPhase') }}</h3>
          <div class="moon-phase">
            <div class="moon-display" :class="moonPhaseClass"></div>
            <div class="moon-info">
              <p><strong>{{ moonPhaseName }}</strong></p>
              <p>{{ moonPhaseDescription }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="constellation-details" v-if="selectedConstellation">
      <button class="close-details" @click="selectedConstellation = null">
        <i class="fas fa-times"></i>
      </button>
      <h3>{{ selectedConstellation.name }}</h3>
      <p>{{ selectedConstellation.description }}</p>
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">{{ $t('starMap.bestViewing') }}:</span>
          <span>{{ selectedConstellation.bestViewing }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('starMap.brightestStar') }}:</span>
          <span>{{ selectedConstellation.brightestStar }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('starMap.area') }}:</span>
          <span>{{ selectedConstellation.area }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'StarMap',
  setup() {
    const cityInput = ref('')
    const currentCity = ref('Москва')
    const selectedHour = ref(new Date().getHours())
    const selectedConstellation = ref(null)
    const highlightedConstellation = ref(null)
    
    const presetCities = ref([
      { name: 'Москва', lat: 55.7558, lon: 37.6173 },
      { name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351 },
      { name: 'Новосибирск', lat: 55.0084, lon: 82.9357 },
      { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057 },
      { name: 'Казань', lat: 55.7961, lon: 49.1064 },
      { name: 'Сочи', lat: 43.5855, lon: 39.7231 },
      { name: 'Владивосток', lat: 43.1155, lon: 131.8855 }
    ])
    
    const constellationsData = ref([
      {
        id: 1,
        name: 'Большая Медведица',
        description: 'Одно из самых узнаваемых созвездий северного полушария.',
        x: 30, y: 20,
        scale: 1,
        color: '#4cc9f0',
        bestViewing: 'Круглый год',
        brightestStar: 'Алиот',
        area: '1280 квадратных градусов',
        stars: [
          { id: 1, x: 0, y: 0, size: 4 },
          { id: 2, x: 50, y: 30, size: 3 },
          { id: 3, x: 100, y: 10, size: 3 },
          { id: 4, x: 120, y: 50, size: 2 },
          { id: 5, x: 80, y: 80, size: 2 },
          { id: 6, x: 40, y: 100, size: 3 },
          { id: 7, x: 10, y: 70, size: 4 }
        ],
        visible: true
      },
      {
        id: 2,
        name: 'Орион',
        description: 'Яркое экваториальное созвездие с известной туманностью.',
        x: 60, y: 50,
        scale: 0.9,
        color: '#f72585',
        bestViewing: 'Зима',
        brightestStar: 'Ригель',
        area: '594 квадратных градуса',
        stars: [
          { id: 1, x: 0, y: 40, size: 5 },
          { id: 2, x: 40, y: 0, size: 4 },
          { id: 3, x: 40, y: 80, size: 4 },
          { id: 4, x: 80, y: 40, size: 3 },
          { id: 5, x: 60, y: 20, size: 2 },
          { id: 6, x: 60, y: 60, size: 2 }
        ],
        visible: true
      },
      {
        id: 3,
        name: 'Лебедь',
        description: 'Летнее созвездие в форме креста.',
        x: 70, y: 30,
        scale: 0.8,
        color: '#7209b7',
        bestViewing: 'Лето',
        brightestStar: 'Денеб',
        area: '804 квадратных градуса',
        stars: [
          { id: 1, x: 0, y: 50, size: 4 },
          { id: 2, x: 50, y: 0, size: 3 },
          { id: 3, x: 100, y: 50, size: 4 },
          { id: 4, x: 50, y: 100, size: 3 },
          { id: 5, x: 25, y: 25, size: 2 }
        ],
        visible: false
      },
      {
        id: 4,
        name: 'Кассиопея',
        description: 'Созвездие северного полушария в форме W.',
        x: 40, y: 40,
        scale: 0.7,
        color: '#3a86ff',
        bestViewing: 'Осень',
        brightestStar: 'Шедар',
        area: '598 квадратных градусов',
        stars: [
          { id: 1, x: 0, y: 0, size: 3 },
          { id: 2, x: 30, y: 30, size: 4 },
          { id: 3, x: 60, y: 0, size: 3 },
          { id: 4, x: 90, y: 30, size: 3 },
          { id: 5, x: 120, y: 0, size: 2 }
        ],
        visible: true
      }
    ])
    
    const celestialObjects = ref([
      { name: 'Марс', x: 25, y: 35, color: '#ff6b6b', icon: 'fas fa-globe-americas' },
      { name: 'Юпитер', x: 65, y: 25, color: '#ffd166', icon: 'fas fa-globe' },
      { name: 'Венера', x: 45, y: 60, color: '#f4a261', icon: 'fas fa-female' },
      { name: 'Луна', x: 55, y: 45, color: '#e9ecef', icon: 'fas fa-moon' },
      { name: 'МКС', x: 75, y: 65, color: '#00bbf9', icon: 'fas fa-satellite' }
    ])
    
    const currentTime = computed(() => {
      const now = new Date()
      now.setHours(selectedHour.value)
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    const visibleConstellations = computed(() => {
      return constellationsData.value.filter(c => c.visible)
    })
    
    const moonPhaseClass = computed(() => {
      const phases = ['new-moon', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 
                     'full-moon', 'waning-gibbous', 'last-quarter', 'waning-crescent']
      const phaseIndex = Math.floor(Math.random() * phases.length)
      return phases[phaseIndex]
    })
    
    const moonPhaseName = computed(() => {
      const phases = {
        'new-moon': 'Новолуние',
        'waxing-crescent': 'Растущий серп',
        'first-quarter': 'Первая четверть',
        'waxing-gibbous': 'Растущая луна',
        'full-moon': 'Полнолуние',
        'waning-gibbous': 'Убывающая луна',
        'last-quarter': 'Последняя четверть',
        'waning-crescent': 'Убывающий серп'
      }
      return phases[moonPhaseClass.value] || 'Новолуние'
    })
    
    const moonPhaseDescription = computed(() => {
      const descriptions = {
        'new-moon': 'Луна не видна на небе',
        'waxing-crescent': 'Луна видна вечером',
        'first-quarter': 'Видна половина лунного диска',
        'waxing-gibbous': 'Луна почти полная',
        'full-moon': 'Луна полностью освещена',
        'waning-gibbous': 'Начинает убывать',
        'last-quarter': 'Видна вторая половина диска',
        'waning-crescent': 'Луна видна утром'
      }
      return descriptions[moonPhaseClass.value] || ''
    })
    
    const updateMap = () => {
      if (cityInput.value.trim()) {
        currentCity.value = cityInput.value
        // В реальном приложении здесь был бы API запрос
        simulateConstellationVisibility()
      }
    }
    
    const selectPresetCity = (city) => {
      cityInput.value = city.name
      currentCity.value = city.name
      simulateConstellationVisibility()
    }
    
    const simulateConstellationVisibility = () => {
      // Симуляция изменения видимости созвездий в зависимости от города и времени
      constellationsData.value.forEach(constellation => {
        constellation.visible = Math.random() > 0.3
        constellation.scale = 0.7 + Math.random() * 0.6
      })
    }
    
    const highlightConstellation = (constellation) => {
      highlightedConstellation.value = constellation
      constellation.highlighted = true
    }
    
    const unhighlightConstellation = () => {
      if (highlightedConstellation.value) {
        highlightedConstellation.value.highlighted = false
        highlightedConstellation.value = null
      }
    }
    
    const focusConstellation = (constellation) => {
      selectedConstellation.value = constellation
    }
    
    const updateTime = () => {
      simulateConstellationVisibility()
    }
    
    // Анимация движения объектов
    let animationFrame
    const animateObjects = () => {
      celestialObjects.value.forEach(obj => {
        obj.x = (obj.x + 0.01) % 100
        obj.y = (obj.y + 0.005) % 100
      })
      animationFrame = requestAnimationFrame(animateObjects)
    }
    
    onMounted(() => {
      animateObjects()
      // Имитация загрузки данных
      setTimeout(simulateConstellationVisibility, 1000)
    })
    
    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    })
    
    return {
      cityInput,
      currentCity,
      selectedHour,
      selectedConstellation,
      highlightedConstellation,
      presetCities,
      constellationsData,
      celestialObjects,
      currentTime,
      visibleConstellations,
      moonPhaseClass,
      moonPhaseName,
      moonPhaseDescription,
      updateMap,
      selectPresetCity,
      highlightConstellation,
      unhighlightConstellation,
      focusConstellation,
      updateTime
    }
  }
}
</script>

<style scoped>
.star-map-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeInDown 0.8s ease-out;
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

.controls-panel {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(110, 231, 255, 0.2);
  animation: slideInUp 0.6s ease-out;
}

.city-selector {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.input-group i {
  color: #6ee7ff;
  font-size: 1.2rem;
}

.city-input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid rgba(110, 231, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s;
}

.city-input:focus {
  outline: none;
  border-color: #6ee7ff;
  box-shadow: 0 0 15px rgba(110, 231, 255, 0.3);
}

.search-btn {
  background: linear-gradient(45deg, #6ee7ff, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s, box-shadow 0.3s;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(110, 231, 255, 0.4);
}

.preset-cities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.city-btn {
  background: rgba(110, 231, 255, 0.1);
  color: #b0e6ff;
  border: 1px solid rgba(110, 231, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.city-btn:hover {
  background: rgba(110, 231, 255, 0.2);
  color: #6ee7ff;
  transform: translateY(-2px);
}

.time-controls {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #6ee7ff;
}

.time-slider-input {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: linear-gradient(to right, #000428, #004e92);
  border-radius: 3px;
  outline: none;
}

.time-slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #6ee7ff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(110, 231, 255, 0.8);
}

.time-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  color: #b0e6ff;
  font-size: 0.9rem;
}

.star-map-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-bottom: 30px;
}

.map-display {
  background: rgba(0, 4, 40, 0.8);
  border-radius: 15px;
  height: 600px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(110, 231, 255, 0.2);
  box-shadow: 0 0 30px rgba(0, 78, 146, 0.3);
}

.constellations-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.constellation {
  position: absolute;
  transition: all 0.5s;
  cursor: pointer;
}

.constellation:hover {
  z-index: 100;
  transform: scale(1.1) !important;
}

.constellation-stars {
  position: relative;
  width: 150px;
  height: 150px;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s infinite alternate;
  box-shadow: 0 0 10px white;
}

.constellation-name {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #6ee7ff;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 0.9rem;
  white-space: nowrap;
  border: 1px solid rgba(110, 231, 255, 0.3);
}

.celestial-objects {
  position: absolute;
  width: 100%;
  height: 100%;
}

.celestial-object {
  position: absolute;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--object-color);
  font-size: 1.5rem;
  animation: float 10s infinite ease-in-out;
  cursor: pointer;
}

.celestial-object:nth-child(2) { animation-delay: -2s; }
.celestial-object:nth-child(3) { animation-delay: -4s; }
.celestial-object:nth-child(4) { animation-delay: -6s; }
.celestial-object:nth-child(5) { animation-delay: -8s; }

.compass {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.compass-point {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #6ee7ff;
  border-radius: 50%;
  font-weight: bold;
  border: 1px solid rgba(110, 231, 255, 0.3);
}

.map-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(110, 231, 255, 0.2);
  backdrop-filter: blur(10px);
}

.sidebar-section h3 {
  color: #6ee7ff;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border-left: 3px solid #6ee7ff;
}

.info-box p {
  margin: 8px 0;
}

.constellation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.constellation-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.constellation-item:hover {
  background: rgba(110, 231, 255, 0.1);
  transform: translateX(5px);
}

.constellation-preview {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.moon-phase {
  display: flex;
  align-items: center;
  gap: 20px;
}

.moon-display {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #e9ecef, #adb5bd);
  box-shadow: inset -10px -10px 20px rgba(0, 0, 0, 0.3),
              inset 10px 10px 20px rgba(255, 255, 255, 0.3);
}

.new-moon { background: #495057; }
.waxing-crescent { 
  background: radial-gradient(circle at 30% 50%, #e9ecef 40%, #495057 41%);
}
.first-quarter {
  background: linear-gradient(to right, #495057 50%, #e9ecef 50%);
}
.waxing-gibbous {
  background: radial-gradient(circle at 70% 50%, #e9ecef 60%, #495057 61%);
}
.full-moon { background: #e9ecef; }
.waning-gibbous {
  background: radial-gradient(circle at 30% 50%, #495057 60%, #e9ecef 61%);
}
.last-quarter {
  background: linear-gradient(to right, #e9ecef 50%, #495057 50%);
}
.waning-crescent {
  background: radial-gradient(circle at 70% 50%, #495057 40%, #e9ecef 41%);
}

.constellation-details {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  background: rgba(10, 25, 47, 0.95);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(110, 231, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  z-index: 1000;
  animation: slideInRight 0.5s ease-out;
}

.close-details {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #6ee7ff;
  font-size: 1.2rem;
  cursor: pointer;
}

.constellation-details h3 {
  color: #6ee7ff;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.constellation-details p {
  color: #b0e6ff;
  margin-bottom: 20px;
  line-height: 1.6;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.detail-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
}

.detail-label {
  color: #6ee7ff;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

@media (max-width: 1024px) {
  .star-map-container {
    grid-template-columns: 1fr;
  }
  
  .constellation-details {
    width: 90%;
    right: 5%;
  }
}
</style>
