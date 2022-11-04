<script>
  // import HookDetail from '../../components/HookDetail.svelte';
  import BlogTeaser from '../../components/BlogTeaser.svelte';
  export let data, helpers;

  export let foo;

  // add permalinks to the hook list so we can link to the posts.
  // const hooks = data.hookInterface.map((hook) => ({ ...hook, link: helpers.permalinks.hooks({ slug: hook.hook }) }));
</script>

<style>
  .banner {
    padding: 1rem 2rem;
    background: #eee;
    border-radius: 2rem;
    margin-bottom: 1rem;
  }
  .entries {
    display: grid;
    grid-template-columns: 1fr;
    margin: 3rem 0;
  }

  @media (min-width: 768px) {
    .entries {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      margin: 3rem 0;
    }
    :global(.entries .entry) {
      margin-right: 1rem;
    }
  }

  :global(.entry) {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 1rem;
    margin-bottom: 1rem;
    background: white;
  }
  .about {
    margin-bottom: 2rem;
  }

  @media (min-width: 768px) {
    .hydrate {
      display: grid;
      grid-template-columns: 80% 20%;
    }
  }

  .hooks {
    display: grid;
    grid-template-columns: 100%;
  }

  @media (min-width: 768px) {
    .hooks {
      grid-template-columns: 50% 50%;
    }
  }
</style>

<svelte:head>
  <title>Elder.js Template: Home</title>
</svelte:head>

{#if data.testingHooks}
  <div class="banner">
    <p>Testing hooks worked</p>
    {#if data.cpus}
      <p>If you use Elder.js to build your site, it will span all {data.cpus.length} cpus listed below:</p>
      <ol>
        {#each data.cpus as cpu}
          <li>{cpu.model}</li>
        {/each}
      </ol>
    {/if}
  </div>
{/if}

<div class="banner">
  <h1>ajcwebdev</h1>
  <p>Woot!</p>
</div>

<div class="blog">
  <div class="entries">
    {#each data.markdown.blog as blog}
      <BlogTeaser {blog} {helpers} />
    {/each}
  </div>
</div>

<!-- <div class="hooks">
  {#each hooks as hook, i}
    <HookDetail {hook} {i} hookEntityDefinitions={data.hookEntityDefinitions} />
  {/each}
</div> -->
