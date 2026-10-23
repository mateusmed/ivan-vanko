// Resultado do justin-hammer (grade de tempo + uma série por grupo) → dados do Chart.js.
// Vários pontos: eixo de tempo, um dataset por série (linha, barras). Um ponto só (range = step): uma categoria
// por série, num dataset só (pizza, rosca, barras "agora").
const TIME_ZONE = process.env.TIME_ZONE || 'America/Sao_Paulo';
const DAY_SECONDS = 24 * 60 * 60;

function toChartData(result) {
    if (result.timestamps.length === 1) return categorical(result);
    return temporal(result);
}

function temporal({ timestamps, series, step }) {
    const format = timeFormat(step);
    return {
        labels: timestamps.map(ts => format.format(new Date(ts))),
        datasets: series.map(item => ({ label: displayName(item.name), data: item.values, spanGaps: false }))
    };
}

function categorical({ series, metric }) {
    return {
        labels: series.map(item => displayName(item.name)),
        datasets: [{ label: metric, data: series.map(item => item.values[0] ?? 0) }]
    };
}

function timeFormat(step) {
    const options = step >= DAY_SECONDS ? { day: '2-digit', month: '2-digit' } : { hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: TIME_ZONE });
}

// "ivan-vanko@docker" → "ivan-vanko": o sufixo é do provider do Traefik, não interessa no gráfico
function displayName(name) {
    return String(name).replace(/@(docker|internal|file)$/, '');
}

module.exports = { toChartData, displayName };
