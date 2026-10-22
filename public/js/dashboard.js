// Tela do dashboard: a grade de gráficos (GridStack), adicionar, configurar, fixar, remover, salvar e excluir.
// Cada quadro guarda a própria configuração no nó do GridStack (chartType, chartUrl, poolingSeconds, chartTitle, fixed).
import { CHART_TYPES, charts, fetchChartData, startPolling, destroyChart } from './chart-build.js';
import { loadSidebar, showToast, setupDialogs, escapeHtml, element, NAME_PATTERN } from './ui.js';
import { serializeNodes, extractUrl, sourceLabel as describeSource, SAMPLE_URL_PREFIX, DEFAULT_POLLING_SECONDS } from './layout.mjs';

let grid;
let savedName = null;   // dashboard salvo que está aberto; null = novo ou exemplo
let knownDashboards = [];
let isDirty = false;
let chartCounter = 0;

main();

async function main() {
    setupDialogs();
    // No celular a grade vira uma coluna: sem "float", os quadros sobem e não ficam buracos
    grid = GridStack.init({ float: window.innerWidth > 768, cellHeight: 30, column: 12, margin: 8 });

    const name = new URLSearchParams(window.location.search).get('name');
    const { dashboards, examples } = await loadSidebar(name);
    knownDashboards = dashboards;

    setupAddChartMenu();
    setupNameField();
    setupSave();
    setupRemove();
    setupGridEvents();
    setupCloseMenus();
    warnBeforeLeaving();

    if (!name || name === 'new-dashboard') return startNew();

    savedName = dashboards.includes(name) ? name : null;
    await loadDashboard(name, !savedName && examples.includes(name));
}


// =============================================================================================
// Abrir
// =============================================================================================

function startNew() {
    document.getElementById('crumb').textContent = 'Novo dashboard';
    document.getElementById('dashboard-name').value = '';
    document.getElementById('dashboard-name').focus();
    updateEmptyState();
    markClean();
}

async function loadDashboard(name, isExample) {
    const response = await fetch(`/api/dashboards/${encodeURIComponent(name)}`).catch(() => null);
    if (!response?.ok) {
        showToast(`O dashboard "${name}" não existe. Começando um novo.`, 'error');
        return startNew();
    }

    const layout = await response.json();
    document.getElementById('crumb').textContent = isExample ? 'Exemplo: salve para guardar uma cópia sua' : 'Dashboard';
    document.getElementById('dashboard-name').value = name;
    document.title = `${name} - ivan-vanko`;
    document.getElementById('remove-dashboard').hidden = !savedName;

    grid.batchUpdate();
    layout.forEach(chart => addChart({
        type: chart.type,
        ...chart.coordinates,
        url: chart.properties?.url,
        pooling: chart.properties?.pooling,
        title: chart.properties?.title,
        fixed: chart.fixed
    }));
    grid.batchUpdate(false);

    updateEmptyState();
    markClean();
}


// =============================================================================================
// Quadros de gráfico
// =============================================================================================

function addChart({ type, x, y, w = 6, h = 13, url, pooling = DEFAULT_POLLING_SECONDS, title, fixed = false }) {
    const chartId = `chart-${++chartCounter}`;
    const chartUrl = url || `${SAMPLE_URL_PREFIX}${type}`;
    const chartTitle = title || CHART_TYPES[type] || type;

    const widget = grid.addWidget({
        x, y, w, h,
        autoPosition: x === undefined || y === undefined,
        content: chartCard(chartId, chartTitle, chartUrl),
        chartId,
        chartType: type,
        chartUrl,
        poolingSeconds: String(pooling),
        chartTitle,
        fixed: Boolean(fixed)
    });

    setupCard(widget);
    if (fixed) applyFixed(widget, true);

    fetchChartData(chartId, chartUrl, type);
    startPolling(chartId, chartUrl, type, pooling);
    return widget;
}

function sourceLabel(url) {
    return describeSource(url, window.location.origin);
}

function chartCard(chartId, title, url) {
    return `
        <div class="chart-header">
            <div><h3>${escapeHtml(title)}</h3><span class="chart-source">${escapeHtml(sourceLabel(url))}</span></div>
            <div class="chart-tools">
                <button type="button" aria-label="Opções do gráfico" aria-expanded="false" data-tools>⋯</button>
                <div class="menu-list" hidden>
                    <button type="button" data-action="configure">Configurar</button>
                    <button type="button" data-action="fix">Fixar posição</button>
                    <button type="button" data-action="remove">Remover do dashboard</button>
                </div>
            </div>
        </div>
        <div class="chart-filters" hidden></div>
        <div class="chart-container">
            <p class="chart-status">Carregando os dados...</p>
            <canvas id="${chartId}"></canvas>
        </div>`;
}

function setupCard(widget) {
    const toggle = widget.querySelector('[data-tools]');
    const menu = toggle.nextElementSibling;

    toggle.addEventListener('click', event => {
        event.stopPropagation();
        const willOpen = menu.hidden;
        closeAllMenus();
        menu.hidden = !willOpen;
        toggle.setAttribute('aria-expanded', String(willOpen));
    });

    menu.addEventListener('click', event => {
        const action = event.target.dataset.action;
        if (!action) return;

        closeAllMenus();
        if (action === 'configure') openConfigure(widget);
        if (action === 'fix') toggleFixed(widget);
        if (action === 'remove') removeChart(widget);
    });
}

function closeAllMenus() {
    document.querySelectorAll('.chart-tools .menu-list').forEach(menu => { menu.hidden = true; });
    document.querySelectorAll('[data-tools]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

function setupCloseMenus() {
    document.addEventListener('click', event => {
        if (!event.target.closest('.chart-tools')) closeAllMenus();
        if (!event.target.closest('#add-chart-menu')) document.getElementById('add-chart-menu').open = false;
    });
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        closeAllMenus();
        document.getElementById('add-chart-menu').open = false;
    });
}

function toggleFixed(widget) {
    applyFixed(widget, !widget.gridstackNode.fixed);
    markDirty();
}

// Fixado: não arrasta nem redimensiona
function applyFixed(widget, fixed) {
    widget.gridstackNode.fixed = fixed;
    grid.movable(widget, !fixed);
    grid.resizable(widget, !fixed);
    widget.classList.toggle('is-static', fixed);
    widget.querySelector('[data-action="fix"]').textContent = fixed ? 'Soltar posição' : 'Fixar posição';
}

function removeChart(widget) {
    destroyChart(widget.gridstackNode.chartId);
    grid.removeWidget(widget);
    updateEmptyState();
    markDirty();
    showToast('Gráfico removido. Salve para confirmar.');
}

function updateEmptyState() {
    document.getElementById('empty-grid').hidden = grid.engine.nodes.length > 0;
}


// =============================================================================================
// Configurar um gráfico
// =============================================================================================

async function openConfigure(widget) {
    const node = widget.gridstackNode;
    const dialog = document.getElementById('configure-modal');
    const preview = document.getElementById('json-structure');

    document.getElementById('chart-title').value = node.chartTitle;
    document.getElementById('chart-url').value = node.chartUrl;
    document.getElementById('pooling-seconds').value = node.poolingSeconds;
    preview.textContent = 'Carregando...';

    dialog.returnValue = '';
    dialog.showModal();
    dialog.addEventListener('close', () => applyConfigure(widget, dialog.returnValue === 'ok'), { once: true });

    try {
        const response = await fetch(node.chartUrl);
        if (!response.ok) throw new Error(`a fonte respondeu ${response.status}`);
        preview.textContent = JSON.stringify(await response.json(), null, 2).slice(0, 6000);
    } catch (error) {
        preview.textContent = `Não consegui ler os dados: ${error.message}`;
    }
}

function applyConfigure(widget, confirmed) {
    if (!confirmed) return;

    const node = widget.gridstackNode;
    const url = extractUrl(document.getElementById('chart-url').value);
    if (!url) {
        showToast('Informe a URL dos dados (ou cole um comando curl).', 'error');
        return;
    }

    node.chartTitle = document.getElementById('chart-title').value.trim() || CHART_TYPES[node.chartType] || node.chartType;
    node.chartUrl = url;
    node.poolingSeconds = String(Math.max(0, Number(document.getElementById('pooling-seconds').value) || 0));

    widget.querySelector('.chart-header h3').textContent = node.chartTitle;
    widget.querySelector('.chart-source').textContent = sourceLabel(url);

    fetchChartData(node.chartId, url, node.chartType);
    startPolling(node.chartId, url, node.chartType, node.poolingSeconds);
    markDirty();
}

// =============================================================================================
// Nome, salvar e excluir
// =============================================================================================

function setupAddChartMenu() {
    const list = document.getElementById('add-chart-list');
    list.append(...Object.entries(CHART_TYPES).map(([type, label]) => {
        const button = element('button', '', label);
        button.type = 'button';
        button.addEventListener('click', () => {
            document.getElementById('add-chart-menu').open = false;
            const widget = addChart({ type });
            updateEmptyState();
            markDirty();
            widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        return button;
    }));
}

function setupNameField() {
    const field = document.getElementById('dashboard-name');
    field.addEventListener('input', markDirty);
    field.addEventListener('keydown', event => {
        if (event.key === 'Enter') document.getElementById('save-dashboard-btn').click();
    });
}

function setupSave() {
    document.getElementById('save-dashboard-btn').addEventListener('click', saveDashboard);
}

async function saveDashboard() {
    const field = document.getElementById('dashboard-name');
    const name = field.value.trim();

    if (!NAME_PATTERN.test(name)) {
        showToast('Dê um nome com letras, números, "-" ou "_" (sem espaços).', 'error');
        field.focus();
        return;
    }
    if (name !== savedName && knownDashboards.includes(name)) {
        showToast(`Já existe um dashboard "${name}". Escolha outro nome.`, 'error');
        field.focus();
        return;
    }

    const payload = { newName: name, layout: serializeLayout() };
    if (savedName && savedName !== name) payload.lastName = savedName;

    const response = await fetch('/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => null);

    if (!response?.ok) {
        const result = await response?.json().catch(() => ({}));
        showToast(result?.message || 'Não consegui salvar. Tente de novo.', 'error');
        return;
    }

    savedName = name;
    window.history.replaceState({}, '', `/pages/dashboards.html?name=${encodeURIComponent(name)}`);
    document.title = `${name} - ivan-vanko`;
    document.getElementById('crumb').textContent = 'Dashboard';
    document.getElementById('remove-dashboard').hidden = false;
    knownDashboards = (await loadSidebar(name)).dashboards;
    markClean();
    showToast('Dashboard salvo.', 'ok');
}

function serializeLayout() {
    return serializeNodes(grid.engine.nodes);
}

// "Excluir" vira "Excluir de vez? [Excluir] [Cancelar]" na própria barra
function setupRemove() {
    const box = document.getElementById('remove-dashboard');
    const start = box.querySelector('[data-confirm-start]');
    const ask = box.querySelector('[data-confirm-ask]');

    start.addEventListener('click', () => {
        start.hidden = true;
        ask.hidden = false;
        document.getElementById('remove-dashboard-btn').focus();
    });

    box.querySelector('[data-confirm-cancel]').addEventListener('click', () => {
        ask.hidden = true;
        start.hidden = false;
    });

    document.getElementById('remove-dashboard-btn').addEventListener('click', async () => {
        const response = await fetch(`/api/dashboards/${encodeURIComponent(savedName)}`, { method: 'DELETE' }).catch(() => null);
        if (!response?.ok) {
            showToast('Não consegui excluir. Tente de novo.', 'error');
            return;
        }

        markClean();
        window.location.href = `/?success=${encodeURIComponent(`Dashboard ${savedName} excluído.`)}`;
    });
}


// =============================================================================================
// Grade e alterações não salvas
// =============================================================================================

function setupGridEvents() {
    grid.on('change', markDirty);

    // O Chart.js precisa recalcular o tamanho quando o quadro muda
    const resize = (event, el) => {
        const chartId = el.gridstackNode?.chartId;
        charts[chartId]?.resize();
    };
    grid.on('resizestop', resize);
    grid.on('dragstop', resize);
}

function markDirty() {
    isDirty = true;
    document.getElementById('unsaved').hidden = false;
}

function markClean() {
    isDirty = false;
    document.getElementById('unsaved').hidden = true;
}

function warnBeforeLeaving() {
    window.addEventListener('beforeunload', event => {
        if (isDirty) event.preventDefault();
    });
}
