
const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json({ limit: "20kb" }));

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
  res.set("Cache-Control", "no-store");
  res.json(latestUpdate);
});

app.post("/updates", (req, res) => {
  const secret = process.env.UPDATE_SECRET;
  const provided = req.get("x-api-key") || "";

  if (!secret) {
    return res.status(503).json({
      error: "Publishing is not configured."
    });
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    return res.status(401).json({
      error: "Invalid API key."
    });
  }

  const { version, title, changes } = req.body || {};

  if (
    typeof version !== "string" ||
    !version.trim() ||
    version.length > 50 ||
    typeof title !== "string" ||
    !title.trim() ||
    title.length > 150 ||
    !Array.isArray(changes) ||
    changes.length > 30 ||
    !changes.every(
      change =>
        typeof change === "string" &&
        change.trim().length > 0 &&
        change.length <= 500
    )
  ) {
    return res.status(400).json({
      error: "Provide a version, title, and valid changes array."
    });
  }

  latestUpdate = {
    version: version.trim(),
    title: title.trim(),
    changes: changes.map(change => change.trim()),
    date: new Date().toISOString()
  };

  res.set("Cache-Control", "no-store");
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
