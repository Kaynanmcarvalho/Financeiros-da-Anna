import { format, formatDistanceToNow, isToday, isPast, isBefore, isAfter, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore Timestamp to JS Date.
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Format a date as "14 de jul. de 2026" (pt-BR).
 */
export function formatDate(date: Date): string {
  return format(date, "dd 'de' MMM. 'de' yyyy", { locale: ptBR });
}

/**
 * Format a date as "14/07/2026".
 */
export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Format month and year: "Julho 2026".
 */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Format as month key: "2026-07".
 */
export function formatMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Get relative time: "há 3 dias".
 */
export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

export {
  isToday,
  isPast,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
};
