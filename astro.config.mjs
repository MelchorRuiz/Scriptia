// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import clerk from "@clerk/astro";

import { esMX } from '@clerk/localizations'
import { dark } from '@clerk/themes'

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    clerk({
      localization: esMX,
      appearance: {
        baseTheme: dark,
      },
    }),
  ],
  vite: { plugins: [tailwindcss()], },
  adapter: vercel(),
  output: 'server',
});