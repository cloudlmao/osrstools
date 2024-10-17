// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', message, 'at', source, lineno, colno, error);
    alert('An error occurred. Please check the console for more information.');
};

let items = [];
let search = new JsSearch.Search('id');

async function fetchItems() {
    try {
        console.log('Fetching items...');
        const [latestPrices, itemMapping] = await Promise.all([
            fetch('https://prices.runescape.wiki/api/v1/osrs/latest').then(res => res.json()),
            fetch('https://prices.runescape.wiki/api/v1/osrs/mapping').then(res => res.json())
        ]);
        console.log('Fetch completed. Processing items...');

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
        }).filter(item => item.high !== null || item.low !== null);

        console.log(`Processed ${items.length} items.`);
        setupSearch();
        displayItems(items);
        
        // Hide the loading indicator after loading items
        $('#loading-indicator').hide(); // Add this line

    } catch (error) {
        console.error('Error fetching items from the RuneScape Wiki APIs:', error);
        alert('Failed to fetch items. Please check your internet connection and try again.');
    }
}

// Set up search functionality
function setupSearch() {
    console.log('Setting up search...');
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
    console.log('Search setup complete.');
}

// Function to display items in the table
function displayItems(itemsToDisplay) {
    console.log(`Displaying ${itemsToDisplay.length} items...`);
    const itemListElement = $('#item-list');
    itemListElement.empty();

    itemsToDisplay.slice(0, 100).forEach(item => {
        // Determine the color based on the item's price
        let nameColor = 'black'; // Default color
        if (item.high && item.high > 1000) {
            nameColor = 'green'; // High price
        } else if (item.low && item.low < 100) {
            nameColor = 'red'; // Low price
        } else {
            nameColor = 'gray'; // Neutral for no prices
        }

        const rowHtml = `
            <tr class="item-row" data-id="${item.id}">
                <td style="color: ${nameColor};">${item.name}</td>
                <td>${item.high ? item.high.toLocaleString() : 'N/A'}</td>
                <td>${item.low ? item.low.toLocaleString() : 'N/A'}</td>
                <td>${item.lastUpdatedHigh}</td>
            </tr>
        `;
        itemListElement.append(rowHtml);
    });

    if (itemsToDisplay.length > 100) {
        itemListElement.append(`<tr><td colspan="4">Showing 100 out of ${itemsToDisplay.length} items. Use search to find specific items.</td></tr>`);
    }
    console.log('Items displayed.');
}

// Toggle item details on click
function showItemDetails(itemId) {
    console.log(`Toggling details for item ${itemId}`);
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
    console.log('Setting up event listeners...');
    const itemListElement = $('#item-list');
    
    itemListElement.on('click', '.item-row', function() {
        const itemId = $(this).data('id');
        showItemDetails(itemId);
    });

    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        console.log('Filter clicked:', $(this).attr('id'));
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        const filterId = $(this).attr('id');
        let filteredItems = [...items];

        switch(filterId) {
            case 'filter-all':
                break;
            case 'filter-top':
                filteredItems.sort((a, b) => (b.high || 0) - (a.high || 0));
                filteredItems = filteredItems.slice(0, 100);
                break;
            case 'filter-highest':
                filteredItems.sort((a, b) => (b.high || 0) - (a.high || 0));
                filteredItems = filteredItems.slice(0, 100);
                break;
            case 'filter-lowest':
                filteredItems.sort((a, b) => (a.low || Infinity) - (b.low || Infinity));
                filteredItems = filteredItems.slice(0, 100);
                break;
            case 'filter-most-recent':
                filteredItems.sort((a, b) => new Date(b.lastUpdatedHigh) - new Date(a.lastUpdatedHigh));
                filteredItems = filteredItems.slice(0, 100);
                break;
        }

        displayItems(filteredItems);
    });
    console.log('Event listeners setup complete.');
}

// On document ready, fetch items and set up event listeners
$(document).ready(function() {
    console.log('Document ready. Initializing...');
    fetchItems();
    setupEventListeners();
});
