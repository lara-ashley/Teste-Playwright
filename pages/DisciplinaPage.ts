import { Page } from '@playwright/test';

export class DisciplinaPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('https://app.avaliei.com.br/disciplinas');
        await this.page.waitForSelector('button:has-text("Adicionar disciplina")', {
            state: 'visible',
            timeout: 30_000,
        });
    }

    async openCreateForm() {
        await this.page.getByRole('button', { name: 'Adicionar disciplina' }).click();
    }

    async searchDiscipline(nome: string) {
        await this.page.getByPlaceholder('Pesquisar disciplina...').fill(nome);
        await this.page.waitForSelector('text=Atualizando', { state: 'visible', timeout: 5_000 }).catch(() => {}); 
        await this.page.waitForSelector('text=Atualizando', { state: 'hidden', timeout: 15_000 }).catch(() => {}); 
        await this.page.waitForSelector(`role=row >> text=${nome}`, { state: 'visible', timeout: 10_000 });
    }

    async createDiscipline(nome: string, area: string) {
        await this.page.getByRole('button', { name: 'Adicionar disciplina' }).click();
        await this.page.getByRole('textbox', { name: 'Nome da disciplina: *' }).fill(nome);
        await this.page.getByRole('button', { name: 'Selecione a área da disciplina' }).click();
        await this.page.getByRole('option', { name: area }).click();
    }

    async editDiscipline(nomeAtual: string, nomeNovo: string) {
        await this.searchDiscipline(nomeAtual);
        const linha = this.page.getByRole('row').filter({ hasText: nomeAtual });
        await linha.locator('button', { hasText: 'Editar' }).click();
        const campo = this.page.getByRole('textbox', { name: 'Nome da disciplina: *' });
        await campo.clear();
        await campo.fill(nomeNovo);
    }

    async submit() {
        await this.page.getByRole('button', { name: 'Salvar' }).click();
    }

    async waitForListToReload() {
        await this.page.getByText('Disciplina salva com sucesso').waitFor({
            state: 'visible',
            timeout: 10_000,
        });
        await this.page.waitForSelector('text=Atualizando', { state: 'visible', timeout: 5_000 }).catch(() => {});
        await this.page.waitForSelector('text=Atualizando', { state: 'hidden', timeout: 15_000 }).catch(() => {});
        await this.page.waitForSelector('role=row', { state: 'visible', timeout: 10_000 });
    }
}