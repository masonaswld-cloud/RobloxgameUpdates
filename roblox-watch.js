
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Roblox Game Watch API"
  });
});

app.get("/game/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${req.params.id}`
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Roblox Watch API running on port ${PORT}`);
});
