const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const app = express();
const PORT = 3000;

// Servir la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Permitir CORS (para OBS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/nowplaying", (req, res) => {
  exec("osascript nowplaying.scpt", (error, stdout) => {
    if (error) return res.json({ playing: false });

    const output = stdout.trim();
    if (output === "Paused" || output === "Closed")
      return res.json({ playing: false });

    const [title, artist, album, currentTime, totalTime] = output.split("||");

    res.json({
      playing: true,
      title,
      artist,
      album,
      artwork: "http://localhost:3000/artwork.jpg",
      currentTime: parseFloat(currentTime),
      totalTime: parseFloat(totalTime),
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}/nowplaying`);
});
