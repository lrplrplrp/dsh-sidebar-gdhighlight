import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'gdscript-lang': 'src/gdscript-lang.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: [
    '@codemirror/language',
    '@lezer/highlight',
    'react',
    'react-dom',
    'dsh-better-sidebar',
  ],
})
