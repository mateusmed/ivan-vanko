// Testes da API do ivan-vanko: rodam com "npm test" (node --test), numa pasta de dados temporária
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'ivan-vanko-'));
const EXAMPLES = fs.mkdtempSync(path.join(os.tmpdir(), 'ivan-vanko-exemplos-'));
process.env.DATA_PATH = DATA;
process.env.EXAMPLES_PATH = EXAMPLES;
process.env.SIMULATED_DELAY_MS = '0';

const { app, isValidName } = require('../server.js');

let server;
let base;

before(async () => {
    fs.writeFileSync(path.join(EXAMPLES, 'exemplo.json'), '[]');
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
    server.close();
    fs.rmSync(DATA, { recursive: true, force: true });
    fs.rmSync(EXAMPLES, { recursive: true, force: true });
});

const LAYOUT = [{ type: 'bar', fixed: false, coordinates: { x: 0, y: 0, w: 6, h: 13 }, properties: { url: '/api/chart-boilerplate/bar', pooling: '60', title: 'Vendas' } }];

function save(body) {
    return fetch(`${base}/dashboard`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

test('nomes: letras (com acento), números, - e _; nada de caminho', () => {
    assert.equal(isValidName('vendas-2026'), true);
    assert.equal(isValidName('métricas_do_mês'), true);
    assert.equal(isValidName('../segredo'), false);
    assert.equal(isValidName('a/b'), false);
    assert.equal(isValidName(''), false);
    assert.equal(isValidName('x'.repeat(81)), false);
});

test('salvar, listar, abrir, renomear e excluir um dashboard', async () => {
    assert.equal((await save({ newName: 'vendas', layout: LAYOUT })).status, 200);
    assert.deepEqual(await (await fetch(`${base}/api/dashboards`)).json(), ['vendas']);
    assert.deepEqual(await (await fetch(`${base}/api/dashboards/vendas`)).json(), LAYOUT);

    assert.equal((await save({ newName: 'vendas-2026', lastName: 'vendas', layout: LAYOUT })).status, 200);
    assert.deepEqual(await (await fetch(`${base}/api/dashboards`)).json(), ['vendas-2026']);

    assert.equal((await fetch(`${base}/api/dashboards/vendas-2026`, { method: 'DELETE' })).status, 200);
    assert.equal((await fetch(`${base}/api/dashboards/vendas-2026`)).status, 404);
});

test('exemplos abrem pelo mesmo endereço dos dashboards', async () => {
    assert.deepEqual(await (await fetch(`${base}/api/layouts-examples`)).json(), ['exemplo']);
    assert.equal((await fetch(`${base}/api/dashboards/exemplo`)).status, 200);
});

test('nome com "../" é recusado ao salvar, abrir e excluir (nada sai da pasta de dados)', async () => {
    fs.writeFileSync(path.join(path.dirname(DATA), 'fora-ivan.json'), '"segredo"');

    const saved = await save({ newName: '../fora-ivan', layout: LAYOUT });
    assert.equal(saved.status, 400);
    assert.equal((await save({ newName: 'ok', lastName: '../fora-ivan', layout: LAYOUT })).status, 400);
    assert.equal((await fetch(`${base}/api/dashboards/..%2Ffora-ivan`)).status, 400);
    assert.equal((await fetch(`${base}/api/dashboards/..%2Ffora-ivan`, { method: 'DELETE' })).status, 400);

    assert.equal(fs.readFileSync(path.join(path.dirname(DATA), 'fora-ivan.json'), 'utf8'), '"segredo"');
    fs.rmSync(path.join(path.dirname(DATA), 'fora-ivan.json'));
});

test('salvar sem nome dá 400', async () => {
    assert.equal((await save({ layout: LAYOUT })).status, 400);
});

test('dados de exemplo trazem labels e datasets para cada tipo de gráfico', async () => {
    for (const type of ['bar', 'pie', 'line', 'doughnut', 'radar', 'polarArea', 'bubble', 'scatter']) {
        const data = await (await fetch(`${base}/api/chart-boilerplate/${type}`)).json();
        assert.ok(Array.isArray(data.datasets) && data.datasets.length > 0, type);
    }
});

test('módulos .mjs do front saem como JavaScript (o navegador recusa outro tipo)', async () => {
    const res = await fetch(`${base}/js/layout.mjs`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
});
