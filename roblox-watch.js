
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Your Roblox universe ID
const UNIVERSE_ID = "9684602380";

// Check for updates every 60 seconds
const CHECK_INTERVAL = 60 * 1000;

let latestGame = null;
let previousUpdated = null;
let lastChecked = null;
let updateDetected = false;
let lastError = null;

async function fetchGame() {
  const url =
    `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Roblox API returned ${response.status}`);
  }

  const data = await response.json();
  const game = data.data?.[0];

  if (!game) {
    throw new Error("Roblox game was not found");
  }

  return game;
}

async function checkForUpdates() {
  try {
    const game = await fetchGame();

    if (
      previousUpdated !== null &&
      game.updated !== previousUpdated
    ) {
      updateDetected = true;

      console.log(
        `Game update detected: ${game.name} — ${game.updated}`
      );
    }

    previousUpdated = game.updated;
    latestGame = {
      id: game.id,
      name: game.name,
      description: game.description,
      placeId: game.rootPlaceId,
      creator: game.creator?.name,
      playing: game.playing,
      visits: game.visits,
      updated: game.updated,
      url: `https://www.roblox.com/games/${game.rootPlaceId}`
    };

    lastChecked = new Date().toISOString();
    lastError = null;

    console.log(
      `Checked ${game.name}. Last updated: ${game.updated}`
    );
  } catch (error) {
    lastError = error.message;
    console.error("Update check failed:", error.message);
  }
}

// API status
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Roblox Game Watch API",
    universeId: UNIVERSE_ID,
    checkIntervalSeconds: CHECK_INTERVAL / 1000
  });
});

// Get Roblox game information
app.get("/game/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${encodeURIComponent(req.params.id)}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Unable to fetch Roblox game data"
    });
  }
});

// Get the latest cached information for your watched game
app.get("/game/9684602380/updates", (req, res) => {
  res.json({
    game: latestGame,
    updateDetected,
    lastChecked,
    error: lastError
  });
});

// Acknowledge an update after your notification system handles it
app.post("/game/9684602380/updates/acknowledge", (req, res) => {
  updateDetected = false;

  res.json({
    success: true,
    message: "Update flag cleared"
  });
});

// Initial check, then poll every 60 seconds
checkForUpdates();
setInterval(checkForUpdates, CHECK_INTERVAL);

app.listen(PORT, () => {
  console.log(`Roblox Watch API running on port ${PORT}`);
});
