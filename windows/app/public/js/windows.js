(function(global) {
    let tabCount = 0;
    let ultimaAberta = 0;
    const tabInstances = {};

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function criarNovaAba(imgSrc, nomeAba, conteudoPath) {
        const agora = Date.now();
        if (agora - ultimaAberta < 250) {
            return;
        }
        ultimaAberta = agora;

        if (!tabInstances[conteudoPath]) {
            tabInstances[conteudoPath] = 0;
        }
        tabInstances[conteudoPath]++;

        tabCount++;
        const newTabId = 'tab' + tabCount;
        const instanceNumber = tabInstances[conteudoPath];
        const tabTitle = instanceNumber > 1 ? `${nomeAba} (${instanceNumber})` : nomeAba;

        const newTabLink = document.createElement('li');
        newTabLink.className = 'nav-item';
        newTabLink.setAttribute('draggable', 'true');
        newTabLink.innerHTML = `
            <a class="nav-link" id="${newTabId}-link" data-bs-toggle="tab" href="#${newTabId}" role="tab" aria-controls="${newTabId}" aria-selected="false">
                <div class="container_nav_item_window">
                    <div class="nav-item-window">
                        <div class="container_img_window cnt-generic-win">
                            <div class="nav-img-window">
                                <img src="${imgSrc}" alt="" draggable="false">
                            </div>
                        </div>
                        <div class="container_text_window cnt-generic-win">
                            <div class="nav-text-window">
                                ${tabTitle}
                            </div>
                        </div>
                        <div class="container_close_window cnt-generic-win">
                            <div class="nav-close-window">
                                <div class="window-btn-close closeTab"></div>
                            </div>
                        </div>
                        <div class="container_limit_winodw-r">
                            <div class="limit-window-line"></div>
                        </div>
                    </div>
                </div>
            </a>
        `;
        document.getElementById('tab-list').appendChild(newTabLink);

        const newTabContent = document.createElement('div');
        newTabContent.className = 'tab-pane fade';
        newTabContent.id = newTabId;
        newTabContent.setAttribute('role', 'tabpanel');
        newTabContent.setAttribute('aria-labelledby', `${newTabId}-link`);
        newTabContent.dataset.contentPath = conteudoPath;
        document.getElementById('tabContent').appendChild(newTabContent);

        fetch(conteudoPath)
            .then(response => response.text())
            .then(data => {
                newTabContent.innerHTML = data;
                const newTabLinkElement = document.querySelector(`#${newTabId}-link`);
                const tab = new bootstrap.Tab(newTabLinkElement);
                tab.show();
                atualizarEstadoAba(newTabId);
            })
            .catch(error => {
                console.error("Erro ao carregar conteúdo:", error);
            });
    }

    function atualizarEstadoAba(tabId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`a[data-bs-toggle="tab"][href="#${tabId}"]`).classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active', 'show');
        });
        document.getElementById(tabId).classList.add('active', 'show');
    }

    function initSortable() {
        new Sortable(document.getElementById('tab-list'), {
            animation: 150,
            onEnd: function () {
            },
        });
    }

    function adicionarEventoDeClique(botaoId, imgSrc, nomeAba, conteudoPath) {
        document.getElementById(botaoId).addEventListener('click', debounce(function() {
            criarNovaAba(imgSrc, nomeAba, conteudoPath);
        }, 250));
    }

    function init() {
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('tab-list').addEventListener('click', function(e) {
                if (e.target.classList.contains('closeTab')) {
                    const tabId = e.target.closest('a').getAttribute('href').substring(1);
                    const contentPath = document.getElementById(tabId).dataset.contentPath;

                    if (tabInstances[contentPath]) {
                        tabInstances[contentPath]--;
                    }

                    document.getElementById(tabId).remove();
                    e.target.closest('li').remove();

                    if (document.querySelectorAll('#tab-list li').length > 0) {
                        const firstTabLink = document.querySelector('#tab-list a:first-child');
                        const firstTab = new bootstrap.Tab(firstTabLink);
                        firstTab.show();
                    }
                } else if (e.target.classList.contains('nav-link')) {
                    const tabId = e.target.getAttribute('href').substring(1);
                    atualizarEstadoAba(tabId);
                }
            });
            initSortable();

            const tabList = document.getElementById('tab-list');
            tabList.addEventListener('wheel', function(event) {
                if (event.deltaY > 0) {
                    this.scrollLeft += 30; 
                } else {
                    this.scrollLeft -= 30;
                }
                event.preventDefault();
            });
        });
    }

    global.TabManager = {
        init,
        adicionarEventoDeClique
    };
})(window);

TabManager.init();
