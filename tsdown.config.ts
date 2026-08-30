import { defineConfig } from 'tsdown'

const PKG = 'dsh-sidebar-gdhighlight'

/**
 * Two different module worlds, two builds:
 *
 * - host  (`lib/index.js`, `lib/gdscript-lang.js`): plain ESM for Node.
 * - client(`lib/client.js`): a CJS factory wrapped in
 *   `window.__ModuleLoader__.load({ id, factory })`, which is the registration
 *   contract dsh-client-modules requires — a bundle that is fetched but never
 *   calls `load` is reported as "loaded without registering".
 *
 * The client keeps React external (the platform seeds it) but bundles
 * CodeMirror: dsh-better-sidebar bundles its own private copy and exposes no
 * CodeMirror through its service, so there is no shared instance to require.
 */
export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'gdscript-lang': 'src/gdscript-lang.ts',
    },
    outDir: 'lib',
    format: ['esm'],
    dts: true,
    clean: false,
    external: [
      '@codemirror/language',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/commands',
      '@lezer/highlight',
      'react',
      'react-dom',
      'dsh-better-sidebar',
    ],
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  {
    entry: { client: 'src/client.tsx' },
    outDir: 'lib',
    format: ['cjs'],
    dts: true,
    clean: false,
    // Platform seed words only; everything else is bundled.
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    // tsdown externalizes `dependencies` by default, but the client bundle
    // must carry its own CodeMirror (the platform serves only `client.js`, so
    // code-split chunks are impossible and the editor cannot be lazy-loaded).
    noExternal: [/^@codemirror\//, /^@lezer\//],
    // Bundling CodeMirror makes this the largest cost the plugin adds, so ship
    // it minified: parse/compile time scales with source size.
    minify: true,
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
    // The CJS factory body relies on ambient `module`/`exports`, which a
    // classic <script> has to declare itself.
    banner: `window.__ModuleLoader__.load({
  id: ${JSON.stringify(PKG)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;`,
    footer: `return module.exports;
  },
});`,
  },
])
