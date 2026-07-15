/**
 * Returns a greeting based on the current hour.
 * 05h–12h → "Bom dia, {nome}"
 * 12h–18h → "Boa tarde, {nome}"
 * 18h–24h → "Boa noite, {nome}"
 * 00h–05h → "Boa madrugada, {nome}"
 */
export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting = '';

  if (hour >= 5 && hour < 12) {
    greeting = 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde';
  } else if (hour >= 18 && hour < 24) {
    greeting = 'Boa noite';
  } else {
    greeting = 'Boa madrugada';
  }

  return name ? `${greeting}, ${name}` : greeting;
}
