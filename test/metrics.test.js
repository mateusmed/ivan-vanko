// Métricas: adaptador (justin-hammer → Chart.js) e o proxy, com um justin-hammer de mentira
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const { toChartData, displayName } = require('../services/metrics-adapter.js');

const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ivan-vanko-metricas-'));
let fake;
let server;
let base;
let lastQuery = null;

const SERIES = {
    metric: 'traefik_service_requests_total',
    step: 60,
    timestamps: [Date.UTC(2026, 9, 23, 15, 0), Date.UTC(2026, 9, 23, 15, 1)],
    series: [{ name: 'api@docker', values: [1.5, null] }, { name: 'web@docker', values: [0.5, 2] }]
};

before(async () => {
    fake = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://x');
        lastQuery = url.searchParams;
        if (url.pathname === '/api/metrics') return send(res, 200, [{ name: 'traefik_service_requests_total', type: 'counter' }]);
        if (url.searchParams.get('fn') === 'soma') return send(res, 400, { message: 'fn inválida: soma' });
        return send(res, 200, SERIES);
    });
    await new Promise(resolve => fake.listen(0, '127.0.0.1', resolve));

    process.env.DATA_PATH = DATA;
    process.env.METRICS_URL = `http://127.0.0.1:${fake.address().port}`;
    const { app } = require('../server.js');
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
    server.close();
    fake.close();
    fs.rmSync(DATA, { recursive: true, force: true });
});

function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

test('vários pontos: eixo de tempo (hora de Brasília) e um dataset por série, com buraco no null', () => {
    const data = toChartData(SERIES);
    assert.deepEqual(data.labels, ['12:00', '12:01']);
    assert.deepEqual(data.datasets.map(d => [d.label, d.data]), [['api', [1.5, null]], ['web', [0.5, 2]]]);
});

test('um ponto só (range = step): uma categoria por série, para pizza', () => {
    const data = toChartData({ ...SERIES, timestamps: [SERIES.timestamps[0]], series: [{ name: 'api@docker', values: [30] }, { name: 'web@docker', values: [null] }] });
    assert.deepEqual(data.labels, ['api', 'web']);
    assert.deepEqual(data.datasets[0].data, [30, 0]);
});

test('nome do serviço sem o sufixo do provider do Traefik', () => {
    assert.equal(displayName('ivan-vanko@docker'), 'ivan-vanko');
    assert.equal(displayName('total'), 'total');
});

test('proxy: repassa a consulta (com where e regex) e devolve no formato do Chart.js', async () => {
    const response = await fetch(`${base}/api/metrics/series?metric=traefik_service_requests_total&by=service&where.code=~5..`);
    assert.equal(response.status, 200);
    assert.equal(lastQuery.get('where.code'), '~5..');
    assert.deepEqual((await response.json()).labels, ['12:00', '12:01']);
});

test('proxy: erro da consulta volta com o status e a mensagem do justin-hammer', async () => {
    const response = await fetch(`${base}/api/metrics/series?metric=x&fn=soma`);
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /fn inválida/);
});

test('catálogo passa direto', async () => {
    const catalog = await (await fetch(`${base}/api/metrics/catalog`)).json();
    assert.equal(catalog[0].name, 'traefik_service_requests_total');
});

test('os layouts de exemplo (particula e segurança) só usam a API de métricas', () => {
    for (const name of ['dash-particula', 'dash-seguranca']) {
        const layout = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'layouts-examples', `${name}.json`), 'utf-8'));
        assert.equal(layout.length, 4, name);
        assert.ok(layout.every(widget => widget.properties.url.startsWith('/api/metrics/series?')), name);
    }
});
