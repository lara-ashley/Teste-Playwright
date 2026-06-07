import { test, expect } from '@playwright/test';
import { AreaPage } from '../pages/AreaPage';

test.describe('CRUD Área', () => {

  test('[HAPPY] criar nova área com dados válidos', async ({ page }) => {
    const areaPage = new AreaPage(page);
    await areaPage.goto();
    await areaPage.createArea('e2e-area-21' + Date.now());
    await areaPage.submit();
    await expect(page.getByText('Área salva com sucesso')).toBeVisible();
  });

  test('[HAPPY] editar nome de uma área existente', async ({ page }) => {
    const areaPage = new AreaPage(page);
    const originalName = 'Área Edit ' + Date.now();
    const editedName = 'Área Editada ' + Date.now();

    await areaPage.goto();
    await areaPage.createArea(originalName);
    await areaPage.submit();
    await expect(page.getByText('Área salva com sucesso')).toBeVisible();

    await areaPage.editArea(originalName, editedName);
    await areaPage.submit();
    await expect(page.getByText('Área salva com sucesso')).toBeVisible();
  });

  test('[SAD] criar área com link no nome não renderiza o link', async ({ page }) => {
    const areaPage = new AreaPage(page);
    await areaPage.goto();
    await areaPage.createArea('<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Link suspeito</a>');
    await areaPage.submit();
    await expect(page.getByRole('link', { name: 'Link suspeito' })).not.toBeVisible();
  });

  test('[SAD] editar área para nome vazio exibe erro', async ({ page }) => {
    const areaPage = new AreaPage(page);
    const originalName = 'Área Link ' + Date.now();

    await areaPage.goto();
    await areaPage.createArea(originalName);
    await areaPage.submit();
    await expect(page.getByText('Área salva com sucesso')).toBeVisible();

    await areaPage.editArea(originalName, '       ');
    await areaPage.submit();
    await expect(page.getByText('Este campo não pode conter apenas espaços em branco')).toBeVisible();
  });

  test('[BORDA] criar área com nome acima do limite de caracteres exibe erro', async ({ page }) => {
    const areaPage = new AreaPage(page);
    await areaPage.goto();
    await areaPage.createArea('A'.repeat(126));
    await areaPage.submit();
    await expect(page.getByText('O campo nome da área não pode ser superior a 125 caracteres.')).toBeVisible();
  });

  test('[BORDA] editar área com caracteres especiais exibe erro', async ({ page }) => {
    const areaPage = new AreaPage(page);
    const originalName = 'Área no seu limite ' + Date.now();

    await areaPage.goto();
    await areaPage.createArea(originalName);
    await areaPage.submit();
    await expect(page.getByText('Área salva com sucesso')).toBeVisible();

    await areaPage.editArea(originalName, '!@#$%¨&**');
    await areaPage.submit();
    await expect(page.getByText('Conteúdo inválido detectado na requisição.')).toBeVisible();
  });
});