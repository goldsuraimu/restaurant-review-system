<template>
  <div class="container search-bar">
    <div class="search-bar-outer">
      <div class="search-bar-inner">
        <div>
          <h4 class="mb-2">{{ searchTitle }}</h4>
          <div class="input-group">
            <input 
              type="text" 
              name="keyword" 
              class="form-control" 
              :placeholder="placeholder" 
              :aria-label="ariaLabel"
              v-model="modelValue" 
              aria-describedby="search-button" 
              @keyup.enter="handleInput" 
              />
            <div class="input-group-append">
              <button class="btn btn-major" id="search-button" @click="handleInput">
                <FontAwesomeIcon :icon="['fas', 'search']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string;
  searchTitle?: string;
  placeholder?: string;
  ariaLabel?: string;
}>(), {
  searchTitle: '搜尋:',
  placeholder: '請輸入關鍵字...',
  ariaLabel: '請輸入關鍵字...',
});
const emit = defineEmits(['update:modelValue'])

const modelValue = ref(props.modelValue);


function handleInput() {
  emit('update:modelValue', modelValue.value);
}


watch(() => props.modelValue, (val) => {
  modelValue.value = val;
})


</script>

<style scoped></style>