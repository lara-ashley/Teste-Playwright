import { test, expect } from '@playwright/test';
import { ConteudoPage } from '../pages/ConteudoPage';

test.describe('CRUD Conteúdo', () => {

  test('[HAPPY] criar conteúdo com dados válidos', async ({ page }) => {
    const conteudoPage = new ConteudoPage(page);
    await conteudoPage.goto();
    await conteudoPage.createConteudo('Conteudo Teste ' + Date.now());
    await conteudoPage.submit();
    await expect(page.getByText('Conteúdo salvo com sucesso')).toBeVisible();
  });

  test('[HAPPY] editar nome de um conteúdo existente', async ({ page }) => {
    const conteudoPage = new ConteudoPage(page);
    const nomeOriginal = 'Conteúdo Edit ' + Date.now();
    const nomeEditado = 'Conteúdo Editada ' + Date.now();

    await conteudoPage.goto();
    await conteudoPage.createConteudo(nomeOriginal);
    await conteudoPage.submit();
    await conteudoPage.waitForListToReload(); 

    await conteudoPage.editConteudo(nomeOriginal, nomeEditado);
    await conteudoPage.submit();
    await expect(page.getByText('Conteúdo salvo')).toBeVisible({ timeout: 10_000 });
  });

  test('[SAD] criar conteúdo sem preencher campos obrigatórios exibe erro', async ({ page }) => {
    const conteudoPage = new ConteudoPage(page);
    await conteudoPage.goto();
    await conteudoPage.createConteudo('');
    await conteudoPage.submit();
    await expect(page.getByText('Este campo é obrigatório')).toBeVisible();
  });

  test('[SAD] editar conteúdo para nome vazio exibe erro', async ({ page }) => {
    const conteudoPage = new ConteudoPage(page);
    const nomeOriginal = 'Conteúdo Edit Triste ' + Date.now();

    await conteudoPage.goto();
    await conteudoPage.createConteudo(nomeOriginal);
    await conteudoPage.submit();
    await conteudoPage.waitForListToReload(); 

    await conteudoPage.editConteudo(nomeOriginal, '');
    await conteudoPage.submit();
    await expect(
      page.getByText(/obrigatório/i).first() 
    ).toBeVisible({ timeout: 5_000 });
  });

  test('[BORDA] criar conteúdo com nome acima do limite de caracteres exibe erro', async ({ page }) => {
    const conteudoPage = new ConteudoPage(page);
    await conteudoPage.goto();
    await conteudoPage.createConteudo('A'.repeat(126));
    await conteudoPage.submit();
    await expect(page.getByText('O campo nome do conteúdo não pode ser superior a 125 caracteres.')).toBeVisible();
  });

  test('[BORDA] editar conteúdo com nome acima do limite de caracteres exibe erro', async ({ page }) => {
    const conteudoPage = new ConteudoPage(page);
    const nomeOriginal = 'Disciplina Edit Borda ' + Date.now();

    await conteudoPage.goto();
    await conteudoPage.createConteudo(nomeOriginal);
    await conteudoPage.submit();
    await conteudoPage.waitForListToReload(); 

    await conteudoPage.editConteudo(nomeOriginal, 'A'.repeat(126));
    await conteudoPage.submit();
    await expect(page.getByText('O campo nome do conteúdo não pode ser superior a 125 caracteres.')).toBeVisible();
  });
});