async function searchItem() {
  const item = document.getElementById('item').value;
  const resultDiv = document.getElementById('ge-result');
  if (!item) {
    resultDiv.innerHTML = "Please enter an item name.";
    resultDiv.classList.add('visible');
    return;
  }
  try {
    const itemResponse = await fetch(`https://prices.runescape.wiki/api/v1/osrs/mapping`);
    if (!itemResponse.ok) throw new Error("Failed to fetch item data");
    const itemData = await itemResponse.json();
    
    const options = {
      includeScore: true,
      keys: ['name']
    };
    const fuse = new Fuse(itemData, options);
    const result = fuse.search(item);
    if (result.length === 0) throw new Error("Item not found in mapping data");
    const matchedItem = result[0].item;

    const priceResponse = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest`);
    if (!priceResponse.ok) throw new Error("Failed to fetch item prices");
    const priceData = await priceResponse.json();
    
    const itemPrice = priceData.data[matchedItem.id];
    if (!itemPrice) throw new Error("Price not found for item");
    
    resultDiv.innerHTML = `
      <h3>${matchedItem.name}</h3>
      <p>Examine: ${matchedItem.examine}</p>
      <p>Current Price: ${itemPrice.high}</p>
      <p>Low Price: ${itemPrice.low}</p>
      <p>Members: ${matchedItem.members}</p>
    `;
    resultDiv.classList.add('visible');
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
    resultDiv.classList.add('visible');
  }
}
