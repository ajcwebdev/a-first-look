import pkg from "isomorphic-fetch"
const fetch = pkg

const { VITE_ENDPOINT, VITE_API_KEY } = import.meta.env

fetch(VITE_ENDPOINT, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": VITE_API_KEY
  },
  body: JSON.stringify({
    query: `{
      todoCollection(first: 3) {
        edges {
          node {
            title
            complete
          }
        }
      }
    }`
  })
})
.then(async (data) => {
  document.querySelector('#app').innerHTML = `
    <div>${JSON.stringify(await data.json())}</div>
  `
})