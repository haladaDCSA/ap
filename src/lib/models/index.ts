export interface AIModel {
  id: string;
  name: string;
  model: string;
  defaultApiKey: string;
  sections: string[];
  apiKey?: string; // Optional API key specific to this model
}

export const models: AIModel[] = [
  {
    id: 'qwen-coder',
    name: 'Qwen Coder 32B',
    model: 'qwen/qwen-2.5-coder-32b-instruct:free',
    defaultApiKey: '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',
    sections: ['interpretation', 'astro']
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    model: 'deepseek/deepseek-r1-distill-qwen-32b:free',
    defaultApiKey: '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',
    sections: ['compatibility', 'spiritual']
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    defaultApiKey: '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',
    sections: ['political', 'horoscope']
  },
  {
    id: 'gemma-3',
    name: 'Gemma 3 4B',
    model: 'google/gemma-3-4b-it:free',
    defaultApiKey: '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',
    sections: ['chat', 'interpretation']
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    model: 'deepseek/deepseek-chat:free',
    defaultApiKey: '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',
    sections: ['chat', 'spiritual', 'compatibility']
  }
];
