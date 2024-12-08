# @aminnairi/tsconfig

## Usage

### Node

#### Requirements

- [Node](https://nodejs.org/)
- [NPM](https://npmjs.com)

#### Example

```bash
npx jsr run jsr:@aminnairi/tsconfig
```

### Deno

#### Requirements

- [Deno](https://deno.com)

#### Example

```bash
deno run -A jsr:@aminnairi/tsconfig
```

Stricter version

```bash
deno run -RWE=TERM,TERM_PROGRAM,TMPDIR,TMP,TEMP jsr:@aminnairi/tsconfig
```

Verbose version

```bash
deno run --allow-read --allow-write --allow-env=TERM,TERM_PROGRAM,TMPDIR,TMP,TEMP jsr:@aminnairi/tsconfig
```