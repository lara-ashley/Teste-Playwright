import { type Page, expect } from '@playwright/test';

export class AvaliacaoPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://app.avaliei.com.br/avaliacoes', { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('text=Lista de Avaliações', { state: 'visible', timeout: 15_000 });
  }

  async openCreateForm() {
    await this.page.goto('https://app.avaliei.com.br/avaliacoes/cadastrar', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await this.page.waitForSelector('text=Cadastrar Avaliação', { state: 'visible', timeout: 25_000 });
  }

  async fillDescricao(descricao: string) {
    await this.page.getByRole('textbox', { name: 'Descrição da avaliação: *' }).fill(descricao);
  }

  async selectTurma() {
    await this.page.getByRole('combobox', { name: 'Turmas' }).click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible', timeout: 8_000 });
    await this.page.getByRole('option').first().click();
    await this.page.keyboard.press('Escape');
  }

  async selectProfessorDisciplina() {
    const comboProfObj = this.page
      .getByRole('group', { name: /bloco objetivo 1/i })
      .getByRole('button', { name: 'Professor' });

    await comboProfObj.click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible', timeout: 8_000 });
    await this.page.getByRole('option').first().click();

    const comboDiscObj = this.page.getByRole('combobox', {
      name: /selecionar disciplina para bloco objetivo/i,
    }).first();

    await comboDiscObj.waitFor({ state: 'visible', timeout: 8_000 });
    await expect(comboDiscObj).not.toBeDisabled({ timeout: 10_000 });
    await comboDiscObj.click();

    await this.page.waitForSelector('[role="option"]', { state: 'visible', timeout: 10_000 });

    const total = await this.page.getByRole('option').count();
    if (total === 0) throw new Error('Nenhuma disciplina disponível para o professor selecionado.');

    await this.page.getByRole('option').first().click();
    await expect(comboDiscObj).not.toHaveText('Selecionar', { timeout: 5_000 });
  }

  async createAvaliacao(descricao: string) {
    await this.openCreateForm();
    await this.fillDescricao(descricao);
    await this.selectTurma();
    await this.selectProfessorDisciplina();
  }

  async createAvaliacaoAndGetId(descricao: string): Promise<string | null> {
    await this.createAvaliacao(descricao);
    await this.submit();

    await this.page.waitForURL(/\/avaliacoes$/, { timeout: 40_000 });

    const cardLink = this.page
      .locator('a, h2, h3, [class*="title"], [class*="titulo"]')
      .filter({ hasText: descricao })
      .first();

    await cardLink.waitFor({ state: 'visible', timeout: 15_000 });

    const texto = await cardLink.innerText();
    const matchTexto = texto.match(/#(\d+)/);
    if (matchTexto) return matchTexto[1];

    const href = await cardLink.getAttribute('href');
    const matchHref = href?.match(/\/avaliacoes\/(\d+)/);
    if (matchHref) return matchHref[1];

    return null;
  }

  async editAvaliacaoById(id: string, novaDescricao: string) {
    await this.page.goto(
      `https://app.avaliei.com.br/avaliacoes/editar/${id}`,
      { waitUntil: 'domcontentloaded' } 
    );
    await this.page.waitForSelector('text=Editar Avaliação', { state: 'visible', timeout: 15_000 });

    const campo = this.page.getByRole('textbox', { name: 'Descrição da avaliação: *' });
    await campo.waitFor({ state: 'visible', timeout: 10_000 });

    await campo.click({ clickCount: 3 }); 
    await campo.fill(novaDescricao);

    await expect(campo).toHaveValue(novaDescricao, { timeout: 5_000 }); 
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Salvar avaliação' }).click();
  }

  async submitEdit() {
    await this.page.getByRole('button', { name: 'Salvar Alterações' }).click();
    await Promise.race([
      this.page.waitForURL(/\/avaliacoes/, { timeout: 20_000 }),
      this.page.waitForSelector('[role="alert"], [class*="error"], [class*="invalid"]', {
        state: 'visible',
        timeout: 20_000,
      }),
    ]);
  }
}