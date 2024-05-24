import { defineConfig } from 'tsup';
import glob from 'tiny-glob';

export default defineConfig(async () => ({
  entry: await glob('src/**/*.ts'),
  sourcemap: false,
  bundle: false,
  format: ['cjs', 'esm'],
  legacyOutput: true,
  cjsInterop: true,
  treeshake: true,
  shims: true,
  external: [
    'mysql2',
    '@nestjs/core',
    '@prisma/client',
    'express',
    'next',
    'pg'
  ],
  dts: true,
  clean: true,
  splitting: false,
  esbuildOptions: (options, context) => {
    options.outbase = './';
  }
}));
