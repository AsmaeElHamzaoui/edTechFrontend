import axios from 'axios';

export const parseApiError = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    
    // Si l'API renvoie un message detail global
    if (data.detail) {
      return data.detail;
    }

    // Si l'API renvoie des erreurs par champ (ex: DRF validation error)
    if (typeof data === 'object') {
      const messages = [];
      for (const key in data) {
        if (Array.isArray(data[key])) {
          messages.push(`${key}: ${data[key].join(', ')}`);
        } else {
          messages.push(`${key}: ${data[key]}`);
        }
      }
      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }
    
    return error.response.statusText || 'Une erreur est survenue avec le serveur.';
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur inattendue est survenue.';
};
