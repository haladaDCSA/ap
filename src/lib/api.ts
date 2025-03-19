// This is the existing code

import { AIModel } from './models';

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export async function sendMessage(
  messages: Message[],
  selectedModel: AIModel,
  apiKey?: string
): Promise<string> {
  const finalApiKey = apiKey || selectedModel.defaultApiKey;

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Astrology App'
      },
      body: JSON.stringify({
        model: selectedModel.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.image 
            ? [
                { type: 'text', text: msg.content },
                { type: 'image_url', image_url: msg.image }
              ]
            : msg.content
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'حدث خطأ في الاتصال');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('حدث خطأ في الاتصال بالنموذج. يرجى التحقق من مفتاح API والمحاولة مرة أخرى.');
  }
}

export async function convertSpeechToText(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getDecryptedApiKey()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to convert speech to text');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw error;
  }
}