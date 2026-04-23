# QA Automation Framework 🎭

> Framework profesional E2E construido con **Playwright + TypeScript** y pruebas de carga con **k6**.  
> Aplicación bajo prueba: [SauceDemo](https://www.saucedemo.com)

---

## 🏗️ Arquitectura del proyecto

```
qa-automation-framework/
├── src/
│   ├── pages/          # Page Object Models (POM)
│   ├── fixtures/       # Fixtures personalizados de Playwright
│   ├── utils/          # Helpers y utilidades genéricas
│   └── data/           # Datos de prueba y constantes
├── tests/
│   ├── e2e/            # Tests end-to-end con Playwright
│   └── performance/    # Scripts de carga con k6
├── .github/workflows/  # Pipelines de CI/CD
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Inicio rápido

### Prerrequisitos
- Node.js 18+
- npm 9+
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) (solo para tests de carga)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd qa-automation-framework

# 2. Instalar dependencias
npm install

# 3. Instalar browsers de Playwright
npx playwright install --with-deps

# 4. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores si es necesario
```

### Correr los tests

```bash
# Todos los tests (3 browsers en paralelo)
npm test

# Solo tests de smoke (críticos, rápidos)
npm run test:smoke

# Solo tests de regresión
npm run test:regression

# Ver el reporte HTML interactivo
npm run test:report

# Modo debug (paso a paso en browser)
npm run test:debug

# Modo UI de Playwright (interfaz visual)
npm run test:ui

# Prueba de carga con k6
npm run test:load
```

---

## 📋 Patrones implementados

| Patrón | Descripción |
|--------|-------------|
| **Page Object Model** | Encapsula selectores y acciones por página |
| **Custom Fixtures** | Provee objetos preconstruidos a cada test |
| **Data-Driven** | Datos centralizados en `src/data/` |
| **Test Tagging** | `@smoke` y `@regression` para ejecuciones selectivas |
| **Environment Config** | Variables de entorno via `.env` + `dotenv` |

---

## 🌐 Browsers configurados

- ✅ Chromium (Desktop Chrome)
- ✅ Firefox
- ✅ WebKit (Safari)  
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

---

## 📊 Reportes

Después de correr los tests:

```bash
# Abrir reporte HTML interactivo
npx playwright show-report

# JSON con todos los resultados (para CI/dashboards)
cat playwright-report/results.json
```

---

## 🔧 CI/CD

El framework está preparado para integrarse con GitHub Actions.  
Ver `.github/workflows/playwright.yml` para la configuración completa.
