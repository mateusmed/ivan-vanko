// Peças comuns às telas: menu lateral, avisos (toast), diálogo "Sobre" e escape de HTML.

// Mesmo padrão do servidor (server.js): o nome vira nome de arquivo
export const NAME_PATTERN = /^[\p{L}\p{N}_-]{1,80}$/u;

export function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function dashboardUrl(name) {
    return `/pages/dashboards.html?name=${encodeURIComponent(name)}`;
}

export async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} respondeu ${response.status}`);
    return response.json();
}


// =============================================================================================
// Menu lateral
// =============================================================================================

// Preenche as listas de dashboards e exemplos e marca o aberto. Devolve as duas listas.
export async function loadSidebar(activeName = null) {
    const [dashboards, examples] = await Promise.all([
        getJson('/api/dashboards').catch(() => []),
        getJson('/api/layouts-examples').catch(() => [])
    ]);

    fillList('dashboard-list', dashboards, activeName, 'Nenhum salvo ainda');
    fillList('example-list', examples, activeName, 'Nenhum exemplo');
    return { dashboards, examples };
}

function fillList(id, names, activeName, emptyText) {
    const list = document.getElementById(id);
    if (!list) return;

    if (names.length === 0) {
        list.replaceChildren(element('p', 'side-empty', emptyText));
        return;
    }

    list.replaceChildren(...names.map(name => {
        const link = element('a', `side-item${name === activeName ? ' active' : ''}`, name);
        link.href = dashboardUrl(name);
        if (name === activeName) link.setAttribute('aria-current', 'page');
        return link;
    }));
}


// =============================================================================================
// Avisos e diálogos
// =============================================================================================

let toastTimer = null;

export function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast${type ? ` toast-${type}` : ''}`;
    toast.hidden = false;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

// Aviso que veio de outra tela (?success=...): mostra uma vez e limpa da URL
export function showNoticeFromUrl() {
    const url = new URL(window.location.href);
    const success = url.searchParams.get('success');
    if (!success) return;

    showToast(success, 'ok');
    url.searchParams.delete('success');
    window.history.replaceState({}, document.title, url.toString());
}

export function setupDialogs() {
    document.querySelectorAll('[data-open]').forEach(button => {
        button.addEventListener('click', () => document.getElementById(button.dataset.open)?.showModal());
    });

    document.querySelectorAll('dialog').forEach(dialog => {
        dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close();
        });
    });
}

export function element(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}
