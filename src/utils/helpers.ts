/**
 * @file helpers.ts
 * @description Funciones utilitarias reutilizables para los tests de Playwright.
 * Estas funciones abstraen operaciones comunes y reducen la duplicación de código
 * en los Page Objects y specs.
 */

import { type Page } from '@playwright/test';

// ─── Navegación ───────────────────────────────────────────────────────────────

/**
 * Espera a que la URL actual del navegador contenga la ruta especificada.
 *
 * Útil tras acciones que disparan una redirección (ej: submit de formulario),
 * donde necesitamos confirmar que el navegador llegó a la página esperada
 * antes de continuar con las aserciones del test.
 *
 * @param page  - Instancia de `Page` de Playwright
 * @param route - Fragmento de ruta esperado en la URL (ej: '/inventory.html')
 *
 * @example
 *   await waitForNavigation(page, ROUTES.INVENTORY);
 */
export async function waitForNavigation(page: Page, route: string): Promise<void> {
  await page.waitForURL(`**${route}`, { waitUntil: 'domcontentloaded' });
}

// ─── Arrays ───────────────────────────────────────────────────────────────────

/**
 * Retorna un elemento aleatorio de un array tipado.
 *
 * Útil en tests de datos dinámicos donde se quiere probar con un producto
 * distinto en cada ejecución, aumentando la cobertura sin duplicar specs.
 *
 * @param array - Array de elementos de tipo `T` (debe tener al menos 1 elemento)
 * @returns     Un elemento aleatorio del array
 *
 * @throws {Error} Si el array está vacío
 *
 * @example
 *   const product = getRandomItem(productNames); // string aleatorio
 *   const user    = getRandomItem(testUsers);    // UserCredentials aleatoria
 */
export function getRandomItem<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('getRandomItem: el array no puede estar vacío.');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex] as T;
}

// ─── Formateo de datos ────────────────────────────────────────────────────────

/**
 * Convierte un precio formateado como string a número flotante.
 *
 * SauceDemo muestra los precios con el símbolo '$' (ej: '$29.99').
 * Esta función limpia el símbolo y convierte el valor a `number` para
 * poder hacer comparaciones numéricas en los tests de checkout.
 *
 * @param price - Precio como string con o sin símbolo de moneda (ej: '$29.99' | '29.99')
 * @returns       Precio como número flotante (ej: 29.99)
 *
 * @throws {Error} Si el string resultante no es un número válido
 *
 * @example
 *   formatPrice('$29.99')  // → 29.99
 *   formatPrice('$9.99')   // → 9.99
 *   formatPrice('29.99')   // → 29.99  (también funciona sin '$')
 */
export function formatPrice(price: string): number {
  // Elimina el símbolo de moneda '$' y cualquier espacio en blanco
  const cleaned = price.replace(/[$\s]/g, '');
  const parsed  = parseFloat(cleaned);

  if (isNaN(parsed)) {
    throw new Error(`formatPrice: no se puede convertir "${price}" a número.`);
  }

  return parsed;
}
