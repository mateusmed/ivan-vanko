// Tema dos gráficos, sem DOM (testável no node): paleta, nomes dos tipos, cores por série/fatia e opções.
// A cor é do ivan-vanko, não da fonte de dados: a mesma série tem a mesma cor em todo dashboard.

// Paleta categórica validada (ordem fixa; nunca repetir cores: depois da 8ª série vira cinza "outros")
export const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const OTHER = '#a3a0b3';
const SURFACE = '#ffffff';

// Tipos em que cada fatia (label) é uma categoria; nos outros, cada dataset é uma série
const PER_LABEL_TYPES = ['pie', 'doughnut', 'polarArea'];

export const CHART_TYPES = {
    bar: 'Barras',
    line: 'Linha',
    pie: 'Pizza',
    doughnut: 'Rosca',
    radar: 'Radar',
    polarArea: 'Área polar',
    bubble: 'Bolhas',
    scatter: 'Dispersão'
};

// Fonte, cores de texto e grade, legenda e tooltip: o Chart.js inteiro com a cara do ivan-vanko
export function applyDefaults(Chart) {
    Chart.defaults.font.family = "'Manrope', system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#6b6880';
    Chart.defaults.borderColor = '#eceaf3';
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.tooltip.backgroundColor = '#1e1b2e';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.elements.line.borderWidth = 2;
    Chart.defaults.elements.point.radius = 3;
    Chart.defaults.elements.point.hoverRadius = 5;
}

export function colorAt(index) {
    return index < PALETTE.length ? PALETTE[index] : OTHER;
}

// Pinta os dados conforme o tipo, ignorando as cores que vieram da API
export function themeData(type, data) {
    const datasets = (data.datasets || []).map((dataset, index) => {
        if (PER_LABEL_TYPES.includes(type)) {
            const colors = (data.labels || dataset.data || []).map((_, i) => colorAt(i));
            return { ...dataset, backgroundColor: colors, borderColor: SURFACE, borderWidth: 2, hoverOffset: 6 };
        }

        const color = colorAt(index);
        if (type === 'line') {
            return { ...dataset, borderColor: color, backgroundColor: color, pointBackgroundColor: color, fill: false, tension: 0.25 };
        }
        if (type === 'radar') {
            return { ...dataset, borderColor: color, backgroundColor: `${color}22`, pointBackgroundColor: color };
        }
        if (type === 'bar') {
            return { ...dataset, backgroundColor: color, borderColor: SURFACE, borderWidth: 0, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 36 };
        }
        // bubble e scatter: marcas um pouco translúcidas, com anel da cor da superfície onde se sobrepõem
        return { ...dataset, backgroundColor: `${color}b3`, borderColor: SURFACE, borderWidth: 2 };
    });

    return { ...data, datasets };
}

export function chartOptions(type) {
    const options = { responsive: true, maintainAspectRatio: false, animation: { duration: 300 } };
    if (['bar', 'line', 'bubble', 'scatter'].includes(type)) {
        options.scales = {
            x: { grid: { display: false } },
            y: { beginAtZero: type === 'bar', border: { display: false } }
        };
    }
    return options;
}
