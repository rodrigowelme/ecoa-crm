import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === 'string');
      if (messages.length) return messages.join('; ');
    }
    if (!error.response) return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
