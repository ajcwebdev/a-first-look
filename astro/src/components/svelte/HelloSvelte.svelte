<script>
  let count = 0

  function add() {
    count += 1
  }

  function subtract() {
    count -= 1
  }
</script>

<h2><slot /></h2>

<div>
  <button on:click={subtract}>-</button>
  <pre>{ count }</pre>
  <button on:click={add}>+</button>
</div>

<style>
  div {
    display: flex;
  }
</style>