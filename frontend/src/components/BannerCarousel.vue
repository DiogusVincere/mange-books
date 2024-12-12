<template>
  <div class="carrossel-container">
    <div class="carrossel" :style="carouselStyle">
      <div class="carrossel-item" v-for="(item, index) in items" :key="index">
        <img :src="item.image" :alt="item.title" />
      </div>
    </div>

    <button class="prev" @click="moveToPrevious">←</button>
    <button class="next" @click="moveToNext">→</button>
  </div>
</template>

<script>
import banner1 from '@/assets/img/banner2.jfif';
import banner2 from '@/assets/img/banner2.jpg';
import banner3 from '@/assets/img/banner4.jfif';

export default {
  data() {
    return {
      items: [
        { title: "Item 1", image: banner1 },
        { title: "Item 2", image: banner2 },
        { title: "Item 3", image: banner3 },
      ],
      currentIndex: 0,
    };
  },
  computed: {
    carouselStyle() {
      return {
        transform: `translateX(-${this.currentIndex * 100}%)`,
        transition: 'transform 0.5s ease',
      };
    }
  },
  methods: {
    moveToNext() {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }
    },
    moveToPrevious() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        this.currentIndex = this.items.length - 1;
      }
    }
  }
};
</script>

<style scoped>
.carrossel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carrossel {
  display: flex;
  transition: transform 0.5s ease;
}

.carrossel-item {
  min-width: 100%;
  transition: opacity 0.5s ease;
}

.carrossel-item img {
  width: 100%;
  height: auto;
}

button {
  position: absolute;
  top: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 18px;
}

button.prev {
  left: 10px;
  transform: translateY(-50%);
}

button.next {
  right: 10px;
  transform: translateY(-50%);
}
</style>
