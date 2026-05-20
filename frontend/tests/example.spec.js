// tests/flujo-completo.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test('Flujo completo desde login → completar perfil', async ({ page }) => {
  test.setTimeout(180000);

  // ─────────────────────────────────────────
  // PASO 1: LOGIN
  // ─────────────────────────────────────────
  await test.step('Iniciar sesión', async () => {
    await page.goto(`${BASE_URL}/login`);

    await page.locator('input[type="email"]').fill('pepsi@gmail.com');
    await page.locator('input[type="password"]').fill('12345678');
    await page.locator('button[type="submit"]').click();

    await expect(page).not.toHaveURL(/login/i, { timeout: 10000 });
    console.log(' Login exitoso');
  });

  // ─────────────────────────────────────────
  // PASO 2: IDENTIDAD - Nombre y Descripción
  // ─────────────────────────────────────────
  await test.step('Nombre y descripción de la empresa', async () => {
    // Esperar que cargue el formulario (busca el título del paso 1)
    await expect(page.getByText('Identidad básica')).toBeVisible({ timeout: 8000 });

    // Nombre: input type text dentro del primer auth-field
    await page.locator('input[type="text"].auth-input').first().fill('Empresa Pepsi Test');

    // Descripción: textarea
    await page.locator('textarea.auth-input').fill(
      'Empresa de prueba automatizada con Playwright para testing de flujo completo.'
    );

    // Botón Continuar
    await page.getByRole('button', { name: 'Continuar' }).click();
    console.log(' Paso 1 completado');
  });

  // ─────────────────────────────────────────
  // PASO 3: BRANDING - Logo (saltar)
  // ─────────────────────────────────────────
  await test.step('Saltar logo', async () => {
    await expect(page.getByRole('heading', { name: 'Branding' })).toBeVisible({ timeout: 5000 });

    // Continuar sin subir logo
    await page.getByRole('button', { name: 'Continuar' }).click();
    console.log(' Paso 2 saltado (logo opcional)');
  });

  // ─────────────────────────────────────────
  // PASO 4: EMPRESA - Rubro, Ciudad y País
  // ─────────────────────────────────────────
  await test.step('Rubro, ciudad y país', async () => {
    await expect(page.getByText('Información de la empresa')).toBeVisible({ timeout: 5000 });

    // Rubro: escribir para ver sugerencias y seleccionar
    await page.locator('input[placeholder*="Tecnología"]').fill('Tecno');
    await page.getByRole('button', { name: 'Tecnología' }).click(); // sugerencia del autocomplete

    // Ciudad
    await page.locator('input[placeholder*="Cochabamba"]').fill('Cochabamba');

    // País: select nativo
    await page.locator('select.auth-input').selectOption('Bolivia');

    await page.getByRole('button', { name: 'Continuar' }).click();
    console.log(' Paso 3 completado');
  });


  await test.step('Teléfono y finalizar', async () => {
    await expect(page.getByRole('heading', { name: 'Información de contacto' })).toBeVisible({ timeout: 5000 });

    await page.locator('input[type="tel"]').fill('71234567');
    await page.getByRole('button', { name: 'Finalizar registro' }).click();

    await page.waitForTimeout(5000);

    const html = await page.locator('.auth-card').innerHTML();
    console.log('[HTML ACTUAL]', html.slice(0, 500));
  });

  await test.step('Navegar a perfil empresa', async () => {
    await page.goto(`${BASE_URL}/reclutador`);

    await page.locator('.resource-item').filter({ hasText: 'Perfil empresa' }).click();

    await expect(page.getByRole('button', { name: /editar perfil/i })).toBeVisible({ timeout: 8000 });
    console.log(' En perfil empresa');
  });

  await test.step('Editar perfil empresa', async () => {
    await page.getByRole('button', { name: /editar perfil/i }).click();

    await page.locator('input[placeholder="Nombre de la empresa"]').fill('Pepsi Bolivia S.A.');

    await page.locator('input[placeholder="Industria"]').fill('Tecno');
    await page.getByRole('button', { name: 'Tecnología' }).click();

    await page.locator('input[placeholder="Ciudad"]').fill('Cochabamba');

    await page.getByRole('button', { name: /guardar cambios/i }).click();

    await expect(page.getByRole('button', { name: /cancelar/i })).not.toBeVisible({ timeout: 20000 });

    console.log(' Perfil empresa editado correctamente');
  });
  await test.step('Crear nueva convocatoria', async () => {
    await page.locator('.resource-item').filter({ hasText: 'Nueva convocatoria' }).click();
    await expect(page.getByPlaceholder('Título del puesto *')).toBeVisible({ timeout: 8000 });

    await page.getByPlaceholder('Título del puesto *').fill('Desarrollador Full Stack');
    await page.getByPlaceholder('Área o rubro (ej. Tecnología, Salud, Construcción...)').fill('Tecnología');
    await page.getByPlaceholder(/describe el puesto/i).fill(
      'Buscamos un desarrollador Full Stack con experiencia en React y Node.js para unirse a nuestro equipo.'
    );

    await page.getByRole('button', { name: /tipo/i }).click();
    await page.getByRole('button', { name: 'Full-time' }).click();

    await page.getByRole('button', { name: /modalidad/i }).click();
    await page.getByRole('button', { name: 'Remoto' }).click();

    await page.getByRole('button', { name: /nivel/i }).click();
    await page.getByRole('button', { name: 'Mid' }).click();

    await page.getByPlaceholder('Ciudad').fill('Cochabamba');

    await page.getByRole('button', { name: 'Publicar' }).click();

    await expect(page.getByRole('heading', { name: 'Mis Convocatorias' })).toBeVisible({ timeout: 20000 });

    console.log('Convocatoria publicada correctamente');
  });
  await test.step('Ir al feed y postularse a una oferta', async () => {
    await page.goto(`${BASE_URL}/feed`);
    await page.reload();

    await expect(page.locator('article').first()).toBeVisible({ timeout: 60000 });

    const btnPostular = page.getByRole('button', { name: 'Postularme' }).first();
    await expect(btnPostular).toBeVisible({ timeout: 15000 });
    await btnPostular.click();

    await expect(page.getByText('Postularme a esta oferta')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder(/contá por qué sos el candidato ideal/i).fill(
      'Soy el candidato ideal porque tengo experiencia en React y Node.js, trabajo en equipo y me apasiona la tecnología.'
    );

    await page.getByRole('button', { name: 'Enviar postulación' }).click();

    await expect(page.getByText('Ya postulado').first()).toBeVisible({ timeout: 10000 });

    console.log(' Postulación enviada correctamente');
  });

  await test.step('Ver postulantes de la última convocatoria', async () => {
    await page.goto(`${BASE_URL}/reclutador`);

    await page.locator('.resource-item').filter({ hasText: 'Todos' }).click();

    await expect(page.getByText('Gestión de postulantes')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=Desarrollador Full Stack').first()).toBeVisible({ timeout: 15000 });

    await page.locator('text=Desarrollador Full Stack').first().click();

    await expect(page.getByText('Volver a convocatorias')).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Total')).toBeVisible({ timeout: 5000 });

    await expect(page.locator('text=En revisión').first()).toBeVisible({ timeout: 10000 });

    console.log('Postulantes de la convocatoria visibles');
  });
  // ─────────────────────────────────────────
  // PASO 11: VER DETALLE Y ELIMINAR CONVOCATORIA
  // ─────────────────────────────────────────
  await test.step('Ver detalle y eliminar convocatoria', async () => {
    // Ir a convocatorias
    await page.locator('.resource-item').filter({ hasText: 'Convocatory' }).click();

    // Esperar que cargue la lista
    await expect(page.getByText('Desarrollador Full Stack').first()).toBeVisible({ timeout: 15000 });

    // Clic en "Ver detalle" de la primera convocatoria
    await page.getByRole('button', { name: 'Ver detalle' }).first().click();

    // Esperar que abra el modal de detalle
    await expect(page.getByRole('button', { name: /eliminar/i })).toBeVisible({ timeout: 5000 });

    // Clic en Eliminar dentro del modal
    await page.getByRole('button', { name: /eliminar/i }).click();

    // Aparece el modal de confirmación "¿Eliminar convocatoria?"
    await expect(page.getByText('¿Eliminar convocatoria?')).toBeVisible({ timeout: 5000 });

    // Confirmar eliminación
    await page.getByRole('button', { name: 'Sí, eliminar' }).click();

    // Verificar que el modal se cerró
    await expect(page.getByText('¿Eliminar convocatoria?')).not.toBeVisible({ timeout: 15000 });

    console.log(' Convocatoria eliminada correctamente');
  });

});