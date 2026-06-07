import { test, expect } from '@playwright/test';
import { AvaliacaoPage } from '../pages/AvaliacaoPage';

test.describe('CRUD Avaliação', () => {

  test('[HAPPY] criar avaliação com dados válidos', async ({ page }) => {
    const avaliacaoPage = new AvaliacaoPage(page);
    await avaliacaoPage.createAvaliacao('Avaliação Teste ' + Date.now());
    await avaliacaoPage.submit();
    await expect(page).toHaveURL(/avaliacoes/, { timeout: 10_000 });
  });

  test('[HAPPY] editar descrição de uma avaliação existente', async ({ page }) => {
    const avaliacaoPage = new AvaliacaoPage(page);
    const descricaoOriginal = 'Avaliação Edit ' + Date.now();
    const descricaoEditada = 'Avaliação Editada ' + Date.now();

    const id = await avaliacaoPage.createAvaliacaoAndGetId(descricaoOriginal);
    if (!id) throw new Error('ID não encontrado — verifique o redirect ou o link de editar na listagem.');

    await avaliacaoPage.editAvaliacaoById(id, descricaoEditada);
    await avaliacaoPage.submitEdit();
    await expect(page).toHaveURL(/avaliacoes/, { timeout: 10_000 });
  });

  test('[SAD] criar avaliação sem descrição exibe erro', async ({ page }) => {
    const avaliacaoPage = new AvaliacaoPage(page);
    await avaliacaoPage.openCreateForm();
    await avaliacaoPage.submit();
    await expect(
      page.getByText(/obrigatório|campo obrigatório|preencha/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('[SAD] editar avaliação para descrição vazia exibe erro', async ({ page }) => {
    const avaliacaoPage = new AvaliacaoPage(page);
    const descricaoOriginal = 'Avaliação Edit Sad ' + Date.now();

    const id = await avaliacaoPage.createAvaliacaoAndGetId(descricaoOriginal);
    if (!id) throw new Error('ID não encontrado.');

    await avaliacaoPage.editAvaliacaoById(id, '');
    await avaliacaoPage.submitEdit();
    await expect(
      page.getByText(/obrigatório|obrigatória|campo obrigatório|preencha/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('[BORDA] criar avaliação com descrição acima do limite de caracteres exibe erro', async ({ page }) => {
    const avaliacaoPage = new AvaliacaoPage(page);
    await avaliacaoPage.openCreateForm();
    await avaliacaoPage.fillDescricao('A'.repeat(126));
    await avaliacaoPage.submit();
    await expect(
      page.locator('[role="alert"], [class*="error"], [class*="invalid"]')
        .or(page.getByText(/superior a 125|máximo|limite|não pode|caracteres/i))
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[BORDA] editar avaliação com descrição acima do limite de caracteres exibe erro', async ({ page }) => {
    const avaliacaoPage = new AvaliacaoPage(page);
    const descricaoOriginal = 'Avaliação Edit Borda ' + Date.now();

    const id = await avaliacaoPage.createAvaliacaoAndGetId(descricaoOriginal);
    if (!id) throw new Error('ID não encontrado.');

    await avaliacaoPage.editAvaliacaoById(id, 'A'.repeat(126));
    await avaliacaoPage.submitEdit();
    await expect(
      page.locator('[role="alert"], [class*="error"], [class*="invalid"]')
        .or(page.getByText(/superior a 125|máximo|limite|não pode|caracteres/i))
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });

});