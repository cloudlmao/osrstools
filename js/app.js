// Fetch user stats from OSRS Hiscores API
async function fetchStats() {
  const username = document.getElementById('username').value;
  const resultDiv = document.getElementById('stats-result');

  if (!username) {
    resultDiv.innerHTML = "Please enter a username.";
    return;
  }

  try {
    const response = await fetch(`https://api.runescape.com/hiscores/osrs/username/${username}`);
    if (!response.ok) throw new Error("Player not found");

    const data = await response.json();
    resultDiv.innerHTML = `
      <h3>${username}'s Stats</h3>
      <p>Overall Rank: ${data.rank}</p>
      <p>Total XP: ${data.totalXP}</p>
      <!-- Display more stats here -->
    `;
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
  }
}

// Fetch item data from OSRS Grand Exchange API
async function searchItem() {
  const item = document.getElementById('item').value;
  const resultDiv = document.getElementById('ge-result');

  if (!item) {
    resultDiv.innerHTML = "Please enter an item name.";
    return;
  }

  try {
    const response = await fetch(`https://api.runescape.com/ge/item/${item}`);
    if (!response.ok) throw new Error("Item not found");

    const data = await response.json();
    resultDiv.innerHTML = `
      <h3>${data.name}</h3>
      <p>Price: ${data.price}</p>
      <p>Description: ${data.description}</p>
      <!-- Add more item details here -->
    `;
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
  }
}
