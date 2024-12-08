import { checkbox, input, confirm } from "@inquirer/prompts"
import { exists } from "@std/fs"
import { parseArgs } from "@std/cli";

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["all", "override", "merge"],
    string: ["path"],
    default: {
      path: undefined,
      all: undefined,
      override: undefined,
      merge: undefined
    },
    negatable: ["merge"]
  });

  const choices = [
    {
      name: "Exact Optional Property Types",
      checked: true,
      value: "exactOptionalPropertyTypes"
    },
    {
      name: "No Fallthrough Cases In Switch",
      checked: true,
      value: "noFallthroughCasesInSwitch"
    },
    {
      name: "No Implicit Any",
      checked: true,
      value: "noImplicitAny"
    },
    {
      name: "No Implicit Override",
      checked: true,
      value: "noImplicitOverride"
    },
    {
      name: "No Implicit Returns",
      checked: true,
      value: "noImplicitReturns"
    },
    {
      name: "No Implicit This",
      checked: true,
      value: "noImplicitThis"
    },
    {
      name: "No Property Access From Index Signature",
      checked: true,
      value: "noPropertyAccessFromIndexSignature"
    },
    {
      name: "No Unchecked Indexed Access",
      checked: true,
      value: "noUncheckedIndexedAccess"
    },
    {
      name: "No Unused Locals",
      checked: true,
      value: "noUnusedLocals"
    },
    {
      name: "No Unused Parameters",
      checked: true,
      value: "noUnusedParameters"
    },
    {
      name: "Strict",
      checked: true,
      value: "strict"
    },
    {
      name: "Strict Bind Call Apply",
      checked: true,
      value: "strictBindCallApply"
    },
    {
      name: "Strict Built In Iterator Return",
      checked: true,
      value: "strictBuiltinIteratorReturn"
    },
    {
      name: "Strict Function Types",
      checked: true,
      value: "strictFunctionTypes"
    },
    {
      name: "Strict Null Checks",
      checked: true,
      value: "strictNullChecks"
    },
    {
      name: "Strict Property Initialization",
      checked: true,
      value: "strictPropertyInitialization"
    },
    {
      name: "Use Unknown In Catch Variables",
      checked: true,
      value: "useUnknownInCatchVariables"
    },
    {
      value: "noErrorTruncation",
      description: "Disable truncating types in error messages.",
      checked: true,
      name: "No Error Truncation"
    },
  ];

  const all = choices.map(choice => {
    return choice.value
  });

  const tsconfigCompilerOptions = args.all ? all : await checkbox({
    message: "TypeScript Compiler Options",
    choices
  });

  const path = args.path ?? await input({
    message: "Name of the file to write the configuration to",
    default: "tsconfig.json",
    required: true
  });

  const compilerOptions = Object.fromEntries(tsconfigCompilerOptions.map(option => [option, true]))

  const tsconfig = {
    compilerOptions
  }

  const tsconfigAlreadyExists = await exists(path);

  if (tsconfigAlreadyExists) {
    const overrideFileAtPath = args.override ? true : await confirm({
      message: `A file at path ${path} already exists, override?`,
      default: false
    });

    if (!overrideFileAtPath) {
      console.log("Nothing done, exiting now.");
      return;
    }

    const mergeFileAtPath = args.merge ? true : args.merge === false ? false : await confirm({
      message: "Merge existing configuration?",
      default: true
    });

    if (!mergeFileAtPath) {
      const textEncoder = new TextEncoder();
      const tsconfigContent = textEncoder.encode(JSON.stringify(tsconfig, null, 2));

      await Deno.writeFile(path, tsconfigContent);
      console.log(`Override the configuration at ${path}.`);

      return;
    }

    const encodedTsconfig = await Deno.readFile(path);
    const textDecoder = new TextDecoder();
    const decodedTsconfig = textDecoder.decode(encodedTsconfig);
    const tsconfigAtPath = JSON.parse(decodedTsconfig);

    const mergedTsconfig = {
      ...tsconfigAtPath,
      ...tsconfig,
      compilerOptions: {
        ...tsconfigAtPath?.compilerOptions ?? {},
        ...tsconfig.compilerOptions
      }
    }

    const textEncoder = new TextEncoder();
    const encodedMergedTsconfig = textEncoder.encode(JSON.stringify(mergedTsconfig, null, 2));
    await Deno.writeFile(path, encodedMergedTsconfig);
    console.log(`Merged configuration at path ${path}.`);
    return;
  }

  const textEncoder = new TextEncoder();
  const tsconfigContent = textEncoder.encode(JSON.stringify(tsconfig, null, 2));

  await Deno.writeFile(path, tsconfigContent);
  console.log(`Configuration written at path ${path}.`);
}

await main().catch(error => {
  console.error(error);
});