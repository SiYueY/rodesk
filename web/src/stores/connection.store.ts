import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  const connected = ref(false)
  const endpoint = ref('')

  function connect(url: string) {
    endpoint.value = url
    connected.value = true
  }

  function disconnect() {
    connected.value = false
  }

  return { connected, endpoint, connect, disconnect }
})
