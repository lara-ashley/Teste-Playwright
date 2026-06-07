import { type Page } from '@playwright/test';

export class AvaliacaoPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://app.avaliei.com.br/avaliacoes', { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('text=Lista de Avaliações', { state: 'visible', timeout: 15_000 });
  }

  async openCreateForm() {
    await this.page.goto('https://app.avaliei.com.br/avaliacoes/cadastrar', { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('text=Cadastrar Avaliação', { state: 'visible', timeout: 15_000 });
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
      .getByRole('group', { name: 'Bloco objetivo' })
      .getByLabel('Professor');

    await comboProfObj.click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible', timeout: 8_000 });
    await this.page.getByRole('option').first().click();

    await this.page.waitForTimeout(1_500);

    const comboDiscObj = this.page.getByRole('combobox', {
      name: /selecionar disciplina para bloco objetivo/i,
    });

    if (await comboDiscObj.count()) {
      await comboDiscObj.click();
      await this.page.waitForSelector('[role="option"]', { state: 'visible', timeout: 8_000 });

      const total = await this.page.getByRole('option').count();
      if (total === 0) throw new Error('Nenhuma disciplina disponível para o professor selecionado.');

      await this.page.getByRole('option').first().click();
    }
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

    await this.page.waitForURL(/\/avaliacoes/, { timeout: 15_000 });

    const urlAtual = this.page.url();
    const matchDireto = urlAtual.match(/\/avaliacoes\/(\d+)/);
    if (matchDireto) return matchDireto[1];

    await this.page.waitForSelector('text=Carregando Dados...', { state: 'hidden', timeout: 15_000 });

    const cardTitulo = this.page
      .locator('a, h2, h3, [class*="title"], [class*="titulo"]')
      .filter({ hasText: descricao })
      .first();

    if (await cardTitulo.count()) {
      const texto = await cardTitulo.innerText();
      const match = texto.match(/#(\d+)/);
      if (match) return match[1];

      const href = await cardTitulo.getAttribute('href');
      const matchHref = href?.match(/\/avaliacoes\/(\d+)/);
      if (matchHref) return matchHref[1];
    }

    return null;
  }

  async editAvaliacaoById(id: string, novaDescricao: string) {
    await this.page.goto(
      `https://app.avaliei.com.br/avaliacoes/editar/${id}`,
      { waitUntil: 'domcontentloaded' }
    );
    await this.page.waitForSelector('text=Editar Avaliação', { state: 'visible', timeout: 15_000 });
    const campo = this.page.getByRole('textbox', { name: 'Descrição da avaliação: *' });
    await campo.clear();
    await campo.fill(novaDescricao);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Salvar avaliação' }).click();
  }

  async submitEdit() {
    await this.page.getByRole('button', { name: 'Salvar Alterações' }).click();
  }
}