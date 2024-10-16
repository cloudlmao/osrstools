$(document).ready(function() {
    const itemListElement = $('#item-list');
    const itemDetailsModal = $('#itemDetailsModal');
    const searchInput = $('#search-input');
    let items = [];
    let searchIndex;

    function fetchItemMappings() {
        return fetch('https://prices.runescape.wiki/api/v1/osrs/mapping')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => console.error('Error fetching item mapping:', error));
    }

    function fetchAllItemPrices() {
        return fetch('https://prices.runescape.wiki/api/v1/osrs/latest')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .catch(error => console.error('Error fetching item prices:', error));
    }

    function initializeData() {
        Promise.all([fetchItemMappings(), fetchAllItemPrices()])
            .then(([mappingData, priceData]) => {
                const itemMapping = new Map(mappingData.map(item => [item.id, item]));
                const latestPrices = priceData.data;

                for (const [id, priceData] of Object.entries(latestPrices)) {
                    const mappedItem = itemMapping.get(parseInt(id));
                    if (mappedItem) {
                        items.push({
                            id: parseInt(id),
                            name: mappedItem.name,
                            high: priceData.high,
                            low: priceData.low,
                            lastUpdatedHigh: new Date(priceData.highTime * 1000).toLocaleString(),
                            lastUpdatedLow: new Date(priceData.lowTime * 1000).toLocaleString(),
                        });
                    }
                }

                initializeSearchIndex();
                displayItems(items);
                setupEventListeners();
            })
            .catch(error => console.error('Error initializing data:', error));
    }

    function initializeSearchIndex() {
        searchIndex = new JsSearch.Search('id');
        searchIndex.addIndex('name');
        searchIndex.addDocuments(items);
    }

    function displayItems(itemList, start = 0, count = 100) {
        const fragment = document.createDocumentFragment();
        itemList.slice(start, start + count).forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'item-row';
            tr.dataset.id = item.id;
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.high.toLocaleString()}</td>
                <td>${item.low.toLocaleString()}</td>
                <td>${item.lastUpdatedHigh}</td>
            `;
            fragment.appendChild(tr);
        });
        itemListElement.empty().append(fragment);
    }

    function showItemDetails(itemId) {
        const item = items.find(item => item.id === itemId);
        if (item) {
            itemDetailsModal.find('.modal-title').text(item.name);
            itemDetailsModal.find('.modal-body').html(`
                <p><strong>High Price:</strong> ${item.high.toLocaleString()}</p>
                <p><strong>Low Price:</strong> ${item.low.toLocaleString()}</p>
                <p><strong>Last Updated High:</strong> ${item.lastUpdatedHigh}</p>
                <p><strong>Last Updated Low:</strong> ${item.lastUpdatedLow}</p>
                <p><strong>ID:</strong> ${itemId}</p>
            `);
            itemDetailsModal.modal('show');
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function setupEventListeners() {
        itemListElement.on('click', '.item-row', function() {
            const itemId = parseInt($(this).data('id'));
            showItemDetails(itemId);
        });

        const debouncedSearch = debounce(function() {
            const searchTerm = searchInput.val().toLowerCase();
            if (searchTerm) {
                const searchResults = searchIndex.search(searchTerm);
                displayItems(searchResults);
            } else {
                displayItems(items);
            }
        }, 300);

        searchInput.on('input', debouncedSearch);

        $('.nav-link').on('click', function(e) {
            e.preventDefault();
            $('.nav-link').removeClass('active');
            $(this).addClass('active');

            const filterId = $(this).attr('id');
            let filteredItems = [...items];

            switch(filterId) {
                case 'filter-all':
                    // No sorting needed
                    break;
                case 'filter-top':
                    // Implement your logic for top items here
                    // For example, sort by trading volume if available
                    break;
                case 'filter-highest':
                    filteredItems.sort((a, b) => b.high - a.high);
                    break;
                case 'filter-lowest':
                    filteredItems.sort((a, b) => a.low - b.low);
                    break;
                case 'filter-most-recent':
                    filteredItems.sort((a, b) => new Date(b.lastUpdatedHigh) - new Date(a.lastUpdatedHigh));
                    break;
            }

            displayItems(filteredItems);
        });
    }

    initializeData();
});