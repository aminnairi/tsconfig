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
      description: "With exactOptionalPropertyTypes enabled, TypeScript applies stricter rules around how it handles properties on type or interfaces which have a ? prefix.",
      checked: true,
      value: "exactOptionalPropertyTypes"
    },
    {
      name: "No Fallthrough Cases In Switch",
      description: "Report errors for fallthrough cases in switch statements. Ensures that any non-empty case inside a switch statement includes either break, return, or throw. This means you won’t accidentally ship a case fallthrough bug.",
      checked: true,
      value: "noFallthroughCasesInSwitch"
    },
    {
      name: "No Implicit Any",
      description: "In some cases where no type annotations are present, TypeScript will fall back to a type of any for a variable when it cannot infer the type.",
      checked: true,
      value: "noImplicitAny"
    },
    {
      name: "No Implicit Override",
      description: "When working with classes which use inheritance, it’s possible for a sub-class to get “out of sync” with the functions it overloads when they are renamed in the base class.",
      checked: true,
      value: "noImplicitOverride"
    },
    {
      name: "No Implicit Returns",
      description: "When enabled, TypeScript will check all code paths in a function to ensure they return a value.",
      checked: true,
      value: "noImplicitReturns"
    },
    {
      name: "No Implicit This",
      description: "Raise error on ‘this’ expressions with an implied ‘any’ type.",
      checked: true,
      value: "noImplicitThis"
    },
    {
      name: "No Property Access From Index Signature",
      description: "This setting ensures consistency between accessing a field via the “dot” (obj.key) syntax, and “indexed” (obj['key']) and the way which the property is declared in the type.",
      checked: true,
      value: "noPropertyAccessFromIndexSignature"
    },
    {
      name: "No Unchecked Indexed Access",
      description: "TypeScript has a way to describe objects which have unknown keys but known values on an object, via index signatures.",
      checked: true,
      value: "noUncheckedIndexedAccess"
    },
    {
      name: "No Unused Locals",
      description: "Report errors on unused local variables.",
      checked: true,
      value: "noUnusedLocals"
    },
    {
      name: "No Unused Parameters",
      description: "Report errors on unused parameters in functions.",
      checked: true,
      value: "noUnusedParameters"
    },
    {
      name: "Strict",
      description: "The strict flag enables a wide range of type checking behavior that results in stronger guarantees of program correctness. Turning this on is equivalent to enabling all of the strict mode family options, which are outlined below. You can then turn off individual strict mode family checks as needed.",
      checked: true,
      value: "strict"
    },
    {
      name: "Strict Bind Call Apply",
      description: "When set, TypeScript will check that the built-in methods of functions call, bind, and apply are invoked with correct argument for the underlying function.",
      checked: true,
      value: "strictBindCallApply"
    },
    {
      name: "Strict Built In Iterator Return",
      description: "Built-in iterators are instantiated with a `TReturn` type of undefined instead of `any`.",
      checked: true,
      value: "strictBuiltinIteratorReturn"
    },
    {
      name: "Strict Function Types",
      description: "When enabled, this flag causes functions parameters to be checked more correctly.",
      checked: true,
      value: "strictFunctionTypes"
    },
    {
      name: "Strict Null Checks",
      description: "When strictNullChecks is false, null and undefined are effectively ignored by the language. This can lead to unexpected errors at runtime. When strictNullChecks is true, null and undefined have their own distinct types and you’ll get a type error if you try to use them where a concrete value is expected.",
      checked: true,
      value: "strictNullChecks"
    },
    {
      name: "Strict Property Initialization",
      description: "When set to true, TypeScript will raise an error when a class property was declared but not set in the constructor.",
      checked: true,
      value: "strictPropertyInitialization"
    },
    {
      name: "Use Unknown In Catch Variables",
      description: "In TypeScript 4.0, support was added to allow changing the type of the variable in a catch clause from any to unknown. Allowing for code like:",
      checked: true,
      value: "useUnknownInCatchVariables"
    },
    {
      value: "noErrorTruncation",
      description: "Do not truncate error messages.",
      checked: true,
      name: "No Error Truncation"
    },
  ];

  const all = choices.map(choice => {
    return choice.value
  });

  const tsconfigCompilerOptions = args.all ? all : await checkbox({
    message: "TypeScript Compiler Options",
    loop: false,
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