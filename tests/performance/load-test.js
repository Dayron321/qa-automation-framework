// tests/performance/load-test.js
// Script de k6 para pruebas de carga contra SauceDemo
// k6 usa JavaScript puro (no TypeScript) — es independiente del runtime de Node
//
// Para correr: npm run test:load
// Para instalar k6: https://grafana.com/docs/k6/latest/set-up/install-k6/

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Métricas personalizadas ───────────────────────────────────────────────
// Permiten rastrear KPIs específicos de tu app más allá de las métricas built-in
const errorRate    = new Rate('error_rate');        // % de errores HTTP
const loginLatency = new Trend('login_page_latency'); // P50/P90/P99 de latencia

// ─── Escenarios de carga ───────────────────────────────────────────────────
// stages: rampa de usuarios virtuales (VUs) a lo largo del tiempo
export const options = {
  stages: [
    // Fase 1: Calentamiento — sube gradualmente a 10 VUs en 30s
    { duration: '30s', target: 10 },
    // Fase 2: Carga sostenida — mantiene 10 VUs durante 1 minuto
    { duration: '1m', target: 10 },
    // Fase 3: Pico — sube a 25 VUs para simular tráfico pico
    { duration: '30s', target: 25 },
    // Fase 4: Bajada — baja a 0 VUs suavemente
    { duration: '30s', target: 0 },
  ],

  // ─── Umbrales de aceptación (SLAs) ────────────────────────────────────
  // El test falla automáticamente si alguno de estos no se cumple
  thresholds: {
    // 95% de las requests deben completar en menos de 2 segundos
    http_req_duration: ['p(95)<2000'],
    // La tasa de errores debe ser menor al 1%
    error_rate: ['rate<0.01'],
    // Latencia del login: P99 menor a 3 segundos
    login_page_latency: ['p(99)<3000'],
  },
};

// ─── Función principal ejecutada por cada VU en cada iteración ────────────
export default function () {
  const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

  // Request GET a la página de login
  const res = http.get(BASE_URL, {
    tags: { name: 'LoginPage' }, // tag para agrupar en los reportes
  });

  // Registrar latencia en nuestra métrica personalizada
  loginLatency.add(res.timings.duration);

  // ─── Validaciones (checks) ──────────────────────────────────────────────
  // check() no detiene el test si falla — solo registra el error en la métrica
  const success = check(res, {
    'status es 200':          (r) => r.status === 200,
    'tiene campo de login':   (r) => r.body.includes('login-button'),
    'tiempo < 2000ms':        (r) => r.timings.duration < 2000,
  });

  // Registrar si hubo error para la métrica error_rate
  errorRate.add(!success);

  // Pausa entre requests para simular comportamiento humano real
  // Sin sleep, k6 haría requests tan rápido como pueda (stress test)
  sleep(1);
}
