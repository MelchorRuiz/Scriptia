// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import preact from '@astrojs/preact';
import node from '@astrojs/node';
import clerk from "@clerk/astro";

import { esMX } from '@clerk/localizations'
import { dark } from '@clerk/themes'

// https://astro.build/config
export default defineConfig({
  integrations: [ 
    preact(), 
    clerk({
      localization: esMX,
      appearance: {
        baseTheme: dark,
      },
    }),
  ],
  vite: { plugins: [tailwindcss()], },
  adapter: node({ mode: 'standalone' }),
  output: 'server',
});