<script context="module">
  export const prerender = true
</script>

<script>
  import Counter from '$lib/Counter.svelte'
</script>

<section>
  <h1>ajcwebdev</h1>

  <Counter/>
  <p><a href="https://ajcwebdev.com">Blog</a></p>
  <p><a href="https://github.com/ajcwebdev">GitHub</a></p>
  <p><a href="https://twitter.com/ajcwebdev">Twitter</a></p>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  .welcome {
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
  }

  h1 {
    width: 100%;
  }
</style>