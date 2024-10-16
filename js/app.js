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
    
    // Set color for the item name based on price
    let priceColor = "#d4c191"; // Default OSRS gold
    if (itemPrice.high >= 1000000) {
      priceColor = "#FF4500"; // Orange-Red for high-value items
    } else if (itemPrice.high <= 10000) {
      priceColor = "#32CD32"; // LimeGreen for low-value items
    }

    resultDiv.innerHTML = `
      <h3 style="color:${priceColor}">${matchedItem.name}</h3>
      <p>Examine: ${matchedItem.examine}</p>
      <p>Current Price: ${itemPrice.high.toLocaleString()} gp</p>
      <p>Low Price: ${itemPrice.low.toLocaleString()} gp</p>
      <p>High Alch: ${matchedItem.highalch.toLocaleString()} gp</p>
      <p>Members: ${matchedItem.members ? "Yes" : "No"}</p>
    `;
    resultDiv.classList.add('visible');
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
    resultDiv.classList.add('visible');
  }
}

async function searchUser() {
  const username = document.getElementById('username').value; // Get username input
  const resultDiv = document.getElementById('user-result');
  if (!username) {
    resultDiv.innerHTML = "Please enter a username.";
    resultDiv.classList.add('visible');
    return;
  }
  try {
    const userResponse = await fetch(`https://api.runescape.com/user/${username}`); // Adjust the API URL as needed
    if (!userResponse.ok) throw new Error("Failed to fetch user data");
    const userData = await userResponse.json();
    
    // Display user data (adjust according to the actual user data structure)
    resultDiv.innerHTML = `
      <h3>${userData.username}</h3>
      <p>Combat Level: ${userData.combatLevel}</p>
      <p>Total Level: ${userData.totalLevel}</p>
      <p>Total Experience: ${userData.totalExperience.toLocaleString()} xp</p>
      <!-- Add more fields as needed -->
    `;
    resultDiv.classList.add('visible');
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
    resultDiv.classList.add('visible');
  }
}
