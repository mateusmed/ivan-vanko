// Início: os dashboards salvos e os exemplos, cada um com quantos gráficos tem e de que tipos
import { loadDashboardMenu, showNoticeFromUrl, setupDialogs, setupMenus, dashboardUrl, getJson, element } from './ui.js';
import { CHART_TYPES } from './chart-theme.mjs';

main();

async function main() {
    setupDialogs();
    setupMenus();
    showNoticeFromUrl();

    const { dashboards, examples } = await loadDashboardMenu();
    renderCards('dashboard-cards', dashboards, true);
    renderCards('example-cards', examples, false);
}

async function renderCards(id, names, withNewCard) {
    const container = document.getElementById(id);
    const cards = await Promise.all(names.map(card));

    if (withNewCard) {
        const create = element('a', 'card card-new', '+ Novo dashboard');
        create.href = '/pages/dashboards.html';
        cards.push(create);
    }

    if (cards.length === 0) {
        container.replaceChildren(element('p', 'hint', 'Nenhum exemplo disponível.'));
        return;
    }
    container.replaceChildren(...cards);
}

async function card(name) {
    const link = element('a', 'card');
    link.href = dashboardUrl(name);
    link.append(element('h3', '', name));

    const layout = await getJson(`/api/dashboards/${encodeURIComponent(name)}`).catch(() => null);
    if (!Array.isArray(layout)) {
        link.append(element('p', '', 'Não consegui ler este dashboard.'));
        return link;
    }

    link.append(element('p', '', layout.length === 1 ? '1 gráfico' : `${layout.length} gráficos`));

    const chips = element('div', 'chips');
    const types = [...new Set(layout.map(chart => chart.type))];
    chips.append(...types.map(type => element('span', 'chip', CHART_TYPES[type] || type)));
    link.append(chips);

    return link;
}
