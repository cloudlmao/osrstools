
async function searchUser() {
  const username = document.getElementById('username').value; // Get the username
  const resultDiv = document.getElementById('user-result');
  if (!username) {
    resultDiv.innerHTML = "Please enter a username.";
    resultDiv.classList.add('visible');
    return;
  }

  try {
    // Fetch player stats from the OSRS API
    const response = await fetch(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(username)}`);

    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.text();
    const lines = userData.split('\n');
    const stats = {};

    // Process the returned CSV data
    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length === 3) {
        stats[parts[0]] = {
          rank: parts[1],
          level: parts[2],
        };
      }
    }

    // Display player stats
    resultDiv.innerHTML = `<h3>User: ${username}</h3>`;
    for (const skill in stats) {
      resultDiv.innerHTML += `<p>${skill}: Level ${stats[skill].level} (Rank ${stats[skill].rank})</p>`;
    }

    resultDiv.classList.add('visible');
  } catch (error) {
    resultDiv.innerHTML = `Error: ${error.message}`;
    resultDiv.classList.add('visible');
  }
}
