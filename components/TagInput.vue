<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="isAI" class="ml-1 text-xs text-purple-600">✨ AI Enhanced</span>
    </label>

    <!-- Tag list -->
    <div class="flex flex-wrap gap-2.5 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[60px]">
      <!-- Existing tags -->
      <TransitionGroup name="tag" tag="div" class="contents">
        <div
          v-for="(tag, index) in modelValue"
          :key="`tag-${index}-${tag}`"
          @click="selectTag(index)"
          :class="[
            'group inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer',
            selectedTags.includes(index) 
              ? 'ring-2 ring-citebots-orange' 
              : '',
            tagSource[index] === 'ai'
              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800'
              : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
          ]"
        >
          <span v-if="tagSource[index] === 'ai'" class="mr-1.5 text-xs">✨</span>
          <span 
            v-if="!editing[index]"
            @dblclick.stop="startEdit(index)"
            :title="doubleClickToEdit ? 'Double-click to edit' : null"
          >
            {{ tag }}
          </span>
          <input
            v-else
            v-model="editValues[index]"
            @blur="finishEdit(index)"
            @keyup.enter.prevent="finishEdit(index)"
            @keyup.escape="cancelEdit(index)"
            class="bg-transparent border-none outline-none"
            :style="{ width: `${tag.length * 8 + 20}px` }"
            type="text"
            @click.stop
          />
          <button
            @click.stop="removeTag(index)"
            class="ml-1.5 -mr-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            :title="`Remove ${tag}`"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </TransitionGroup>
      
      <!-- Add new tag input -->
      <div class="relative inline-flex items-center">
        <div class="relative">
          <input
            v-model="newTag"
            @keydown.enter.prevent="addTag"
            @keydown.delete="handleBackspace"
            @keydown.backspace="handleBackspace"
            @focus="inputFocused = true"
            @blur="handleBlur"
            :placeholder="placeholder || 'Add new...'"
            class="px-3 py-1.5 pr-8 border border-gray-300 dark:border-gray-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-citebots-orange focus:border-citebots-orange bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            type="text"
            ref="inputRef"
          />
          <div class="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            <button
              v-if="newTag.trim()"
              @click="addTag"
              type="button"
              class="p-1 rounded-full text-citebots-orange hover:bg-citebots-orange hover:text-white transition-colors"
              title="Add tag (or press Enter)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <transition name="hint">
          <span
            v-if="inputFocused && !newTag"
            class="absolute left-3 top-full mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            Press Enter to add
          </span>
        </transition>
      </div>
    </div>
    
    <!-- Helper text -->
    <div v-if="showHelperText" class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
      <span>Click to select • Double-click to edit • Delete or Backspace to remove</span>
      <span v-if="tagSource.some(s => s === 'ai')" class="text-purple-600">
        ✨ AI-suggested tags
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: String,
  placeholder: String,
  isAI: Boolean,
  source: {
    type: Array,
    default: () => []
  },
  doubleClickToEdit: {
    type: Boolean,
    default: true
  },
  showHelperText: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'update:source'])

const newTag = ref('')
const editing = ref({})
const editValues = ref({})
const selectedTags = ref([])
const inputFocused = ref(false)
const inputRef = ref(null)

// Track the source of each tag
const tagSource = computed(() => {
  return props.modelValue.map((_, index) => props.source[index] || 'manual')
})

const addTag = () => {
  const trimmedTag = newTag.value.trim()
  if (trimmedTag && !props.modelValue.includes(trimmedTag)) {
    const updatedTags = [...props.modelValue, trimmedTag]
    const updatedSource = [...props.source, 'manual']
    emit('update:modelValue', updatedTags)
    emit('update:source', updatedSource)
    newTag.value = ''
  } else if (props.modelValue.includes(trimmedTag)) {
    // Flash or highlight the existing tag
    const existingIndex = props.modelValue.indexOf(trimmedTag)
    selectedTags.value = [existingIndex]
    setTimeout(() => {
      selectedTags.value = []
    }, 1000)
  }
}

const removeTag = (index) => {
  const updatedTags = props.modelValue.filter((_, i) => i !== index)
  const updatedSource = props.source.filter((_, i) => i !== index)
  emit('update:modelValue', updatedTags)
  emit('update:source', updatedSource)
  
  // Remove from selected tags
  selectedTags.value = selectedTags.value.filter(i => i !== index)
}

const selectTag = (index) => {
  if (selectedTags.value.includes(index)) {
    selectedTags.value = selectedTags.value.filter(i => i !== index)
  } else {
    selectedTags.value = [...selectedTags.value, index]
  }
}

const startEdit = (index) => {
  if (props.doubleClickToEdit) {
    editing.value[index] = true
    editValues.value[index] = props.modelValue[index]
    nextTick(() => {
      // Focus the input when editing starts
      const input = document.querySelector(`input[value="${editValues.value[index]}"]`)
      if (input) input.focus()
    })
  }
}

const finishEdit = (index) => {
  const trimmedValue = editValues.value[index]?.trim()
  if (trimmedValue && trimmedValue !== props.modelValue[index]) {
    // Check for duplicates
    if (!props.modelValue.includes(trimmedValue) || props.modelValue[index] === trimmedValue) {
      const updatedTags = [...props.modelValue]
      updatedTags[index] = trimmedValue
      emit('update:modelValue', updatedTags)
    }
  }
  editing.value[index] = false
}

const cancelEdit = (index) => {
  editing.value[index] = false
  editValues.value[index] = props.modelValue[index]
}

const handleBackspace = (event) => {
  if (!newTag.value && selectedTags.value.length > 0) {
    event.preventDefault()
    // Remove all selected tags
    const tagsToRemove = [...selectedTags.value].sort((a, b) => b - a)
    tagsToRemove.forEach(index => removeTag(index))
    selectedTags.value = []
  } else if (!newTag.value && props.modelValue.length > 0) {
    // Select the last tag if nothing is selected
    selectedTags.value = [props.modelValue.length - 1]
  }
}

const handleBlur = () => {
  setTimeout(() => {
    inputFocused.value = false
    // Optionally add the tag on blur
    if (newTag.value.trim()) {
      addTag()
    }
  }, 200)
}

// Keyboard navigation
const handleKeyboard = (event) => {
  if (event.key === 'Delete' && selectedTags.value.length > 0) {
    event.preventDefault()
    const tagsToRemove = [...selectedTags.value].sort((a, b) => b - a)
    tagsToRemove.forEach(index => removeTag(index))
    selectedTags.value = []
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.tag-enter-active,
.tag-leave-active {
  transition: all 0.3s ease;
}

.tag-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.tag-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.2s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
}
</style>