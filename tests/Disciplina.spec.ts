import { test, expect } from '@playwright/test';
import { DisciplinaPage } from '../pages/DisciplinaPage';

const AREA_PADRAO = 'Matemática e suas tecnologias';

test.describe('CRUD Disciplina', () => {

  test('[HAPPY] criar disciplina com dados válidos', async ({ page }) => {
    const disciplinaPage = new DisciplinaPage(page);
    await disciplinaPage.goto();
    await disciplinaPage.createDiscipline('Disciplina Teste ' + Date.now(), AREA_PADRAO);
    await disciplinaPage.submit();
    await expect(page.getByText('Disciplina salva com sucesso')).toBeVisible();
  });

  test('[HAPPY] editar nome de uma disciplina existente', async ({ page }) => {
    const disciplinaPage = new DisciplinaPage(page);
    const nomeOriginal = 'Disciplina Edit ' + Date.now();
    const nomeEditado = 'Disciplina Editada ' + Date.now();

    await disciplinaPage.goto();
    await disciplinaPage.createDiscipline(nomeOriginal, AREA_PADRAO);
    await disciplinaPage.submit();
    await disciplinaPage.waitForListToReload(); 

    await disciplinaPage.editDiscipline(nomeOriginal, nomeEditado);
    await disciplinaPage.submit();
    await expect(page.getByText('Disciplina salva com sucesso')).toBeVisible({ timeout: 10_000 });
  });

  test('[SAD] criar disciplina sem preencher campos obrigatórios exibe erro', async ({ page }) => {
    const disciplinaPage = new DisciplinaPage(page);
    await disciplinaPage.goto();
    await disciplinaPage.openCreateForm();
    await disciplinaPage.submit();
    await expect(page.locator('#subject-nome-error')).toBeVisible();
  });

  test('[SAD] editar disciplina para nome vazio exibe erro', async ({ page }) => {
    const disciplinaPage = new DisciplinaPage(page);
    const nomeOriginal = 'Disciplina Edit sad' + Date.now();

    await disciplinaPage.goto();
    await disciplinaPage.createDiscipline(nomeOriginal, AREA_PADRAO);
    await disciplinaPage.submit();
    await disciplinaPage.waitForListToReload(); 

    await disciplinaPage.editDiscipline(nomeOriginal, '');
    await disciplinaPage.submit();
    await expect(page.locator('#subject-nome-error')).toBeVisible();
  });

  test('[BORDA] criar disciplina com nome acima do limite de caracteres exibe erro', async ({ page }) => {
    const disciplinaPage = new DisciplinaPage(page);
    await disciplinaPage.goto();
    await disciplinaPage.createDiscipline('A'.repeat(126), AREA_PADRAO);
    await disciplinaPage.submit();
    await expect(page.getByText(/superior a 125/i)).toBeVisible({ timeout: 10_000 });
  });

  test('[BORDA] editar disciplina com nome acima do limite de caracteres exibe erro', async ({ page }) => {
    const disciplinaPage = new DisciplinaPage(page);
    const nomeOriginal = 'Disciplina Edit Borda ' + Date.now();

    await disciplinaPage.goto();
    await disciplinaPage.createDiscipline(nomeOriginal, AREA_PADRAO);
    await disciplinaPage.submit();
    await disciplinaPage.waitForListToReload(); 

    await disciplinaPage.editDiscipline(nomeOriginal, 'A'.repeat(126));
    await disciplinaPage.submit();
    await expect(page.getByText(/superior a 125/i)).toBeVisible({ timeout: 10_000 });
  });
});