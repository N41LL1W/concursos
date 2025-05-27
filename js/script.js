document.addEventListener('DOMContentLoaded', () => {
    const containerTopicosPortugues = document.getElementById('lista-topicos-portugues');
    const SECAO_PORTUGUES_ID = 'secao-estudo-portugues';

    // Função para criar um elemento de tópico
    function criarElementoTopico(topicoData) {
        const topicoDiv = document.createElement('div');
        topicoDiv.classList.add('topico-estudo');
        topicoDiv.id = topicoData.id;

        const topicoHeader = document.createElement('div');
        topicoHeader.classList.add('topico-header');

        const tituloEl = document.createElement('h3');
        tituloEl.textContent = topicoData.titulo;
        topicoHeader.appendChild(tituloEl);

        const botaoStatus = document.createElement('button');
        botaoStatus.classList.add('btn-status');
        botaoStatus.dataset.topicoId = topicoData.id;
        botaoStatus.textContent = 'Marcar Concluído'; // Texto inicial
        topicoHeader.appendChild(botaoStatus);

        topicoDiv.appendChild(topicoHeader);

        const descricaoEl = document.createElement('p');
        descricaoEl.classList.add('descricao');
        descricaoEl.textContent = topicoData.descricaoCurta;
        topicoDiv.appendChild(descricaoEl);

        const conteudoDetalhadoDiv = document.createElement('div');
        conteudoDetalhadoDiv.classList.add('conteudo-detalhado');
        if (topicoData.conteudoCompleto) {
            topicoData.conteudoCompleto.forEach(itemConteudo => {
                let elemento;
                if (itemConteudo.tipo === 'paragrafo') {
                    elemento = document.createElement('p');
                    elemento.textContent = itemConteudo.texto;
                } else if (itemConteudo.tipo === 'subtitulo') {
                    elemento = document.createElement('h4');
                    elemento.textContent = itemConteudo.texto;
                    elemento.style.marginTop = '15px';
                    elemento.style.marginBottom = '8px';
                } else if (itemConteudo.tipo === 'lista_ordenada' || itemConteudo.tipo === 'lista_nao_ordenada') {
                    elemento = document.createElement(itemConteudo.tipo === 'lista_ordenada' ? 'ol' : 'ul');
                    if (itemConteudo.items) {
                        itemConteudo.items.forEach(liText => {
                            const li = document.createElement('li');
                            li.textContent = liText;
                            elemento.appendChild(li);
                        });
                    }
                } else if (itemConteudo.tipo === 'exemplo') {
                    elemento = document.createElement('p');
                    elemento.classList.add('exemplo-conteudo'); // Para estilização opcional
                    elemento.innerHTML = `<strong>Exemplo:</strong> <em>${itemConteudo.texto}</em>`;
                    // Estilos podem ser adicionados via CSS para .exemplo-conteudo
                }
                if (elemento) {
                    conteudoDetalhadoDiv.appendChild(elemento);
                }
            });
        }
        topicoDiv.appendChild(conteudoDetalhadoDiv);

        const materiaisEstudoDiv = document.createElement('div');
        materiaisEstudoDiv.classList.add('materiais-estudo');
        const materiaisTitulo = document.createElement('h4');
        materiaisTitulo.textContent = 'Materiais Sugeridos:';
        materiaisEstudoDiv.appendChild(materiaisTitulo);
        const materiaisUl = document.createElement('ul');
        if (topicoData.materiaisSugeridos && topicoData.materiaisSugeridos.length > 0) {
            topicoData.materiaisSugeridos.forEach(material => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = material.link || '#'; // Link padrão se não houver
                a.textContent = material.titulo;
                a.target = "_blank";
                li.appendChild(a);
                materiaisUl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Nenhum material específico listado.';
            materiaisUl.appendChild(li);
        }
        materiaisEstudoDiv.appendChild(materiaisUl);
        topicoDiv.appendChild(materiaisEstudoDiv);

        // Adiciona event listener ao botão criado
        botaoStatus.addEventListener('click', alternarStatusTopico);

        return topicoDiv;
    }

    // Função para buscar e renderizar o conteúdo dos tópicos de português
    async function carregarConteudosPortugues() {
        if (!containerTopicosPortugues) {
            console.warn(`Container com ID 'lista-topicos-portugues' não encontrado.`);
            return;
        }
        try {
            const response = await fetch('data/portugues_topicos.json');
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
            }
            const topicos = await response.json();

            containerTopicosPortugues.innerHTML = ''; // Limpa container antes de adicionar novos
            topicos.forEach(topicoData => {
                const elementoTopico = criarElementoTopico(topicoData);
                containerTopicosPortugues.appendChild(elementoTopico);
            });
        } catch (error) {
            console.error("Falha ao carregar conteúdo de Português:", error);
            containerTopicosPortugues.innerHTML = "<p style='color:red;'>Erro ao carregar os tópicos. Verifique o console e o arquivo JSON.</p>";
        }
    }

    // Carrega o estado dos tópicos do localStorage
    function carregarProgresso() {
        const botoes = document.querySelectorAll('.btn-status'); // Seleciona novamente após criação dinâmica
        botoes.forEach(botao => {
            const topicoId = botao.dataset.topicoId;
            const topicoDiv = document.getElementById(topicoId);
            if (!topicoDiv) return;
            const isConcluido = localStorage.getItem(topicoId) === 'true';

            if (isConcluido) {
                topicoDiv.classList.add('concluido');
                botao.textContent = 'Desmarcar';
            } else {
                topicoDiv.classList.remove('concluido');
                botao.textContent = 'Marcar Concluído';
            }
        });
    }

    // Alterna o estado de um tópico (concluído/não concluído)
    function alternarStatusTopico(event) {
        const botao = event.target;
        const topicoId = botao.dataset.topicoId;
        const topicoDiv = document.getElementById(topicoId);
        if (!topicoDiv) return;
        
        let isConcluido = localStorage.getItem(topicoId) === 'true';
        isConcluido = !isConcluido; 

        localStorage.setItem(topicoId, isConcluido);

        if (isConcluido) {
            topicoDiv.classList.add('concluido');
            botao.textContent = 'Desmarcar';
        } else {
            topicoDiv.classList.remove('concluido');
            botao.textContent = 'Marcar Concluído';
        }
    }

    // Função para destacar o link ativo na navegação
    function destacarLinkAtivo() {
        const sections = document.querySelectorAll('main section');
        const navLinks = document.querySelectorAll('header nav ul li a');

        // Função para ser chamada no scroll e no load
        const updateActiveLink = () => {
            let currentSectionId = '';
            let minDistance = Infinity;

            sections.forEach(section => {
                const sectionRect = section.getBoundingClientRect();
                // Considera a seção como ativa se o topo dela estiver visível ou um pouco acima
                // e se for a mais próxima do topo da viewport
                if (sectionRect.top <= 150 && sectionRect.bottom >= 150) {
                     // Se múltiplas seções se encaixam, pega a mais próxima do topo
                    if (Math.abs(sectionRect.top) < minDistance) {
                        minDistance = Math.abs(sectionRect.top);
                        currentSectionId = section.getAttribute('id');
                    }
                }
            });
            
            // Caso especial para quando o topo da página é visível e nenhuma seção está "ativa"
            if (window.pageYOffset < sections[0].offsetTop - 150 && sections.length > 0) {
                currentSectionId = sections[0].getAttribute('id');
            }


            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkHref = link.getAttribute('href');
                if (linkHref === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });

            // Se, após a lógica, nenhum link estiver ativo (ex: rolou para o rodapé ou algo assim)
            // e houver um link para o dashboard, mantenha-o ativo como fallback
            // ou o primeiro link da navegação.
            const isActiveLinkPresent = Array.from(navLinks).some(link => link.classList.contains('active'));
            if (!isActiveLinkPresent && navLinks.length > 0) {
                const dashboardLink = document.querySelector('header nav ul li a[href="#dashboard"]');
                if (dashboardLink) {
                    dashboardLink.classList.add('active');
                } else {
                    navLinks[0].classList.add('active'); // Ativa o primeiro link se o do dashboard não existir
                }
            }
        };
        
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); // Chama uma vez no carregamento
    }

    // Inicialização
    async function init() {
        await carregarConteudosPortugues(); // Espera o conteúdo ser carregado e renderizado
        carregarProgresso(); // Carrega o progresso para os elementos recém-criados
        destacarLinkAtivo();
    }

    init();
});