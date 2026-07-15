const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format cents (integer) to BRL currency string.
 * @example formatCurrency(123456) → "R$ 1.234,56"
 */
export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/**
 * Parse a BRL currency string to cents (integer).
 * Handles inputs like "1.234,56", "R$ 1.234,56", "1234.56", "1234,56".
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol, spaces, and dots (thousands separator)
  const cleaned = value
    .replace(/R\$\s?/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;

  return Math.round(parsed * 100);
}

/**
 * Format a raw input string as a BRL currency display (without R$ prefix).
 * Used for live input masking.
 * @example maskCurrencyInput("123456") → "1.234,56"
 */
export function maskCurrencyInput(rawDigits: string): string {
  // Remove all non-digit characters
  const digits = rawDigits.replace(/\D/g, '');
  if (!digits) return '0,00';

  const cents = parseInt(digits, 10);
  const reais = (cents / 100).toFixed(2);

  // Format with pt-BR separators
  const [intPart, decPart] = reais.split('.');
  const formattedInt = intPart?.replace(/\B(?=(\d{3})+(?!\d))/g, '.') ?? '0';

  return `${formattedInt},${decPart ?? '00'}`;
}
