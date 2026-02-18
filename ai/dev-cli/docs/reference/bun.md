**Note** — `bunx` is an alias for `bun x`. The `bunx` CLI will be auto-installed when you install `bun`.

Use `bunx` to auto-install and run packages from `npm`. It's Bun's equivalent of `npx` or `yarn dlx`.

```bash
$ bunx cowsay "Hello world!"
```

⚡️ **Speed** — With Bun's fast startup times, `bunx` is [roughly 100x faster](https://twitter.com/jarredsumner/status/1606163655527059458) than `npx` for locally installed packages.

Packages can declare executables in the `"bin"` field of their `package.json`. These are known as _package executables_ or _package binaries_.

```jsonc#package.json
{
  // ... other fields
  "name": "my-cli",
  "bin": {
    "my-cli": "dist/index.js"
  }
}
```

These executables are commonly plain JavaScript files marked with a [shebang line](<https://en.wikipedia.org/wiki/Shebang_(Unix)>) to indicate which program should be used to execute them. The following file indicates that it should be executed with `node`.

```js#dist/index.js
#!/usr/bin/env node

console.log("Hello world!");
```

These executables can be run with `bunx`,

```bash
$ bunx my-cli
```

As with `npx`, `bunx` will check for a locally installed package first, then fall back to auto-installing the package from `npm`. Installed packages will be stored in Bun's global cache for future use.

## Arguments and flags

To pass additional command-line flags and arguments through to the executable, place them after the executable name.

```bash
$ bunx my-cli --foo bar
```

## Shebangs

By default, Bun respects shebangs. If an executable is marked with `#!/usr/bin/env node`, Bun will spin up a `node` process to execute the file. However, in some cases it may be desirable to run executables using Bun's runtime, even if the executable indicates otherwise. To do so, include the `--bun` flag.

```bash
$ bunx --bun my-cli
```

The `--bun` flag must occur _before_ the executable name. Flags that appear _after_ the name are passed through to the executable.

```bash
$ bunx --bun my-cli # good
$ bunx my-cli --bun # bad
```

To force bun to always be used with a script, use a shebang.

```
#!/usr/bin/env bun
```

<!-- ## Environment variables

Bun automatically loads environment variables from `.env` files before running a file, script, or executable. The following files are checked, in order:

1. `.env.local` (first)
2. `NODE_ENV` === `"production"` ? `.env.production` : `.env.development`
3. `.env`

To debug environment variables, run `bun --print process.env` to view a list of resolved environment variables. -->


The `bun` CLI can be used to execute JavaScript/TypeScript files, `package.json` scripts, and [executable packages](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#bin).

## Performance

Bun is designed to start fast and run fast.

Under the hood Bun uses the [JavaScriptCore engine](https://developer.apple.com/documentation/javascriptcore), which is developed by Apple for Safari. In most cases, the startup and running performance is faster than V8, the engine used by Node.js and Chromium-based browsers. Its transpiler and runtime are written in Zig, a modern, high-performance language. On Linux, this translates into startup times [4x faster](https://twitter.com/jarredsumner/status/1499225725492076544) than Node.js.

{% table %}

---

- `bun hello.js`
- `5.2ms`

---

- `node hello.js`
- `25.1ms`

{% /table %}
{% caption content="Running a simple Hello World script on Linux" /%}

<!-- {% image src="/images/bun-run-speed.jpeg" caption="Bun vs Node.js vs Deno running Hello World" /%} -->

<!-- ## Speed -->

<!--
Performance sensitive APIs like `Buffer`, `fetch`, and `Response` are heavily profiled and optimized. Under the hood Bun uses the [JavaScriptCore engine](https://developer.apple.com/documentation/javascriptcore), which is developed by Apple for Safari. It starts and runs faster than V8, the engine used by Node.js and Chromium-based browsers. -->

## Run a file

Compare to `node <file>`

Use `bun run` to execute a source file.

```bash
$ bun run index.js
```

Bun supports TypeScript and JSX out of the box. Every file is transpiled on the fly by Bun's fast native transpiler before being executed.

```bash
$ bun run index.js
$ bun run index.jsx
$ bun run index.ts
$ bun run index.tsx
```

Alternatively, you can omit the `run` keyword and use the "naked" command; it behaves identically.

```bash
$ bun index.tsx
$ bun index.js
```

### `--watch`

To run a file in watch mode, use the `--watch` flag.

```bash
$ bun --watch run index.tsx
```

**Note** — When using `bun run`, put Bun flags like `--watch` immediately after `bun`.

```bash
$ bun --watch run dev # ✔️ do this
$ bun run dev --watch # ❌ don't do this
```

Flags that occur at the end of the command will be ignored and passed through to the `"dev"` script itself.

## Run a `package.json` script

{% note %}
Compare to `npm run <script>` or `yarn <script>`
{% /note %}

```sh
$ bun [bun flags] run <script> [script flags]
```

Your `package.json` can define a number of named `"scripts"` that correspond to shell commands.

```json
{
  // ... other fields
  "scripts": {
    "clean": "rm -rf dist && echo 'Done.'",
    "dev": "bun server.ts"
  }
}
```

Use `bun run <script>` to execute these scripts.

```bash
$ bun run clean
 $ rm -rf dist && echo 'Done.'
 Cleaning...
 Done.
```

Bun executes the script command in a subshell. On Linux & macOS, it checks for the following shells in order, using the first one it finds: `bash`, `sh`, `zsh`. On windows, it uses [bun shell](https://bun.com/docs/runtime/shell) to support bash-like syntax and many common commands.

⚡️ The startup time for `npm run` on Linux is roughly 170ms; with Bun it is `6ms`.

Scripts can also be run with the shorter command `bun <script>`, however if there is a built-in bun command with the same name, the built-in command takes precedence. In this case, use the more explicit `bun run <script>` command to execute your package script.

```bash
$ bun run dev
```

To see a list of available scripts, run `bun run` without any arguments.

```bash
$ bun run
quickstart scripts:

 bun run clean
   rm -rf dist && echo 'Done.'

 bun run dev
   bun server.ts

2 scripts
```

Bun respects lifecycle hooks. For instance, `bun run clean` will execute `preclean` and `postclean`, if defined. If the `pre<script>` fails, Bun will not execute the script itself.

### `--bun`

It's common for `package.json` scripts to reference locally-installed CLIs like `vite` or `next`. These CLIs are often JavaScript files marked with a [shebang](<https://en.wikipedia.org/wiki/Shebang_(Unix)>) to indicate that they should be executed with `node`.

```js
#!/usr/bin/env node

// do stuff
```

By default, Bun respects this shebang and executes the script with `node`. However, you can override this behavior with the `--bun` flag. For Node.js-based CLIs, this will run the CLI with Bun instead of Node.js.

```bash
$ bun run --bun vite
```

### Filtering

In monorepos containing multiple packages, you can use the `--filter` argument to execute scripts in many packages at once.

Use `bun run --filter <name_pattern> <script>` to execute `<script>` in all packages whose name matches `<name_pattern>`.
For example, if you have subdirectories containing packages named `foo`, `bar` and `baz`, running

```bash
bun run --filter 'ba*' <script>
```

will execute `<script>` in both `bar` and `baz`, but not in `foo`.

Find more details in the docs page for [filter](https://bun.com/docs/cli/filter#running-scripts-with-filter).

## `bun run -` to pipe code from stdin

`bun run -` lets you read JavaScript, TypeScript, TSX, or JSX from stdin and execute it without writing to a temporary file first.

```bash
$ echo "console.log('Hello')" | bun run -
Hello
```

You can also use `bun run -` to redirect files into Bun. For example, to run a `.js` file as if it were a `.ts` file:

```bash
$ echo "console.log!('This is TypeScript!' as any)" > secretly-typescript.js
$ bun run - < secretly-typescript.js
This is TypeScript!
```

For convenience, all code is treated as TypeScript with JSX support when using `bun run -`.

## `bun run --console-depth`

Control the depth of object inspection in console output with the `--console-depth` flag.

```bash
$ bun --console-depth 5 run index.tsx
```

This sets how deeply nested objects are displayed in `console.log()` output. The default depth is `2`. Higher values show more nested properties but may produce verbose output for complex objects.

```js
const nested = { a: { b: { c: { d: "deep" } } } };
console.log(nested);
// With --console-depth 2 (default): { a: { b: [Object] } }
// With --console-depth 4: { a: { b: { c: { d: 'deep' } } } }
```

## `bun run --smol`

In memory-constrained environments, use the `--smol` flag to reduce memory usage at a cost to performance.

```bash
$ bun --smol run index.tsx
```

This causes the garbage collector to run more frequently, which can slow down execution. However, it can be useful in environments with limited memory. Bun automatically adjusts the garbage collector's heap size based on the available memory (accounting for cgroups and other memory limits) with and without the `--smol` flag, so this is mostly useful for cases where you want to make the heap size grow more slowly.

## Resolution order

Absolute paths and paths starting with `./` or `.\\` are always executed as source files. Unless using `bun run`, running a file with an allowed extension will prefer the file over a package.json script.

When there is a package.json script and a file with the same name, `bun run` prioritizes the package.json script. The full resolution order is:

1. package.json scripts, eg `bun run build`
2. Source files, eg `bun run src/main.js`
3. Binaries from project packages, eg `bun add eslint && bun run eslint`
4. (`bun run` only) System commands, eg `bun run ls`

{% bunCLIUsage command="run" /%}


Spawn child processes with `Bun.spawn` or `Bun.spawnSync`.

## Spawn a process (`Bun.spawn()`)

Provide a command as an array of strings. The result of `Bun.spawn()` is a `Bun.Subprocess` object.

```ts
const proc = Bun.spawn(["bun", "--version"]);
console.log(await proc.exited); // 0
```

The second argument to `Bun.spawn` is a parameters object that can be used to configure the subprocess.

```ts
const proc = Bun.spawn(["bun", "--version"], {
  cwd: "./path/to/subdir", // specify a working directory
  env: { ...process.env, FOO: "bar" }, // specify environment variables
  onExit(proc, exitCode, signalCode, error) {
    // exit handler
  },
});

proc.pid; // process ID of subprocess
```

## Input stream

By default, the input stream of the subprocess is undefined; it can be configured with the `stdin` parameter.

```ts
const proc = Bun.spawn(["cat"], {
  stdin: await fetch(
    "https://raw.githubusercontent.com/oven-sh/bun/main/examples/hashing.js",
  ),
});

const text = await proc.stdout.text();
console.log(text); // "const input = "hello world".repeat(400); ..."
```

{% table %}

---

- `null`
- **Default.** Provide no input to the subprocess

---

- `"pipe"`
- Return a `FileSink` for fast incremental writing

---

- `"inherit"`
- Inherit the `stdin` of the parent process

---

- `Bun.file()`
- Read from the specified file.

---

- `TypedArray | DataView`
- Use a binary buffer as input.

---

- `Response`
- Use the response `body` as input.

---

- `Request`
- Use the request `body` as input.

---

- `ReadableStream`
- Use a readable stream as input.

---

- `Blob`
- Use a blob as input.

---

- `number`
- Read from the file with a given file descriptor.

{% /table %}

The `"pipe"` option lets incrementally write to the subprocess's input stream from the parent process.

```ts
const proc = Bun.spawn(["cat"], {
  stdin: "pipe", // return a FileSink for writing
});

// enqueue string data
proc.stdin.write("hello");

// enqueue binary data
const enc = new TextEncoder();
proc.stdin.write(enc.encode(" world!"));

// send buffered data
proc.stdin.flush();

// close the input stream
proc.stdin.end();
```

Passing a `ReadableStream` to `stdin` lets you pipe data from a JavaScript `ReadableStream` directly to the subprocess's input:

```ts
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue("Hello from ");
    controller.enqueue("ReadableStream!");
    controller.close();
  },
});

const proc = Bun.spawn(["cat"], {
  stdin: stream,
  stdout: "pipe",
});

const output = await new Response(proc.stdout).text();
console.log(output); // "Hello from ReadableStream!"
```

## Output streams

You can read results from the subprocess via the `stdout` and `stderr` properties. By default these are instances of `ReadableStream`.

```ts
const proc = Bun.spawn(["bun", "--version"]);
const text = await proc.stdout.text();
console.log(text); // => "$BUN_LATEST_VERSION\n"
```

Configure the output stream by passing one of the following values to `stdout/stderr`:

{% table %}

---

- `"pipe"`
- **Default for `stdout`.** Pipe the output to a `ReadableStream` on the returned `Subprocess` object.

---

- `"inherit"`
- **Default for `stderr`.** Inherit from the parent process.

---

- `"ignore"`
- Discard the output.

---

- `Bun.file()`
- Write to the specified file.

---

- `number`
- Write to the file with the given file descriptor.

{% /table %}

## Exit handling

Use the `onExit` callback to listen for the process exiting or being killed.

```ts
const proc = Bun.spawn(["bun", "--version"], {
  onExit(proc, exitCode, signalCode, error) {
    // exit handler
  },
});
```

For convenience, the `exited` property is a `Promise` that resolves when the process exits.

```ts
const proc = Bun.spawn(["bun", "--version"]);

await proc.exited; // resolves when process exit
proc.killed; // boolean — was the process killed?
proc.exitCode; // null | number
proc.signalCode; // null | "SIGABRT" | "SIGALRM" | ...
```

To kill a process:

```ts
const proc = Bun.spawn(["bun", "--version"]);
proc.kill();
proc.killed; // true

proc.kill(15); // specify a signal code
proc.kill("SIGTERM"); // specify a signal name
```

The parent `bun` process will not terminate until all child processes have exited. Use `proc.unref()` to detach the child process from the parent.

```ts
const proc = Bun.spawn(["bun", "--version"]);
proc.unref();
```

## Resource usage

You can get information about the process's resource usage after it has exited:

```ts
const proc = Bun.spawn(["bun", "--version"]);
await proc.exited;

const usage = proc.resourceUsage();
console.log(`Max memory used: ${usage.maxRSS} bytes`);
console.log(`CPU time (user): ${usage.cpuTime.user} µs`);
console.log(`CPU time (system): ${usage.cpuTime.system} µs`);
```

## Using AbortSignal

You can abort a subprocess using an `AbortSignal`:

```ts
const controller = new AbortController();
const { signal } = controller;

const proc = Bun.spawn({
  cmd: ["sleep", "100"],
  signal,
});

// Later, to abort the process:
controller.abort();
```

## Using timeout and killSignal

You can set a timeout for a subprocess to automatically terminate after a specific duration:

```ts
// Kill the process after 5 seconds
const proc = Bun.spawn({
  cmd: ["sleep", "10"],
  timeout: 5000, // 5 seconds in milliseconds
});

await proc.exited; // Will resolve after 5 seconds
```

By default, timed-out processes are killed with the `SIGTERM` signal. You can specify a different signal with the `killSignal` option:

```ts
// Kill the process with SIGKILL after 5 seconds
const proc = Bun.spawn({
  cmd: ["sleep", "10"],
  timeout: 5000,
  killSignal: "SIGKILL", // Can be string name or signal number
});
```

The `killSignal` option also controls which signal is sent when an AbortSignal is aborted.

## Using maxBuffer

For spawnSync, you can limit the maximum number of bytes of output before the process is killed:

```ts
// KIll 'yes' after it emits over 100 bytes of output
const result = Bun.spawnSync({
  cmd: ["yes"], // or ["bun", "exec", "yes"] on windows
  maxBuffer: 100,
});
// process exits
```

## Inter-process communication (IPC)

Bun supports direct inter-process communication channel between two `bun` processes. To receive messages from a spawned Bun subprocess, specify an `ipc` handler.

```ts#parent.ts
const child = Bun.spawn(["bun", "child.ts"], {
  ipc(message) {
    /**
     * The message received from the sub process
     **/
  },
});
```

The parent process can send messages to the subprocess using the `.send()` method on the returned `Subprocess` instance. A reference to the sending subprocess is also available as the second argument in the `ipc` handler.

```ts#parent.ts
const childProc = Bun.spawn(["bun", "child.ts"], {
  ipc(message, childProc) {
    /**
     * The message received from the sub process
     **/
    childProc.send("Respond to child")
  },
});

childProc.send("I am your father"); // The parent can send messages to the child as well
```

Meanwhile the child process can send messages to its parent using with `process.send()` and receive messages with `process.on("message")`. This is the same API used for `child_process.fork()` in Node.js.

```ts#child.ts
process.send("Hello from child as string");
process.send({ message: "Hello from child as object" });

process.on("message", (message) => {
  // print message from parent
  console.log(message);
});
```

```ts#child.ts
// send a string
process.send("Hello from child as string");

// send an object
process.send({ message: "Hello from child as object" });
```

The `serialization` option controls the underlying communication format between the two processes:

- `advanced`: (default) Messages are serialized using the JSC `serialize` API, which supports cloning [everything `structuredClone` supports](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). This does not support transferring ownership of objects.
- `json`: Messages are serialized using `JSON.stringify` and `JSON.parse`, which does not support as many object types as `advanced` does.

To disconnect the IPC channel from the parent process, call:

```ts
childProc.disconnect();
```

### IPC between Bun & Node.js

To use IPC between a `bun` process and a Node.js process, set `serialization: "json"` in `Bun.spawn`. This is because Node.js and Bun use different JavaScript engines with different object serialization formats.

```js#bun-node-ipc.js
if (typeof Bun !== "undefined") {
  const prefix = `[bun ${process.versions.bun} 🐇]`;
  const node = Bun.spawn({
    cmd: ["node", __filename],
    ipc({ message }) {
      console.log(message);
      node.send({ message: `${prefix} 👋 hey node` });
      node.kill();
    },
    stdio: ["inherit", "inherit", "inherit"],
    serialization: "json",
  });

  node.send({ message: `${prefix} 👋 hey node` });
} else {
  const prefix = `[node ${process.version}]`;
  process.on("message", ({ message }) => {
    console.log(message);
    process.send({ message: `${prefix} 👋 hey bun` });
  });
}
```

## Blocking API (`Bun.spawnSync()`)

Bun provides a synchronous equivalent of `Bun.spawn` called `Bun.spawnSync`. This is a blocking API that supports the same inputs and parameters as `Bun.spawn`. It returns a `SyncSubprocess` object, which differs from `Subprocess` in a few ways.

1. It contains a `success` property that indicates whether the process exited with a zero exit code.
2. The `stdout` and `stderr` properties are instances of `Buffer` instead of `ReadableStream`.
3. There is no `stdin` property. Use `Bun.spawn` to incrementally write to the subprocess's input stream.

```ts
const proc = Bun.spawnSync(["echo", "hello"]);

console.log(proc.stdout.toString());
// => "hello\n"
```

As a rule of thumb, the asynchronous `Bun.spawn` API is better for HTTP servers and apps, and `Bun.spawnSync` is better for building command-line tools.

## Benchmarks

{%callout%}
⚡️ Under the hood, `Bun.spawn` and `Bun.spawnSync` use [`posix_spawn(3)`](https://man7.org/linux/man-pages/man3/posix_spawn.3.html).
{%/callout%}

Bun's `spawnSync` spawns processes 60% faster than the Node.js `child_process` module.

```bash
$ bun spawn.mjs
cpu: Apple M1 Max
runtime: bun 1.x (arm64-darwin)

benchmark              time (avg)             (min … max)       p75       p99      p995
--------------------------------------------------------- -----------------------------
spawnSync echo hi  888.14 µs/iter    (821.83 µs … 1.2 ms) 905.92 µs      1 ms   1.03 ms
$ node spawn.node.mjs
cpu: Apple M1 Max
runtime: node v18.9.1 (arm64-darwin)

benchmark              time (avg)             (min … max)       p75       p99      p995
--------------------------------------------------------- -----------------------------
spawnSync echo hi    1.47 ms/iter     (1.14 ms … 2.64 ms)   1.57 ms   2.37 ms   2.52 ms
```

## Reference

A reference of the Spawn API and types are shown below. The real types have complex generics to strongly type the `Subprocess` streams with the options passed to `Bun.spawn` and `Bun.spawnSync`. For full details, find these types as defined [bun.d.ts](https://github.com/oven-sh/bun/blob/main/packages/bun-types/bun.d.ts).

```ts
interface Bun {
  spawn(command: string[], options?: SpawnOptions.OptionsObject): Subprocess;
  spawnSync(
    command: string[],
    options?: SpawnOptions.OptionsObject,
  ): SyncSubprocess;

  spawn(options: { cmd: string[] } & SpawnOptions.OptionsObject): Subprocess;
  spawnSync(
    options: { cmd: string[] } & SpawnOptions.OptionsObject,
  ): SyncSubprocess;
}

namespace SpawnOptions {
  interface OptionsObject {
    cwd?: string;
    env?: Record<string, string | undefined>;
    stdio?: [Writable, Readable, Readable];
    stdin?: Writable;
    stdout?: Readable;
    stderr?: Readable;
    onExit?(
      subprocess: Subprocess,
      exitCode: number | null,
      signalCode: number | null,
      error?: ErrorLike,
    ): void | Promise<void>;
    ipc?(message: any, subprocess: Subprocess): void;
    serialization?: "json" | "advanced";
    windowsHide?: boolean;
    windowsVerbatimArguments?: boolean;
    argv0?: string;
    signal?: AbortSignal;
    timeout?: number;
    killSignal?: string | number;
    maxBuffer?: number;
  }

  type Readable =
    | "pipe"
    | "inherit"
    | "ignore"
    | null // equivalent to "ignore"
    | undefined // to use default
    | BunFile
    | ArrayBufferView
    | number;

  type Writable =
    | "pipe"
    | "inherit"
    | "ignore"
    | null // equivalent to "ignore"
    | undefined // to use default
    | BunFile
    | ArrayBufferView
    | number
    | ReadableStream
    | Blob
    | Response
    | Request;
}

interface Subprocess extends AsyncDisposable {
  readonly stdin: FileSink | number | undefined;
  readonly stdout: ReadableStream<Uint8Array> | number | undefined;
  readonly stderr: ReadableStream<Uint8Array> | number | undefined;
  readonly readable: ReadableStream<Uint8Array> | number | undefined;
  readonly pid: number;
  readonly exited: Promise<number>;
  readonly exitCode: number | null;
  readonly signalCode: NodeJS.Signals | null;
  readonly killed: boolean;

  kill(exitCode?: number | NodeJS.Signals): void;
  ref(): void;
  unref(): void;

  send(message: any): void;
  disconnect(): void;
  resourceUsage(): ResourceUsage | undefined;
}

interface SyncSubprocess {
  stdout: Buffer | undefined;
  stderr: Buffer | undefined;
  exitCode: number;
  success: boolean;
  resourceUsage: ResourceUsage;
  signalCode?: string;
  exitedDueToTimeout?: true;
  pid: number;
}

interface ResourceUsage {
  contextSwitches: {
    voluntary: number;
    involuntary: number;
  };

  cpuTime: {
    user: number;
    system: number;
    total: number;
  };
  maxRSS: number;

  messages: {
    sent: number;
    received: number;
  };
  ops: {
    in: number;
    out: number;
  };
  shmSize: number;
  signalCount: number;
  swapCount: number;
}

type Signal =
  | "SIGABRT"
  | "SIGALRM"
  | "SIGBUS"
  | "SIGCHLD"
  | "SIGCONT"
  | "SIGFPE"
  | "SIGHUP"
  | "SIGILL"
  | "SIGINT"
  | "SIGIO"
  | "SIGIOT"
  | "SIGKILL"
  | "SIGPIPE"
  | "SIGPOLL"
  | "SIGPROF"
  | "SIGPWR"
  | "SIGQUIT"
  | "SIGSEGV"
  | "SIGSTKFLT"
  | "SIGSTOP"
  | "SIGSYS"
  | "SIGTERM"
  | "SIGTRAP"
  | "SIGTSTP"
  | "SIGTTIN"
  | "SIGTTOU"
  | "SIGUNUSED"
  | "SIGURG"
  | "SIGUSR1"
  | "SIGUSR2"
  | "SIGVTALRM"
  | "SIGWINCH"
  | "SIGXCPU"
  | "SIGXFSZ"
  | "SIGBREAK"
  | "SIGLOST"
  | "SIGINFO";
```


Bun's bundler implements a `--compile` flag for generating a standalone binary from a TypeScript or JavaScript file.

{% codetabs %}

```bash
$ bun build ./cli.ts --compile --outfile mycli
```

```ts#cli.ts
console.log("Hello world!");
```

{% /codetabs %}

This bundles `cli.ts` into an executable that can be executed directly:

```
$ ./mycli
Hello world!
```

All imported files and packages are bundled into the executable, along with a copy of the Bun runtime. All built-in Bun and Node.js APIs are supported.

## Cross-compile to other platforms

The `--target` flag lets you compile your standalone executable for a different operating system, architecture, or version of Bun than the machine you're running `bun build` on.

To build for Linux x64 (most servers):

```sh
bun build --compile --target=bun-linux-x64 ./index.ts --outfile myapp

# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-linux-x64-baseline ./index.ts --outfile myapp

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
# modern is faster, but baseline is more compatible.
bun build --compile --target=bun-linux-x64-modern ./index.ts --outfile myapp
```

To build for Linux ARM64 (e.g. Graviton or Raspberry Pi):

```sh
# Note: the default architecture is x64 if no architecture is specified.
bun build --compile --target=bun-linux-arm64 ./index.ts --outfile myapp
```

To build for Windows x64:

```sh
bun build --compile --target=bun-windows-x64 ./path/to/my/app.ts --outfile myapp

# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-windows-x64-baseline ./path/to/my/app.ts --outfile myapp

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
bun build --compile --target=bun-windows-x64-modern ./path/to/my/app.ts --outfile myapp

# note: if no .exe extension is provided, Bun will automatically add it for Windows executables
```

To build for macOS arm64:

```sh
bun build --compile --target=bun-darwin-arm64 ./path/to/my/app.ts --outfile myapp
```

To build for macOS x64:

```sh
bun build --compile --target=bun-darwin-x64 ./path/to/my/app.ts --outfile myapp
```

#### Supported targets

The order of the `--target` flag does not matter, as long as they're delimited by a `-`.

| --target              | Operating System | Architecture | Modern | Baseline | Libc  |
| --------------------- | ---------------- | ------------ | ------ | -------- | ----- |
| bun-linux-x64         | Linux            | x64          | ✅     | ✅       | glibc |
| bun-linux-arm64       | Linux            | arm64        | ✅     | N/A      | glibc |
| bun-windows-x64       | Windows          | x64          | ✅     | ✅       | -     |
| ~~bun-windows-arm64~~ | Windows          | arm64        | ❌     | ❌       | -     |
| bun-darwin-x64        | macOS            | x64          | ✅     | ✅       | -     |
| bun-darwin-arm64      | macOS            | arm64        | ✅     | N/A      | -     |
| bun-linux-x64-musl    | Linux            | x64          | ✅     | ✅       | musl  |
| bun-linux-arm64-musl  | Linux            | arm64        | ✅     | N/A      | musl  |

On x64 platforms, Bun uses SIMD optimizations which require a modern CPU supporting AVX2 instructions. The `-baseline` build of Bun is for older CPUs that don't support these optimizations. Normally, when you install Bun we automatically detect which version to use but this can be harder to do when cross-compiling since you might not know the target CPU. You usually don't need to worry about it on Darwin x64, but it is relevant for Windows x64 and Linux x64. If you or your users see `"Illegal instruction"` errors, you might need to use the baseline version.

## Build-time constants

Use the `--define` flag to inject build-time constants into your executable, such as version numbers, build timestamps, or configuration values:

```bash
$ bun build --compile --define BUILD_VERSION='"1.2.3"' --define BUILD_TIME='"2024-01-15T10:30:00Z"' src/cli.ts --outfile mycli
```

These constants are embedded directly into your compiled binary at build time, providing zero runtime overhead and enabling dead code elimination optimizations.

{% callout type="info" %}
For comprehensive examples and advanced patterns, see the [Build-time constants guide](/guides/runtime/build-time-constants).

## Deploying to production

Compiled executables reduce memory usage and improve Bun's start time.

Normally, Bun reads and transpiles JavaScript and TypeScript files on `import` and `require`. This is part of what makes so much of Bun "just work", but it's not free. It costs time and memory to read files from disk, resolve file paths, parse, transpile, and print source code.

With compiled executables, you can move that cost from runtime to build-time.

When deploying to production, we recommend the following:

```sh
bun build --compile --minify --sourcemap ./path/to/my/app.ts --outfile myapp
```

### Bytecode compilation

To improve startup time, enable bytecode compilation:

```sh
bun build --compile --minify --sourcemap --bytecode ./path/to/my/app.ts --outfile myapp
```

Using bytecode compilation, `tsc` starts 2x faster:

{% image src="https://github.com/user-attachments/assets/dc8913db-01d2-48f8-a8ef-ac4e984f9763" width="689" /%}

Bytecode compilation moves parsing overhead for large input files from runtime to bundle time. Your app starts faster, in exchange for making the `bun build` command a little slower. It doesn't obscure source code.

**Experimental:** Bytecode compilation is an experimental feature introduced in Bun v1.1.30. Only `cjs` format is supported (which means no top-level-await). Let us know if you run into any issues!

### What do these flags do?

The `--minify` argument optimizes the size of the transpiled output code. If you have a large application, this can save megabytes of space. For smaller applications, it might still improve start time a little.

The `--sourcemap` argument embeds a sourcemap compressed with zstd, so that errors & stacktraces point to their original locations instead of the transpiled location. Bun will automatically decompress & resolve the sourcemap when an error occurs.

The `--bytecode` argument enables bytecode compilation. Every time you run JavaScript code in Bun, JavaScriptCore (the engine) will compile your source code into bytecode. We can move this parsing work from runtime to bundle time, saving you startup time.

## Act as the Bun CLI

{% note %}

New in Bun v1.2.16

{% /note %}

You can run a standalone executable as if it were the `bun` CLI itself by setting the `BUN_BE_BUN=1` environment variable. When this variable is set, the executable will ignore its bundled entrypoint and instead expose all the features of Bun's CLI.

For example, consider an executable compiled from a simple script:

```sh
$ cat such-bun.js
console.log("you shouldn't see this");

$ bun build --compile ./such-bun.js
 [3ms] bundle 1 modules
[89ms] compile such-bun
```

Normally, running `./such-bun` with arguments would execute the script. However, with the `BUN_BE_BUN=1` environment variable, it acts just like the `bun` binary:

```sh
# Executable runs its own entrypoint by default
$ ./such-bun install
you shouldn't see this

# With the env var, the executable acts like the `bun` CLI
$ BUN_BE_BUN=1 ./such-bun install
bun install v1.2.16-canary.1 (1d1db811)
Checked 63 installs across 64 packages (no changes) [5.00ms]
```

This is useful for building CLI tools on top of Bun that may need to install packages, bundle dependencies, run different or local files and more without needing to download a separate binary or install bun.

## Full-stack executables

{% note %}

New in Bun v1.2.17

{% /note %}

Bun's `--compile` flag can create standalone executables that contain both server and client code, making it ideal for full-stack applications. When you import an HTML file in your server code, Bun automatically bundles all frontend assets (JavaScript, CSS, etc.) and embeds them into the executable. When Bun sees the HTML import on the server, it kicks off a frontend build process to bundle JavaScript, CSS, and other assets.

{% codetabs %}

```ts#server.ts
import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/": index,
    "/api/hello": { GET: () => Response.json({ message: "Hello from API" }) },
  },
});

console.log(`Server running at http://localhost:${server.port}`);
```

```html#index.html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <h1>Hello World</h1>
    <script src="./app.js"></script>
  </body>
</html>
```

```js#app.js
console.log("Hello from the client!");
```

```css#styles.css
body {
  background-color: #f0f0f0;
}
```

{% /codetabs %}

To build this into a single executable:

```sh
bun build --compile ./server.ts --outfile myapp
```

This creates a self-contained binary that includes:

- Your server code
- The Bun runtime
- All frontend assets (HTML, CSS, JavaScript)
- Any npm packages used by your server

The result is a single file that can be deployed anywhere without needing Node.js, Bun, or any dependencies installed. Just run:

```sh
./myapp
```

Bun automatically handles serving the frontend assets with proper MIME types and cache headers. The HTML import is replaced with a manifest object that `Bun.serve` uses to efficiently serve pre-bundled assets.

For more details on building full-stack applications with Bun, see the [full-stack guide](/docs/bundler/fullstack).

## Worker

To use workers in a standalone executable, add the worker's entrypoint to the CLI arguments:

```sh
$ bun build --compile ./index.ts ./my-worker.ts --outfile myapp
```

Then, reference the worker in your code:

```ts
console.log("Hello from Bun!");

// Any of these will work:
new Worker("./my-worker.ts");
new Worker(new URL("./my-worker.ts", import.meta.url));
new Worker(new URL("./my-worker.ts", import.meta.url).href);
```

As of Bun v1.1.25, when you add multiple entrypoints to a standalone executable, they will be bundled separately into the executable.

In the future, we may automatically detect usages of statically-known paths in `new Worker(path)` and then bundle those into the executable, but for now, you'll need to add it to the shell command manually like the above example.

If you use a relative path to a file not included in the standalone executable, it will attempt to load that path from disk relative to the current working directory of the process (and then error if it doesn't exist).

## SQLite

You can use `bun:sqlite` imports with `bun build --compile`.

By default, the database is resolved relative to the current working directory of the process.

```js
import db from "./my.db" with { type: "sqlite" };

console.log(db.query("select * from users LIMIT 1").get());
```

That means if the executable is located at `/usr/bin/hello`, the user's terminal is located at `/home/me/Desktop`, it will look for `/home/me/Desktop/my.db`.

```
$ cd /home/me/Desktop
$ ./hello
```

## Embed assets & files

Standalone executables support embedding files.

To embed files into an executable with `bun build --compile`, import the file in your code.

```ts
// this becomes an internal file path
import icon from "./icon.png" with { type: "file" };
import { file } from "bun";

export default {
  fetch(req) {
    // Embedded files can be streamed from Response objects
    return new Response(file(icon));
  },
};
```

Embedded files can be read using `Bun.file`'s functions or the Node.js `fs.readFile` function (in `"node:fs"`).

For example, to read the contents of the embedded file:

```js
import icon from "./icon.png" with { type: "file" };
import { file } from "bun";

const bytes = await file(icon).arrayBuffer();
// await fs.promises.readFile(icon)
// fs.readFileSync(icon)
```

### Embed SQLite databases

If your application wants to embed a SQLite database, set `type: "sqlite"` in the import attribute and the `embed` attribute to `"true"`.

```js
import myEmbeddedDb from "./my.db" with { type: "sqlite", embed: "true" };

console.log(myEmbeddedDb.query("select * from users LIMIT 1").get());
```

This database is read-write, but all changes are lost when the executable exits (since it's stored in memory).

### Embed N-API Addons

As of Bun v1.0.23, you can embed `.node` files into executables.

```js
const addon = require("./addon.node");

console.log(addon.hello());
```

Unfortunately, if you're using `@mapbox/node-pre-gyp` or other similar tools, you'll need to make sure the `.node` file is directly required or it won't bundle correctly.

### Embed directories

To embed a directory with `bun build --compile`, use a shell glob in your `bun build` command:

```sh
$ bun build --compile ./index.ts ./public/**/*.png
```

Then, you can reference the files in your code:

```ts
import icon from "./public/assets/icon.png" with { type: "file" };
import { file } from "bun";

export default {
  fetch(req) {
    // Embedded files can be streamed from Response objects
    return new Response(file(icon));
  },
};
```

This is honestly a workaround, and we expect to improve this in the future with a more direct API.

### Listing embedded files

To get a list of all embedded files, use `Bun.embeddedFiles`:

```js
import "./icon.png" with { type: "file" };
import { embeddedFiles } from "bun";

console.log(embeddedFiles[0].name); // `icon-${hash}.png`
```

`Bun.embeddedFiles` returns an array of `Blob` objects which you can use to get the size, contents, and other properties of the files.

```ts
embeddedFiles: Blob[]
```

The list of embedded files excludes bundled source code like `.ts` and `.js` files.

#### Content hash

By default, embedded files have a content hash appended to their name. This is useful for situations where you want to serve the file from a URL or CDN and have fewer cache invalidation issues. But sometimes, this is unexpected and you might want the original name instead:

To disable the content hash, pass `--asset-naming` to `bun build --compile` like this:

```sh
$ bun build --compile --asset-naming="[name].[ext]" ./index.ts
```

## Minification

To trim down the size of the executable a little, pass `--minify` to `bun build --compile`. This uses Bun's minifier to reduce the code size. Overall though, Bun's binary is still way too big and we need to make it smaller.

## Using Bun.build() API

You can also generate standalone executables using the `Bun.build()` JavaScript API. This is useful when you need programmatic control over the build process.

### Basic usage

```js
await Bun.build({
  entrypoints: ["./app.ts"],
  outdir: "./dist",
  compile: {
    target: "bun-windows-x64",
    outfile: "myapp.exe",
  },
});
```

### Windows metadata with Bun.build()

When targeting Windows, you can specify metadata through the `windows` object:

```js
await Bun.build({
  entrypoints: ["./app.ts"],
  outdir: "./dist",
  compile: {
    target: "bun-windows-x64",
    outfile: "myapp.exe",
    windows: {
      title: "My Application",
      publisher: "My Company Inc",
      version: "1.2.3.4",
      description: "A powerful application built with Bun",
      copyright: "© 2024 My Company Inc",
      hideConsole: false, // Set to true for GUI applications
      icon: "./icon.ico", // Path to icon file
    },
  },
});
```

### Cross-compilation with Bun.build()

You can cross-compile for different platforms:

```js
// Build for multiple platforms
const platforms = [
  { target: "bun-windows-x64", outfile: "app-windows.exe" },
  { target: "bun-linux-x64", outfile: "app-linux" },
  { target: "bun-darwin-arm64", outfile: "app-macos" },
];

for (const platform of platforms) {
  await Bun.build({
    entrypoints: ["./app.ts"],
    outdir: "./dist",
    compile: platform,
  });
}
```

## Windows-specific flags

When compiling a standalone executable for Windows, there are several platform-specific options that can be used to customize the generated `.exe` file:

### Visual customization

- `--windows-icon=path/to/icon.ico` - Set the executable file icon
- `--windows-hide-console` - Disable the background terminal window (useful for GUI applications)

### Metadata customization

You can embed version information and other metadata into your Windows executable:

- `--windows-title <STR>` - Set the product name (appears in file properties)
- `--windows-publisher <STR>` - Set the company name
- `--windows-version <STR>` - Set the version number (e.g. "1.2.3.4")
- `--windows-description <STR>` - Set the file description
- `--windows-copyright <STR>` - Set the copyright information

#### Example with all metadata flags:

```sh
bun build --compile ./app.ts \
  --outfile myapp.exe \
  --windows-title "My Application" \
  --windows-publisher "My Company Inc" \
  --windows-version "1.2.3.4" \
  --windows-description "A powerful application built with Bun" \
  --windows-copyright "© 2024 My Company Inc"
```

This metadata will be visible in Windows Explorer when viewing the file properties:

1. Right-click the executable in Windows Explorer
2. Select "Properties"
3. Go to the "Details" tab

#### Version string format

The `--windows-version` flag accepts version strings in the following formats:

- `"1"` - Will be normalized to "1.0.0.0"
- `"1.2"` - Will be normalized to "1.2.0.0"
- `"1.2.3"` - Will be normalized to "1.2.3.0"
- `"1.2.3.4"` - Full version format

Each version component must be a number between 0 and 65535.


These flags currently cannot be used when cross-compiling because they depend on Windows APIs. They are only available when building on Windows itself.


## Code signing on macOS

To codesign a standalone executable on macOS (which fixes Gatekeeper warnings), use the `codesign` command.

```sh
$ codesign --deep --force -vvvv --sign "XXXXXXXXXX" ./myapp
```

We recommend including an `entitlements.plist` file with JIT permissions.

```xml#entitlements.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-executable-page-protection</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

To codesign with JIT support, pass the `--entitlements` flag to `codesign`.

```sh
$ codesign --deep --force -vvvv --sign "XXXXXXXXXX" --entitlements entitlements.plist ./myapp
```

After codesigning, verify the executable:

```sh
$ codesign -vvv --verify ./myapp
./myapp: valid on disk
./myapp: satisfies its Designated Requirement
```


Codesign support requires Bun v1.2.4 or newer.


## Unsupported CLI arguments

Currently, the `--compile` flag can only accept a single entrypoint at a time and does not support the following flags:

- `--outdir` — use `outfile` instead.
- `--splitting`
- `--public-path`
- `--target=node` or `--target=browser`
- `--no-bundle` - we always bundle everything into the executable.


---
name: Read stdout from a child process
---

When using [`Bun.spawn()`](https://bun.com/docs/api/spawn), the `stdout` of the child process can be consumed as a `ReadableStream` via `proc.stdout`.

```ts
const proc = Bun.spawn(["echo", "hello"]);

const output = await proc.stdout.text();
output; // => "hello"
```

---

To instead pipe the `stdout` of the child process to `stdout` of the parent process, set "inherit".

```ts
const proc = Bun.spawn(["echo", "hello"], {
  stdout: "inherit",
});
```

---

See [Docs > API > Child processes](https://bun.com/docs/api/spawn) for complete documentation.


---
name: Read stderr from a child process
---

When using [`Bun.spawn()`](https://bun.com/docs/api/spawn), the child process inherits the `stderr` of the spawning process. If instead you'd prefer to read and handle `stderr`, set the `stderr` option to `"pipe"`.

```ts
const proc = Bun.spawn(["echo", "hello"], {
  stderr: "pipe",
});
proc.stderr; // => ReadableStream
```

---

To read `stderr` until the child process exits, use .text()

```ts
const proc = Bun.spawn(["echo", "hello"], {
  stderr: "pipe",
});

const errors: string = await proc.stderr.text();
if (errors) {
  // handle errors
}
```

---

See [Docs > API > Child processes](https://bun.com/docs/api/spawn) for complete documentation.


---
name: Parse command-line arguments
---

The _argument vector_ is the list of arguments passed to the program when it is run. It is available as `Bun.argv`.

```ts#cli.ts
console.log(Bun.argv);
```

---

Running this file with arguments results in the following:

```sh
$ bun run cli.ts --flag1 --flag2 value
[ '/path/to/bun', '/path/to/cli.ts', '--flag1', '--flag2', 'value' ]
```

---

To parse `argv` into a more useful format, `util.parseArgs` would be helpful.

Example:

```ts#cli.ts
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    flag1: {
      type: 'boolean',
    },
    flag2: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true,
});

console.log(values);
console.log(positionals);
```

---

then it outputs

```sh
$ bun run cli.ts --flag1 --flag2 value
{
  flag1: true,
  flag2: "value",
}
[ "/path/to/bun", "/path/to/cli.ts" ]
```


---
name: Spawn a child process
---

Use [`Bun.spawn()`](https://bun.com/docs/api/spawn) to spawn a child process.

```ts
const proc = Bun.spawn(["echo", "hello"]);

// await completion
await proc.exited;
```

---

The second argument accepts a configuration object.

```ts
const proc = Bun.spawn(["echo", "Hello, world!"], {
  cwd: "/tmp",
  env: { FOO: "bar" },
  onExit(proc, exitCode, signalCode, error) {
    // exit handler
  },
});
```

---

By default, the `stdout` of the child process can be consumed as a `ReadableStream` using `proc.stdout`.

```ts
const proc = Bun.spawn(["echo", "hello"]);

const output = await proc.stdout.text();
output; // => "hello\n"
```

---

See [Docs > API > Child processes](https://bun.com/docs/api/spawn) for complete documentation.


---
name: Listen to OS signals
---

Bun supports the Node.js `process` global, including the `process.on()` method for listening to OS signals.

```ts
process.on("SIGINT", () => {
  console.log("Received SIGINT");
});
```

---

If you don't know which signal to listen for, you listen to the umbrella `"exit"` event.

```ts
process.on("exit", code => {
  console.log(`Process exited with code ${code}`);
});
```

---

If you don't know which signal to listen for, you listen to the [`"beforeExit"`](https://nodejs.org/api/process.html#event-beforeexit) and [`"exit"`](https://nodejs.org/api/process.html#event-exit) events.

```ts
process.on("beforeExit", code => {
  console.log(`Event loop is empty!`);
});

process.on("exit", code => {
  console.log(`Process is exiting with code ${code}`);
});
```

---

See [Docs > API > Utils](https://bun.com/docs/api/utils) for more useful utilities.


---
name: Listen for CTRL+C
---

The `ctrl+c` shortcut sends an _interrupt signal_ to the running process. This signal can be intercepted by listening for the `SIGINT` event. If you want to close the process, you must explicitly call `process.exit()`.

```ts
process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  process.exit();
});
```

---

See [Docs > API > Utils](https://bun.com/docs/api/utils) for more useful utilities.


---
name: Read from stdin
---

For CLI tools, it's often useful to read from `stdin`. In Bun, the `console` object is an `AsyncIterable` that yields lines from `stdin`.

```ts#index.ts
const prompt = "Type something: ";
process.stdout.write(prompt);
for await (const line of console) {
  console.log(`You typed: ${line}`);
  process.stdout.write(prompt);
}
```

---

Running this file results in a never-ending interactive prompt that echoes whatever the user types.

```sh
$ bun run index.ts
Type something: hello
You typed: hello
Type something: hello again
You typed: hello again
```

---

Bun also exposes stdin as a `BunFile` via `Bun.stdin`. This is useful for incrementally reading large inputs that are piped into the `bun` process.

There is no guarantee that the chunks will be split line-by-line.

```ts#stdin.ts
for await (const chunk of Bun.stdin.stream()) {
  // chunk is Uint8Array
  // this converts it to text (assumes ASCII encoding)
  const chunkText = Buffer.from(chunk).toString();
  console.log(`Chunk: ${chunkText}`);
}
```

---

This will print the input that is piped into the `bun` process.

```sh
$ echo "hello" | bun run stdin.ts
Chunk: hello
```

---

See [Docs > API > Utils](https://bun.com/docs/api/utils) for more useful utilities.


---
name: Spawn a child process and communicate using IPC
---

Use [`Bun.spawn()`](https://bun.com/docs/api/spawn) to spawn a child process. When spawning a second `bun` process, you can open a direct inter-process communication (IPC) channel between the two processes.

{%callout%}
**Note** — This API is only compatible with other `bun` processes. Use `process.execPath` to get a path to the currently running `bun` executable.
{%/callout%}

```ts#parent.ts
const child = Bun.spawn(["bun", "child.ts"], {
  ipc(message) {
    /**
     * The message received from the sub process
     **/
  },
});
```

---

The parent process can send messages to the subprocess using the `.send()` method on the returned `Subprocess` instance. A reference to the sending subprocess is also available as the second argument in the `ipc` handler.

```ts#parent.ts
const childProc = Bun.spawn(["bun", "child.ts"], {
  ipc(message, childProc) {
    /**
     * The message received from the sub process
     **/
    childProc.send("Respond to child")
  },
});

childProc.send("I am your father"); // The parent can send messages to the child as well
```

---

Meanwhile the child process can send messages to its parent using with `process.send()` and receive messages with `process.on("message")`. This is the same API used for `child_process.fork()` in Node.js.

```ts#child.ts
process.send("Hello from child as string");
process.send({ message: "Hello from child as object" });

process.on("message", (message) => {
  // print message from parent
  console.log(message);
});
```

---

All messages are serialized using the JSC `serialize` API, which allows for the same set of [transferrable types](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) supported by `postMessage` and `structuredClone`, including strings, typed arrays, streams, and objects.

```ts#child.ts
// send a string
process.send("Hello from child as string");

// send an object
process.send({ message: "Hello from child as object" });
```

---

See [Docs > API > Child processes](https://bun.com/docs/api/spawn) for complete documentation.


---
name: Get the process uptime in nanoseconds
---

Use `Bun.nanoseconds()` to get the total number of nanoseconds the `bun` process has been alive.

```ts
Bun.nanoseconds();
```

---

See [Docs > API > Utils](https://bun.com/docs/api/utils) for more useful utilities.


