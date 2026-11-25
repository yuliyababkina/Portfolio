import type { StorybookConfig } from '@storybook/react-vite';
import { optimizeDeps } from '../optimize-deps.ts';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite",
  async viteFinal(config) {
    // Storybook adds its own preview/addon entries; preserve those as well.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [...new Set([...(config.optimizeDeps?.include ?? []), ...optimizeDeps.include])],
    };
    return config;
  }
};
export default config;
