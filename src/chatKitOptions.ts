import type { ChatKitOptions } from "@openai/chatkit";

/**
 * ChatKit UI for Customer Briefing Agent (hosted Agent Builder + getClientSecret).
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
      baseSize: 14,
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
    placeholder: "Type the name of one or more customers you would like a briefing on",
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
    models: [
      {
        id: "gpt-5",
        label: "gpt-5",
        description: "Balanced intelligence",
        default: true,
      },
      {
        id: "gpt-4.1",
        label: "gpt-4.1",
        description: "Strong general reasoning",
      },
      {
        id: "gpt-4o",
        label: "gpt-4o",
        description: "Fast multimodal",
      },
      {
        id: "o4-mini",
        label: "o4-mini",
        description: "Efficient deep reasoning",
      },
    ],
  },
  startScreen: {
    greeting:
      "Strategic customer briefing: key events, insights, and signals that matter. Understand implications fast so you can act with clarity and confidence.",
    prompts: [],
  },
};
