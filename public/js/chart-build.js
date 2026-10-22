// Gráficos: busca os dados, aplica o tema (chart-theme.mjs) e desenha com o Chart.js.
import { themeData, chartOptions, applyDefaults } from './chart-theme.mjs';

export { CHART_TYPES } from './chart-theme.mjs';

export const charts = {};
export const pollingConfig = {};

if (typeof window !== 'undefined' && window.Chart) applyDefaults(window.Chart);

export function createOrUpdateChart(elementId, type, data) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;

    setStatus(canvas, '');
    renderFilters(canvas, elementId, type, data.filters || []);

    const themed = themeData(type, data);
    const chart = charts[elementId];

    if (chart && chart.config.type === type) {
        chart.data.labels = themed.labels;
        chart.data.datasets = themed.datasets;
        chart.update();
        return;
    }

    chart?.destroy();
    charts[elementId] = new Chart(canvas.getContext('2d'), { type, data: themed, options: chartOptions(type) });
}

export async function fetchChartData(elementId, url, type) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return null;
    if (!charts[elementId]) setStatus(canvas, 'Carregando os dados...');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`a fonte respondeu ${response.status}`);

        const data = await response.json();
        createOrUpdateChart(elementId, type, data);
        return data;
    } catch (error) {
        console.error(`[CLIENT] Error fetching data for ${elementId}:`, error);
        // TypeError do fetch = nem chegou resposta (fonte fora do ar, endereço errado ou bloqueio de CORS)
        const reason = error instanceof TypeError ? 'a fonte não respondeu (fora do ar, endereço errado ou CORS)' : error.message;
        setStatus(canvas, `Não consegui carregar os dados: ${reason}.`, true);
        return null;
    }
}

// Polling: um intervalo por gráfico, trocado sempre que a URL ou o tempo mudam
export function startPolling(elementId, url, type, seconds) {
    stopPolling(elementId);
    const interval = Number(seconds);
    if (!interval || interval <= 0) return;

    pollingConfig[elementId] = {
        url,
        interval: interval * 1000,
        intervalId: setInterval(() => fetchChartData(elementId, url, type), interval * 1000)
    };
}

export function stopPolling(elementId) {
    if (!pollingConfig[elementId]) return;
    clearInterval(pollingConfig[elementId].intervalId);
    delete pollingConfig[elementId];
}

export function destroyChart(elementId) {
    stopPolling(elementId);
    charts[elementId]?.destroy();
    delete charts[elementId];
}

function setStatus(canvas, message, isError = false) {
    const status = canvas.parentElement.querySelector('.chart-status');
    if (!status) return;

    status.textContent = message;
    status.hidden = !message;
    status.classList.toggle('error', isError);
}

// Filtros que a fonte de dados oferece (ex.: região, ano): mudar um busca de novo com o filtro na URL
function renderFilters(canvas, elementId, type, filters) {
    const card = canvas.closest('.grid-stack-item-content');
    const container = card.querySelector('.chart-filters');
    if (!container) return;

    container.hidden = filters.length === 0;
    container.replaceChildren(...filters.map(filter => {
        const label = document.createElement('label');
        const select = document.createElement('select');
        select.dataset.key = filter.key;

        for (const option of filter.options || []) {
            select.append(new Option(option, option, false, option === filter.selected));
        }

        select.addEventListener('change', () => {
            const params = new URLSearchParams();
            container.querySelectorAll('select').forEach(item => params.append(item.dataset.key, item.value));

            const node = canvas.closest('.grid-stack-item').gridstackNode;
            const baseUrl = node?.chartUrl || `/api/chart-boilerplate/${type}`;
            const separator = baseUrl.includes('?') ? '&' : '?';
            fetchChartData(elementId, `${baseUrl}${separator}${params}`, type);
        });

        label.append(filter.label || filter.key, select);
        return label;
    }));
}
