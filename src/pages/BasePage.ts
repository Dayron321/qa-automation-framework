/**
 * @file BasePage.ts
 * @description Clase base abstracta de la que heredan todos los Page Objects.
 * Centraliza comportamiento común (navegación, esperas, título) para evitar
 * duplicación. Ningún test instancia esta clase directamente.
 */

import { type Page, type Locator } from '@playwright/test';
import { waitForNavigation } from '@utils/helpers';

// ─── Clase base abstracta ─────────────────────────────────────────────────────
// Al ser abstracta no puede instanciarse directamente: obliga a las subclases
// a existir como representaciones concretas de una página real.
export abstract class BasePage {

  // Instancia de Page de Playwright — compartida con todas las subclases
  protected readonly page: Page;

  // ─── Timeout estándar para esperas de visibilidad ────────────────────────
  // 10 segundos es un balance razonable entre rapidez y tolerancia a latencia
  protected readonly DEFAULT_TIMEOUT = 10_000;

  /**
   * @param page - Instancia de `Page` de Playwright inyectada desde el fixture o test
   */
  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navegación ────────────────────────────────────────────────────────────

  /**
   * Navega a la ruta especificada y espera que el DOM esté listo.
   * Usa la baseURL configurada en playwright.config.ts, por lo que
   * basta con pasar rutas relativas: await this.navigate(ROUTES.INVENTORY)
   *
   * @param route - Ruta relativa (ej: '/inventory.html'). Ver ROUTES en @data/routes
   */
  async navigate(route: string): Promise<void> {
    await this.page.goto(route, { waitUntil: 'domcontentloaded' });
  }

  // ─── Esperas ───────────────────────────────────────────────────────────────

  /**
   * Espera hasta que el elemento referenciado por el locator sea visible en pantalla.
   * Lanza un error de Playwright si el elemento no aparece antes del timeout.
   *
   * @param locator - Locator de Playwright que apunta al elemento a esperar
   */
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });
  }

  // ─── Metadatos de página ───────────────────────────────────────────────────

  /**
   * Retorna el título de la pestaña del navegador para la página actual.
   * Útil en aserciones de alto nivel: expect(await page.getTitle()).toBe('...')
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Espera a que la URL actual contenga la ruta dada.
   * Delega en el helper centralizado para no duplicar lógica.
   *
   * @param route - Fragmento de URL esperado (ej: '/inventory.html')
   */
  protected async waitForUrl(route: string): Promise<void> {
    await waitForNavigation(this.page, route);
  }
}
