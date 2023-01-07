fetch('https://rickandmortyapi.com/graphql', {
  method: 'POST',

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({
    query: `
      query getCharacters {
        characters {
          results {
            name
          }
        }
      }
    `
  })
})
.then(res => res.json())
.then(data => console.log(data.data))