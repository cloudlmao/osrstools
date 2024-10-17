let items = [];
let search = new JsSearch.Search('id');

// Fetch items from the RuneScape Wiki APIs
async function fetchItems() {
    try {
        const [latestPrices, itemMapping] = await Promise.all([
            fetch('https://prices.runescape.wiki/api/v1/osrs/latest').then(res => res.json()),
            fetch('https://prices.runescape.wiki/api/v1/osrs/mapping').then(res => res.json())
        ]);

        items = itemMapping.map(item => {
            const priceData = latestPrices.data[item.id];
            return {
                id: item.id,
                name: item.name,
                high: priceData ? priceData.high : null,
                low: priceData ? priceData.low : null,
                lastUpdatedHigh: priceData && priceData.highTime ? new Date(priceData.highTime * 1000).toLocaleString() : 'N/A',
                lastUpdatedLow: priceData && priceData.lowTime ? new Date(priceData.lowTime * 1000).toLocaleString() : 'N/A',
                examine: item.examine,
                members: item.members
            };
        }).filter(item => item.high !== null || item.low !== null); // Filter out items with no price data

        setupSearch();
        displayItems(items);
    } catch (error) {
        console.error('Error fetching items from the RuneScape Wiki APIs:', error);
    }
}

// Set up search functionality
function setupSearch() {
    search.addIndex('name');
    search.addIndex('examine');
    search.addDocuments(items);

    $('#search-input').on('input', function() {
        const query = $(this).val();
        if (query) {
            const results = search.search(query);
            displayItems(results);
        } else {
            displayItems(items);
        }
    });
}

// Function to display items in the table
function displayItems(itemsToDisplay) {
    const itemListElement = $('#item-list');
    itemListElement.empty();

    itemsToDisplay.forEach(item => {
        const rowHtml = `
            <tr class="item-row" data-id="${item.id}">
                <td>${item.name}</td>
                <td>${item.high ? item.high.toLocaleString() : 'N/A'}</td>
                <td>${item.low ? item.low.toLocaleString() : 'N/A'}</td>
                <td>${item.lastUpdatedHigh}</td>
            </tr>
        `;
        itemListElement.append(rowHtml);
    });
}

// Toggle item details on click
function showItemDetails(itemId) {
    const itemRow = $(`tr[data-id="${itemId}"]`);
    const detailsRow = $(`#details-row-${itemId}`);

    if (detailsRow.length) {
        detailsRow.remove();
    } else {
        const item = items.find(item => item.id === itemId);
        if (item) {
            const detailsHtml = `
                <tr id="details-row-${item.id}" class="item-details-row">
                    <td colspan="4">
                        <div class="p-3 bg-light border rounded">
                            <p><strong>Item Name:</strong> ${item.name}</p>
                            <p><strong>High Price:</strong> ${item.high ? item.high.toLocaleString() : 'N/A'}</p>
                            <p><strong>Low Price:</strong> ${item.low ? item.low.toLocaleString() : 'N/A'}</p>
                            <p><strong>Last Updated High:</strong> ${item.lastUpdatedHigh}</p>
                            <p><strong>Last Updated Low:</strong> ${item.lastUpdatedLow}</p>
                            <p><strong>Examine:</strong> ${item.examine || 'N/A'}</p>
                            <p><strong>Members Only:</strong> ${item.members ? 'Yes' : 'No'}</p>
                        </div>
                    </td>
                </tr>
            `;
            itemRow.after(detailsHtml);
        } else {
            console.error("Item not found for ID:", itemId);
        }
    }
}

// Set up event listeners for row clicks and filter functionality
function setupEventListeners() {
    const itemListElement = $('#item-list');
    
    itemListElement.on('click', '.item-row', function() {
        const itemId = $(this).data('id');
        showItemDetails(itemId);
    });

    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        const filterId = $(this).attr('id');
        let filteredItems = [...items];

        switch(filterId) {
            case 'filter-all':
                break;
            case 'filter-top':
                filteredItems.sort((a, b) => (b.high || 0) - (a.high || 0));
                filteredItems = filteredItems.slice(0, 10);
                break;
            case 'filter-highest':
                filteredItems.sort((a, b) => (b.high || 0) - (a.high || 0));
                filteredItems = filteredItems.slice(0, 20);
                break;
            case 'filter-lowest':
                filteredItems.sort((a, b) => (a.low || Infinity) - (b.low || Infinity));
                filteredItems = filteredItems.slice(0, 20);
                break;
            case 'filter-most-recent':
                filteredItems.sort((a, b) => new Date(b.lastUpdatedHigh) - new Date(a.lastUpdatedHigh));
                filteredItems = filteredItems.slice(0, 20);
                break;
        }

        displayItems(filteredItems);
    });
}

// On document ready, fetch items and set up event listeners
$(document).ready(function() {
    fetchItems();
    setupEventListeners();
});