<template>
  <div>
    <HelloWorld msg="Vite + Vue" />
    <h1>Dash + Vue + Express</h1>
    <button @click="triggerFetch = true">Fetch Data</button>
    <p class="alignLeft">
      <pre class="preLeft">
        {{ isLoading ? 'Loading...' : JSON.stringify(blockchainData, null, 2) }}
      </pre>
    </p>
  </div>
</template>

<script>
  import { ref, watch } from 'vue'

  const URL = "http://localhost:3001/name/ajcwebdevtest"

  export default {
    setup() {
      const blockchainData = ref(null)
      const triggerFetch = ref(false)
      const isLoading = ref(false)

      const fetchData = () => {
        isLoading.value = true
        fetch(URL)
          .then(response => response.json())
          .then(data => {
            blockchainData.value = data
            isLoading.value = false
          })
      }
      watch(triggerFetch, (newVal) => {
        if (newVal) {
          fetchData()
          triggerFetch.value = false
        }
      })
      return { blockchainData, triggerFetch, isLoading }
    }
  }
</script>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
  .alignLeft {
    display: flex;
    justify-content: flex-start;
  }
  .preLeft {
    text-align: left;
  }
</style>