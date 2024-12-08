# @aminnairi/tsconfig

Terminal application to generate sensible defaults for your TypeScript compiler options

### Requirements

- [Deno](https://deno.com)

### Usage

Hand of God version

```bash
deno run -A jsr:@aminnairi/tsconfig
```

Hardened version

```bash
deno run -RWE=TERM,TERM_PROGRAM,TMPDIR,TMP,TEMP jsr:@aminnairi/tsconfig
```

Hardened & verbose version

```bash
deno run --allow-read --allow-write --allow-env=TERM,TERM_PROGRAM,TMPDIR,TMP,TEMP jsr:@aminnairi/tsconfig
```