import { Page } from '@playwright/test';

export class ConteudoPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('https://app.avaliei.com.br/conteudos', { 
            waitUntil: 'domcontentloaded',
        });
        await this.page.waitForSelector('button:has-text("Adicionar Conteúdo")', {
            state: 'visible',
            timeout: 15_000,
        });
    }

    async submit() {
        await this.page.getByRole('button', { name: 'Salvar' }).click();
    }

    async searchConteudo(nome: string) {
        await this.page.getByPlaceholder('Pesquisar conteúdo...').fill(nome);
        await this.page.waitForSelector('text=Atualizando', { state: 'visible', timeout: 5_000 }).catch(() => {});
        await this.page.waitForSelector('text=Atualizando', { state: 'hidden', timeout: 15_000 }).catch(() => {});
        await this.page.waitForSelector(`role=row >> text=${nome}`, { state: 'visible', timeout: 10_000 });
    }

    async createConteudo(conteudoName: string) {
        await this.page.getByRole('button', { name: 'Adicionar conteúdo' }).click();
        await this.page.getByRole('textbox', { name: 'Nome do Conteúdo:' }).fill(conteudoName);
        await this.page.getByRole('button', { name: 'Disciplina' }).click();
        await this.page.getByRole('option', { name: 'Biologia' }).click();
    }

    async editConteudo(nomeAtual: string, nomeNovo: string) {
        await this.searchConteudo(nomeAtual);
        const linha = this.page.getByRole('row').filter({ hasText: nomeAtual });
        await linha.locator('button', { hasText: 'Editar' }).click();
        await this.page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5_000 });
        const campo = this.page.getByRole('textbox', { name: 'Nome do conteúdo: *' });
        await campo.clear();
        await campo.fill(nomeNovo);
        await campo.blur();
    }

    async waitForListToReload() {
        const toast = this.page.getByText('Conteúdo salvo com sucesso');
        await toast.waitFor({ state: 'visible', timeout: 10_000 });
        await this.page.waitForSelector('text=Atualizando', { state: 'visible', timeout: 5_000 }).catch(() => {});
        await this.page.waitForSelector('text=Atualizando', { state: 'hidden', timeout: 15_000 }).catch(() => {});
        await this.page.waitForSelector('role=row', { state: 'visible', timeout: 10_000 });
    }
}