// Formato salvo dos dashboards e leitura da configuração de um gráfico, sem DOM (testável no node)

export const DEFAULT_POLLING_SECONDS = 60;
export const SAMPLE_URL_PREFIX = '/api/chart-boilerplate/';

// O formato salvo (o mesmo dos exemplos em data/layouts-examples), a partir dos nós do GridStack
export function serializeNodes(nodes) {
    return nodes
        .filter(node => node.chartType && node.chartUrl)
        .map(node => ({
            type: node.chartType,
            fixed: Boolean(node.fixed),
            coordinates: { x: node.x, y: node.y, w: node.w, h: node.h },
            properties: { url: node.chartUrl, pooling: String(node.poolingSeconds ?? DEFAULT_POLLING_SECONDS), title: node.chartTitle }
        }));
}

// Aceita a URL pura ou um comando curl colado ("curl -X GET https://...")
export function extractUrl(text) {
    const value = text.trim();
    if (!value.startsWith('curl')) return value;

    // URL completa, ou um caminho "/..." depois de um espaço (com ou sem aspas)
    const match = /(https?:\/\/[^\s'"]+)|\s['"]?(\/[^\s'"]+)/.exec(value);
    if (!match) return '';
    return match[1] || match[2];
}

// De onde vêm os dados, em poucas palavras: "dados de exemplo", "/api/x" ou "host/caminho"
export function sourceLabel(url, origin) {
    if (url.startsWith(SAMPLE_URL_PREFIX)) return 'dados de exemplo';
    try {
        const parsed = new URL(url, origin);
        return parsed.origin === origin ? parsed.pathname : `${parsed.host}${parsed.pathname}`;
    } catch {
        return url;
    }
}
