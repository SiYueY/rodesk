import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRobotStore = defineStore('robot', () => {
  const name = ref('Mock Robot')
  const status = ref('offline')

  return { name, status }
})
