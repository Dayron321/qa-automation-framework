/**
 * @file LoginPage.ts
 * @description Page Object Model para la página de login de SauceDemo (/).
 * Encapsula todos los selectores e interacciones del formulario de autenticación,
 * exponiendo una API limpia que los tests consumen sin conocer el HTML interno.
 */

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { type UserCredentials } from '@data/users';
import { ROUTES } from '@data/routes';

export class LoginPage extends BasePage {

  // ─── Selectores privados ──────────────────────────────────────────────────
  // Se usan atributos data-test porque son estables ante cambios de estilos/estructura.
  // Son readonly para prevenir reasignación accidental dentro de la clase.
  private readonly usernameInput: Locator;
  private readonly passwordInput:  Locator;
  private readonly loginButton:    Locator;
  private readonly errorMessage:   Locator;

  /**
   * @param page - Instancia de `Page` de Playwright inyectada desde el test/fixture
   */
  constructor(page: Page) {
    super(page);

    // Inicializamos los locators en el constructor para reutilizarlos en cada método
    // sin re-buscar el elemento en el DOM en cada llamada.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton   = page.locator('[data-test="login-button"]');
    this.errorMessage  = page.locator('[data-test="error"]');
  }

  // ─── Navegación ───────────────────────────────────────────────────────────

  /**
   * Navega directamente a la página de login.
   * Útil al inicio de cada test para garantizar un estado limpio.
   */
  async goto(): Promise<void> {
    await this.navigate(ROUTES.LOGIN);
    // Esperamos el campo de usuario para confirmar que la página cargó correctamente
    await this.waitForVisible(this.usernameInput);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Completa el formulario de login y hace clic en el botón de acceso.
   * Acepta un objeto `UserCredentials` para desacoplar los datos del flujo de UI.
   *
   * No hace aserción del resultado: el test decide qué esperar después
   * (redirección al inventario, mensaje de error, etc.).
   *
   * @param credentials - Objeto con username y password. Ver USERS en @data/users
   *
   * @example
   *   await loginPage.login(USERS.STANDARD);
   *   await loginPage.login(USERS.LOCKED);
   */
  async login(credentials: UserCredentials): Promise<void> {
    // Limpiamos antes de llenar para evitar concatenar texto si el campo ya tiene valor
    await this.usernameInput.clear();
    await this.usernameInput.fill(credentials.username);

    await this.passwordInput.clear();
    await this.passwordInput.fill(credentials.password);

    await this.loginButton.click();
  }

  // ─── Verificaciones ───────────────────────────────────────────────────────

  /**
   * Retorna el texto del mensaje de error visible en el formulario.
   * Debe llamarse solo cuando se sabe que el error va a estar presente;
   * de lo contrario Playwright lanzará un timeout.
   *
   * @returns Texto completo del banner de error (ej: 'Epic sadface: ...')
   *
   * @example
   *   const msg = await loginPage.getErrorMessage();
   *   expect(msg).toBe(MESSAGES.LOGIN_ERROR_LOCKED_USER);
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return this.errorMessage.innerText();
  }

  /**
   * Comprueba si el banner de error está actualmente visible en la UI.
   * No lanza timeout si no existe — retorna false directamente.
   *
   * @returns `true` si el error es visible, `false` en caso contrario
   *
   * @example
   *   expect(await loginPage.isErrorVisible()).toBe(true);
   */
  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
