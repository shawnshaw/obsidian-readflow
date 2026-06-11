import esbuild from "esbuild";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname);
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));
const watch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: [resolve(root, "src/main.js")],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2018",
  sourcemap: false,
  legalComments: "none",
  outfile: resolve(root, "main.js"),
  banner: {
    js: `/*
 * ${manifest.name} v${manifest.version}
 * GENERATED FILE — DO NOT EDIT. Edit src/main.js and run: npm run build
 * Author: ${manifest.author} | License: MIT
 */`,
  },
  external: ["obsidian", "electron"],
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("[readflow] watching src/main.js → main.js");
} else {
  await esbuild.build(buildOptions);
}
