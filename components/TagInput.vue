<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="isAI" class="ml-1 text-xs text-purple-600">✨ AI</span>
    </label>
    
    <div class="flex flex-wrap gap-2">
      <!-- Existing tags -->
      <div
        v-for="(tag, index) in modelValue"
        :key="index"
        :class="[
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          tagSource[index] === 'ai' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-800 border border-gray-300'
        ]"
      >
        <span v-if="tagSource[index] === 'ai'" class="mr-1">✨</span>
        <span
          v-if="!editing[index]"
          @click="startEdit(index)"
          class="cursor-pointer"
        >{{ tag }}</span>
        <input
          v-else
          v-model="editValues[index]"
          @blur="finishEdit(index)"
          @keyup.enter="finishEdit(index)"
          @keyup.escape="cancelEdit(index)"
          class="bg-transparent border-none outline-none w-20"
          type="text"
        />
        <button
          @click="removeTag(index)"
          class="ml-2 text-gray-500 hover:text-gray-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Add new tag input -->
      <input
        v-model="newTag"
        @keyup.enter="addTag"
        @blur="addTag"
        :placeholder="placeholder || 'Add new...'"
        class="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue', 'update:source'])

const newTag = ref('')
const editing = ref({})
const editValues = ref({})

// Track the source of each tag
const tagSource = computed(() => {
  return props.modelValue.map((_, index) => props.source[index] || 'manual')
})

const addTag = () => {
  if (newTag.value.trim()) {
    const updatedTags = [...props.modelValue, newTag.value.trim()]
    const updatedSource = [...props.source, 'manual']
    emit('update:modelValue', updatedTags)
    emit('update:source', updatedSource)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  const updatedTags = props.modelValue.filter((_, i) => i !== index)
  const updatedSource = props.source.filter((_, i) => i !== index)
  emit('update:modelValue', updatedTags)
  emit('update:source', updatedSource)
}

const startEdit = (index) => {
  editing.value[index] = true
  editValues.value[index] = props.modelValue[index]
}

const finishEdit = (index) => {
  if (editValues.value[index]?.trim()) {
    const updatedTags = [...props.modelValue]
    updatedTags[index] = editValues.value[index].trim()
    emit('update:modelValue', updatedTags)
  }
  editing.value[index] = false
}

const cancelEdit = (index) => {
  editing.value[index] = false
  editValues.value[index] = props.modelValue[index]
}
</script>