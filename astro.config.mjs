// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import preact from '@astrojs/preact';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: 'standalone'
  }),
  output: 'server',
});