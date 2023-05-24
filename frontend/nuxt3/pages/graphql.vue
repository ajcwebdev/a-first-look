<template>
  <ul>
    <li
      v-for="character of characters.data.characters.results"
      v-bind:key="character.items"
    >
      {{ character.name }}
    </li>
  </ul>
</template>

<script setup>
  const ENDPOINT = 'https://rickandmortyapi.com/graphql'

  const { data: characters } = await useFetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `{
        characters(filter: {
          type: "Human with antennae"
        }) {
          results {
            name
            id
            type
          }
        }
      }`
    })
  })
</script>