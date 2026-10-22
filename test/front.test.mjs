// Testes das partes puras do front (sem navegador): tema dos gráficos e formato salvo dos dashboards
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, colorAt, themeData, chartOptions, CHART_TYPES } from '../public/js/chart-theme.mjs';
import { serializeNodes, extractUrl, sourceLabel } from '../public/js/layout.mjs';

const BAR = {
    labels: ['a', 'b', 'c'],
    datasets: [
        { label: 'Total', data: [1, 2, 3], backgroundColor: ['red', 'green', 'blue'] },
        { label: 'Online', data: [3, 2, 1], backgroundColor: 'pink' }
    ]
};

test('paleta: 8 cores fixas; da 9ª série em diante é cinza, nunca repete uma cor', () => {
    assert.equal(PALETTE.length, 8);
    assert.equal(new Set(PALETTE).size, 8);
    assert.equal(colorAt(0), PALETTE[0]);
    assert.equal(colorAt(8), colorAt(20));
    assert.ok(!PALETTE.includes(colorAt(8)));
});

test('barras e linhas: uma cor por série, ignorando as cores que vieram da API', () => {
    const themed = themeData('bar', BAR);
    assert.equal(themed.datasets[0].backgroundColor, PALETTE[0]);
    assert.equal(themed.datasets[1].backgroundColor, PALETTE[1]);
    assert.equal(themed.datasets[0].borderRadius, 4);

    const line = themeData('line', BAR);
    assert.equal(line.datasets[1].borderColor, PALETTE[1]);
    assert.equal(line.datasets[1].fill, false);
});

test('pizza, rosca e área polar: uma cor por fatia, com borda da cor da superfície', () => {
    for (const type of ['pie', 'doughnut', 'polarArea']) {
        const themed = themeData(type, BAR);
        assert.deepEqual(themed.datasets[0].backgroundColor, PALETTE.slice(0, 3), type);
        assert.equal(themed.datasets[0].borderColor, '#ffffff');
    }
});

test('o tema não altera os dados nem os filtros', () => {
    const themed = themeData('bar', { ...BAR, filters: [{ key: 'ano' }] });
    assert.deepEqual(themed.datasets.map(d => d.data), [[1, 2, 3], [3, 2, 1]]);
    assert.deepEqual(themed.filters, [{ key: 'ano' }]);
    assert.deepEqual(BAR.datasets[0].backgroundColor, ['red', 'green', 'blue']);
});

test('eixos só nos tipos que têm eixo; barras começam do zero', () => {
    assert.equal(chartOptions('bar').scales.y.beginAtZero, true);
    assert.equal(chartOptions('line').scales.y.beginAtZero, false);
    assert.equal(chartOptions('pie').scales, undefined);
    assert.equal(Object.keys(CHART_TYPES).length, 8);
});

test('formato salvo: o mesmo dos exemplos, sem os nós que não são gráfico', () => {
    const nodes = [
        { x: 0, y: 0, w: 6, h: 13, chartType: 'bar', chartUrl: '/api/x', poolingSeconds: 30, chartTitle: 'Vendas', fixed: true },
        { x: 6, y: 0, w: 6, h: 13 }
    ];
    assert.deepEqual(serializeNodes(nodes), [{
        type: 'bar',
        fixed: true,
        coordinates: { x: 0, y: 0, w: 6, h: 13 },
        properties: { url: '/api/x', pooling: '30', title: 'Vendas' }
    }]);
});

test('URL dos dados: pura ou tirada de um curl colado', () => {
    assert.equal(extractUrl('  https://api.x.com/metrics  '), 'https://api.x.com/metrics');
    assert.equal(extractUrl('curl -X GET https://api.x.com/m?a=1'), 'https://api.x.com/m?a=1');
    assert.equal(extractUrl("curl -X GET '/api/chart-boilerplate/bar'"), '/api/chart-boilerplate/bar');
    assert.equal(extractUrl('curl -X GET'), '');
});

test('origem dos dados em poucas palavras', () => {
    const origin = 'http://localhost:3000';
    assert.equal(sourceLabel('/api/chart-boilerplate/bar', origin), 'dados de exemplo');
    assert.equal(sourceLabel('/api/metrics', origin), '/api/metrics');
    assert.equal(sourceLabel('https://hammer.local/requests', origin), 'hammer.local/requests');
});
