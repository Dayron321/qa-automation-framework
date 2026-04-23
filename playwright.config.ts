import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// ─── Carga de variables de entorno ───────────────────────────────────────────
// Si existe un archivo .env.local lo usa primero (configuración personal del dev).
// Si no existe, cae al archivo .env estándar del proyecto.
// Esto permite a cada desarrollador tener su propia configuración sin tocar .env.
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: false });
dotenv.config({ path: path.resolve(__dirname, '.env') });

// ─── URL base de la aplicación bajo prueba ────────────────────────────────────
// Por defecto apunta a SauceDemo. Se puede sobreescribir con BASE_URL en .env
// para apuntar a staging o producción sin modificar este archivo.
const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';

// ─── Configuración principal de Playwright ────────────────────────────────────
export default defineConfig({

  // ─── Directorio raíz donde viven los tests E2E ────────────────────────────
  testDir: './tests/e2e',

  // ─── Patrón de archivos que Playwright reconoce como suites de tests ───────
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],

  // ─── Paralelismo ─────────────────────────────────────────────────────────────
  // fullyParallel: cada test dentro de un mismo archivo corre en paralelo
  fullyParallel: true,
  // workers: 3 procesos paralelos — balance óptimo para CI local y remoto.
  // Se puede sobreescribir con: npx playwright test --workers=N
  workers: 3,

  // ─── Estrategia de reintentos ────────────────────────────────────────────────
  // En CI reintenta tests fallidos 2 veces para resistir flakiness transitorio.
  // En local no reintenta para mantener ciclo de feedback rápido.
  retries: process.env.CI ? 2 : 0,

  // ─── Tiempo máximo por aserción ──────────────────────────────────────────────
  expect: {
    timeout: 10_000, // 10 segundos para que una aserción se cumpla
  },

  // ─── Tiempo máximo por test ───────────────────────────────────────────────────
  // Si un test supera los 60 s, Playwright lo marca como fallido automáticamente.
  timeout: 60_000,

  // ─── Evita test.only en CI (protección contra errores de merge) ──────────────
  forbidOnly: !!process.env.CI,

  // ─── Reportes ────────────────────────────────────────────────────────────────
  // Se ejecutan TODOS los reporters en cada corrida. En un pipeline CI puedes
  // publicar playwright-report/ como artefacto para revisión post-ejecución.
  reporter: [
    // Reporte HTML interactivo — ábrelo con: npm run test:report
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never', // No abre el browser automáticamente al terminar la suite
    }],
    // Reporte JSON — consumible por dashboards externos, Allure, o scripts CI/CD
    ['json', {
      outputFile: 'playwright-report/results.json',
    }],
  ],

  // ─── Configuración compartida por TODOS los proyectos ────────────────────────
  use: {
    // URL base — permite usar rutas relativas en los tests: await page.goto('/inventory.html')
    baseURL: BASE_URL,

    // ─── Capturas y evidencia ─────────────────────────────────────────────────
    // Screenshot: solo en fallo → no llena el disco en suites largas
    screenshot: 'only-on-failure',
    // Video: solo conserva los del primer reintento fallido (retain-on-failure)
    video: 'retain-on-failure',
    // Trace: guarda el trace completo solo en el primer reintento para depuración avanzada
    // Ver con: npx playwright show-trace trace.zip
    trace: 'on-first-retry',

    // ─── Tiempos de espera de red y acciones ─────────────────────────────────
    navigationTimeout: 30_000, // Tiempo máximo para que una navegación complete
    actionTimeout:    15_000,  // Tiempo máximo para que un click/fill complete

    // ─── Viewport por defecto (desktop 16:9) ─────────────────────────────────
    viewport: { width: 1280, height: 720 },

    // ─── Locale y zona horaria ────────────────────────────────────────────────
    locale:       'es-MX',
    timezoneId:   'America/Mexico_City',
  },

  // ─── Directorio de salida de artefactos (screenshots, videos, traces) ────────
  outputDir: 'test-results/',

  // ─── Proyectos — un proyecto = un navegador/dispositivo ──────────────────────
  // Cada proyecto hereda la configuración "use" global y puede sobreescribirla.
  projects: [

    // ── Desktop Chromium (Chrome / Edge) ─────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // headless: false  ← descomenta para ver el browser durante ejecución
      },
    },

    // ── Desktop Firefox ───────────────────────────────────────────────────────
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // ── Desktop WebKit (Safari en macOS / iOS) ────────────────────────────────
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // ── Mobile Chrome — simula un Pixel 5 (Android) ───────────────────────────
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    // ── Mobile Safari — simula un iPhone 12 (iOS) ────────────────────────────
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],

  // ─── Setup global (se ejecuta UNA sola vez antes de todos los tests) ─────────
  // Ideal para: crear usuarios en BD, hacer seed de datos, obtener tokens de auth.
  // globalSetup: './global-setup.ts',

  // ─── Teardown global (se ejecuta UNA sola vez después de todos los tests) ────
  // Ideal para: limpiar datos de prueba, cerrar conexiones a BD, revocar tokens.
  // globalTeardown: './global-teardown.ts',
});
