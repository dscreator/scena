import type { ChatKitOptions } from "@openai/chatkit";

/**
 * Shared ChatKit appearance + composer config (hosted Agent Builder).
 * Wired into `useChatKit()` in `ChatKitPane.tsx` alongside `api.getClientSecret`.
 */
export const chatKitUiOptions: Pick<ChatKitOptions, "theme" | "composer" | "startScreen"> = {
  theme: {
    colorScheme: "light",
    radius: "round",
    density: "normal",
    color: {
      grayscale: {
        hue: 73,
        tint: 1,
      },
    },
    typography: {
      baseSize: 16,
      fontFamily:
        '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontFamilyMono:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
      fontSources: [
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2",
          weight: 400,
          style: "normal",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-RegularItalic.woff2",
          weight: 400,
          style: "italic",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Medium.woff2",
          weight: 500,
          style: "normal",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-MediumItalic.woff2",
          weight: 500,
          style: "italic",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Semibold.woff2",
          weight: 600,
          style: "normal",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-SemiboldItalic.woff2",
          weight: 600,
          style: "italic",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Bold.woff2",
          weight: 700,
          style: "normal",
          display: "swap",
        },
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-BoldItalic.woff2",
          weight: 700,
          style: "italic",
          display: "swap",
        },
      ],
    },
  },
  composer: {
    placeholder: "Which strategic customer would you like to be briefed about?",
    attachments: {
      enabled: true,
      maxCount: 5,
      maxSize: 10_485_760,
    },
    tools: [
      {
        id: "search_docs",
        label: "Search docs",
        shortLabel: "Docs",
        placeholderOverride: "Search documentation",
        icon: "book-open",
        pinned: true,
      },
      {
        id: "search_web",
        label: "Search web",
        shortLabel: "Web",
        placeholderOverride: "Search the web",
        icon: "globe",
        pinned: false,
      },
    ],
  },
  startScreen: {
    greeting: "",
    prompts: [],
  },
};
