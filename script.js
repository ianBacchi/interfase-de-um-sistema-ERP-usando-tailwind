let todosClientes = [];
let paginaAtual = 1;
const clientesPorPagina = 8;

document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    configurarEventListeners();
});

function configurarEventListeners() {
    // Delegação para botões Visualizar
    document.getElementById('clientes-tbody').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="visualizar"]');
        if (btn) {
            const index = parseInt(btn.dataset.index);
            if (todosClientes[index]) {
                abrirModal(todosClientes[index]);
            }
        }
    });

    // Botões de paginação
    document.getElementById('btn-anterior').addEventListener('click', () => {
        if (paginaAtual > 1) {
            exibirPagina(paginaAtual - 1);
            atualizarBotoesPaginacao();
        }
    });

    document.getElementById('btn-proxima').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todosClientes.length / clientesPorPagina);
        if (paginaAtual < totalPaginas) {
            exibirPagina(paginaAtual + 1);
            atualizarBotoesPaginacao();
        }
    });

    // Voltar modal
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', fecharModal);
    }

    // ESC fecha modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

async function carregarClientes() {
    const tbody = document.getElementById('clientes-tbody');
    
    if (!tbody) {
        console.error('Elemento clientes-tbody não encontrado');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-400">Carregando...</td></tr>';

    try {
        const response = await fetch('clientes.csv');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const linhas = csvText.split(/\r?\n/);
        todosClientes = [];

        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha || linha === ',' || linha.split(',').length < 5) continue;

            const [codigo = '', nome = '', cpf_cnpj = '', email = '', telefone = ''] = linha.split(',');
            
            
            if (codigo && nome) {
                todosClientes.push({ codigo, nome, cpf_cnpj, email, telefone });
            }
        }

        if (todosClientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-400">Nenhum cliente encontrado</td></tr>';
            return;
        }

        exibirPagina(1);
        atualizarBotoesPaginacao();
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-red-400">Erro ao carregar dados. Verifique se o arquivo clientes.csv existe.</td></tr>';
        console.error('Erro ao carregar clientes:', error);
    }
}

function exibirPagina(numeroPagina) {
    const tbody = document.getElementById('clientes-tbody');
    tbody.innerHTML = '';

    const inicio = (numeroPagina - 1) * clientesPorPagina;
    const clientesPagina = todosClientes.slice(inicio, inicio + clientesPorPagina);

    clientesPagina.forEach((cliente, index) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-700 transition-colors duration-200';

        const emailClass = cliente.email === 'null' || !cliente.email ? 'text-red-400' : '';

        tr.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium">${cliente.codigo}</td>
            <td class="px-4 py-3 text-sm">
                <div class="flex items-center">
                    <span class="text-yellow-500 mr-2">👤</span>
                    <span class="font-medium">${cliente.nome}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm font-mono">${cliente.cpf_cnpj}</td>
            <td class="px-4 py-3 text-sm ${emailClass}">${cliente.email}</td>
            <td class="px-4 py-3 text-sm">${cliente.telefone}</td>
            <td class="px-4 py-3">
                <button 
                    class="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-4 py-1.5 rounded text-sm transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]" 
                    data-action="visualizar"
                    data-index="${inicio + index}"
                    aria-label="Visualizar cliente ${cliente.nome}"
                >
                    Visualizar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    paginaAtual = numeroPagina;
}

function abrirModal(cliente) {
    preencherCampo('modal-codigo', cliente.codigo);
    preencherCampo('modal-nome', cliente.nome);
    preencherCampo('modal-cnpj', cliente.cpf_cnpj);
    preencherCampo('modal-email', cliente.email === 'null' ? '' : cliente.email);
    preencherCampo('modal-telefone', cliente.telefone);

    document.getElementById('modal-cliente').classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');
    
    
    document.getElementById('modal-codigo')?.focus();
}

function preencherCampo(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.value = valor || '';
    }
}

function fecharModal() {
    document.getElementById('modal-cliente').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
}

function atualizarBotoesPaginacao() {
    const totalPaginas = Math.ceil(todosClientes.length / clientesPorPagina);
    const container = document.getElementById('paginas-container');
    
    if (!container) return;
    
    container.innerHTML = '';

    
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.setAttribute('aria-label', `Ir para página ${i}`);
        btn.setAttribute('aria-current', i === paginaAtual ? 'page' : 'false');
        
        if (i === paginaAtual) {
            btn.className = 'min-w-[36px] h-9 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded text-sm transition-all duration-200 shadow-md';
        } else {
            btn.className = 'min-w-[36px] h-9 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded text-sm transition-all duration-200 shadow-sm hover:shadow-md';
        }

        btn.addEventListener('click', () => {
            if (i !== paginaAtual) {
                exibirPagina(i);
                atualizarBotoesPaginacao();
            }
        });

        container.appendChild(btn);
    }

    
    atualizarBotoesNavegacao(totalPaginas);
}

function atualizarBotoesNavegacao(totalPaginas) {
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProxima = document.getElementById('btn-proxima');

    if (btnAnterior) {
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.setAttribute('aria-disabled', paginaAtual === 1);
        
        if (paginaAtual === 1) {
            btnAnterior.className = 'px-4 py-2 bg-gray-800 text-gray-500 rounded text-sm cursor-not-allowed opacity-60';
        } else {
            btnAnterior.className = 'px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded text-sm transition-all duration-200 shadow-sm hover:shadow-md';
        }
    }

    if (btnProxima) {
        btnProxima.disabled = paginaAtual === totalPaginas;
        btnProxima.setAttribute('aria-disabled', paginaAtual === totalPaginas);
        
        if (paginaAtual === totalPaginas) {
            btnProxima.className = 'px-4 py-2 bg-blue-800 text-gray-500 rounded text-sm cursor-not-allowed opacity-60';
        } else {
            btnProxima.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all duration-200 shadow-sm hover:shadow-md';
        }
    }
}