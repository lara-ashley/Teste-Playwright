import { test, expect } from '@playwright/test';
import { TurmaPage } from '../pages/TurmaPage';

test.describe('CRUD Turma', () => {

  test('[HAPPY] criar turma com dados válidos', async ({ page }) => {
    const turmaPage = new TurmaPage(page);
    await turmaPage.goto();
    await turmaPage.createTurma('Fisioterapia', '2024', '1ª Série / 1º Semestre', 'Vespertino', 'turma 21 ' + Date.now());
    await turmaPage.submit();
    await expect(page.getByText('Turma salva com sucesso')).toBeVisible({ timeout: 10_000 });
  });

  test('[HAPPY] editar ano de uma turma existente', async ({ page }) => {
    const turmaPage = new TurmaPage(page);
    const description = 'Turma 34' + Date.now();

    await turmaPage.goto();
    await turmaPage.createTurma('Fisioterapia', '2022', '9ª Série / 9º Semestre', 'Vespertino', description);
    await turmaPage.submit();
    await expect(page.getByText('Turma salva com sucesso')).toBeVisible({ timeout: 10_000 });

    await turmaPage.editTurma(description, '2022', '2027');
    await turmaPage.submit();
    await expect(page.getByText('Turma salva com sucesso')).toBeVisible({ timeout: 10_000 });
  });

  test('[SAD] criar turma sem curso exibe erro', async ({ page }) => {
    const turmaPage = new TurmaPage(page);
    await turmaPage.goto();
    await turmaPage.createTurma('', '2024', '1ª Série / 1º Semestre', 'Vespertino', '');
    await turmaPage.submit();
    await expect(page.getByText('Este campo é obrigatório')).toBeVisible();
  });

  test('[SAD] editar turma com ano vazio exibe erro', async ({ page }) => {
    const turmaPage = new TurmaPage(page);
    const description = 'Turma 34' + Date.now();

    await turmaPage.goto();
    await turmaPage.createTurma('Fisioterapia', '2022', '9ª Série / 9º Semestre', 'Vespertino', description);
    await turmaPage.submit();
    await expect(page.getByText('Turma salva com sucesso')).toBeVisible({ timeout: 10_000 });

    await turmaPage.editTurma(description, '2022', '');
    await turmaPage.submit();
    await expect(page.getByText('Ano é obrigatório')).toBeVisible();
  });

  test('[BORDA] criar turma com ano inválido exibe erro', async ({ page }) => {
    const turmaPage = new TurmaPage(page);
    await turmaPage.goto();
    await turmaPage.createTurma('Fisioterapia', '2028', '1ª Série / 1º Semestre', 'Vespertino', '');
    await turmaPage.submit();
    await expect(page.getByText('O ano não pode ser superior a 2027.')).toBeVisible();
  });

  test('[BORDA] editar turma com ano inválido exibe erro', async ({ page }) => {
    const turmaPage = new TurmaPage(page);
    const description = 'Turma 21' + Date.now();

    await turmaPage.goto();
    await turmaPage.createTurma('Fisioterapia', '2022', '9ª Série / 9º Semestre', 'Vespertino', description);
    await turmaPage.submit();
    await expect(page.getByText('Turma salva com sucesso')).toBeVisible({ timeout: 10_000 });

    await turmaPage.editTurma(description, '2022', '2028');
    await turmaPage.submit();
    await expect(page.getByText('O ano não pode ser superior a 2027.')).toBeVisible();
  });
});