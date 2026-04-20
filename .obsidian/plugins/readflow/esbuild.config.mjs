import esbuild from "esbuild";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname);
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));

await esbuild.build({
  entryPoints: [resolve(root, "src/main.js")],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2018",
  sourcemap: false,
  legalComments: "none",
  outfile: resolve(root, "main.js"),
  banner: {
    js: `/*\n * ${manifest.name} v${manifest.version} — generated bundle (esbuild)\n * Source of truth: src/main.js\n * Author: ${manifest.author} | License: MIT\n */`
  },
  external: ["obsidian", "electron"],
});
