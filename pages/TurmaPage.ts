import { Page } from '@playwright/test';

export class TurmaPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('https://app.avaliei.com.br/dashboard');
        await this.page.getByRole('button', { name: 'Turmas' }).click();
        await this.page.getByRole('link', { name: 'Turmas' }).click();
        await this.page.waitForURL(/turmas/);
    }

    async searchTurma(turmaName: string) {
        await this.page.getByPlaceholder('Pesquisar turma...').fill(turmaName);
        await this.page.waitForSelector(`role=row >> text=${turmaName}`, { 
            state: 'visible',
            timeout: 10_000,
        });
    }

    async submit() {
        await this.page.getByRole('button', { name: 'Salvar' }).click();
        await Promise.race([ 
            this.page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15_000 }),
            this.page.waitForSelector('text=salva com sucesso', { state: 'visible', timeout: 15_000 }),
        ]).catch(() => {});
    }

    async createTurma(courseName: string, year: string, series: string, shift: string, description: string) {
        await this.page.getByRole('button', { name: 'Adicionar nova turma' }).click();

        if (courseName) {
            await this.page.getByRole('button', { name: 'Curso' }).click();
            await this.page.getByRole('option', { name: courseName, exact: true }).click();
        }

        await this.page.getByRole('textbox', { name: /Ano/ }).fill(year);

        if (series) {
            await this.page.getByRole('combobox', { name: /Série/ }).click();
            await this.page.getByRole('option', { name: series, exact: true }).click();
        }

        if (shift) {
            await this.page.getByRole('combobox', { name: /Turno/ }).click();
            await this.page.getByRole('option', { name: shift, exact: true }).click();
        }

        if (description) {
            await this.page.getByRole('textbox', { name: /Descrição/ }).fill(description);
        }
    }

    async editTurma(query: string, oldYear: string, newYear: string) {
        await this.searchTurma(query);

        const row = this.page.getByRole('row').filter({ hasText: query });
        await row.waitFor({ state: 'visible' });

        await row.getByRole('button', { name: 'Opções' }).click();
        await this.page.getByRole('menuitem', { name: 'Editar' }).click();

        const field = this.page.getByRole('textbox', { name: /Ano/ });
        await field.clear();
        await field.fill(newYear);
    }
}