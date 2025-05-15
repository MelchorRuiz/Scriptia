// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import preact from '@astrojs/preact';
import node from '@astrojs/node';
import clerk from "@clerk/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [ preact(), clerk() ],
  vite: { plugins: [tailwindcss()], },
  adapter: node({ mode: 'standalone' }),
  output: 'server',
});