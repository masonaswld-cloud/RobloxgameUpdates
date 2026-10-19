const express = require("express");

const app = express();
app.use(express.json());

let latestUpdate = {
  version: "1.0.0",
  title: "Game Launched",
  changes: ["Welcome to the game!"],
  date: new Date().toISOString()
};

app.get("/", (req, res) => {
  res.json({
    status: "online",
    api: "Roblox Game Updates API"
  });
});

app.get("/updates", (req, res) => {
  res.json(latestUpdate);
});

app.post("/updates", (req, res) => {
  const { version, title, changes } = req.body;

  if (
    typeof version !== "string" ||
    typeof title !== "string" ||
    !Array.isArray(changes) ||
    !changes.every(change => typeof change === "string")
  ) {
    return res.status(400).json({
      error: "Provide version, title, and an array of changes."
    });
  }

  latestUpdate = {
    version,
    title,
    changes,
    date: new Date().toISOString()
  };

  res.json({
    success: true,
    message: "Game update published!",
    update: latestUpdate
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
