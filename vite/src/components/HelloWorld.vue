<template>
  <h1>{{ msg }}</h1>

  <p>
    <a
      href="https://dev.to/ajcwebdev"
      target="_blank"
    >
      Blog
    </a>
    |
    <a
      href="https://github.com/ajcwebdev"
      target="_blank"
    >
      GitHub
    </a>
  </p>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  msg: String
})
</script>

<style scoped>
a {
  color: #42b983;
}
</style>