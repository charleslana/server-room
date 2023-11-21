import { faker } from '@faker-js/faker';

export const generateRandomString = (count: number): string => {
  return faker.string.alphanumeric(count);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
