import { formatDistance } from 'date-fns';

export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return formatDistance(date, new Date(), { addSuffix: true });
};
