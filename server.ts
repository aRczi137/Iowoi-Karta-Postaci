import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("rpg_companion.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT,
    quote TEXT,
    type TEXT NOT NULL, -- 'PC' or 'NPC'
    profession TEXT,
    gender TEXT,
    age TEXT,
    weight TEXT,
    height TEXT,
    appearance TEXT,
    history TEXT,
    personality TEXT,
    equipment TEXT,
    money TEXT,
    skills TEXT,
    disadvantages TEXT,
    stats TEXT,
    general_stats TEXT,
    techniques TEXT,
    avatar_url TEXT,
    appearance_images TEXT,
    current_hp INTEGER,
    current_pr INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gm_post TEXT,
    player_post TEXT,
    manga_panel_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/characters", (req, res) => {
    const type = req.query.type;
    const stmt = type
      ? db.prepare("SELECT * FROM characters WHERE type = ? ORDER BY created_at DESC")
      : db.prepare("SELECT * FROM characters ORDER BY created_at DESC");
    const characters = type ? stmt.all(type) : stmt.all();
    res.json(characters);
  });

  app.post("/api/characters", (req, res) => {
    const {
      name, surname, quote, type, profession, gender, age, weight, height,
      appearance, history, personality, equipment, money, skills,
      disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
      current_hp, current_pr
    } = req.body;
    const stmt = db.prepare(`
      INSERT INTO characters (
        name, surname, quote, type, profession, gender, age, weight, height,
        appearance, history, personality, equipment, money, skills,
        disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
        current_hp, current_pr
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name, surname, quote, type, profession, gender, age, weight, height,
      appearance, history, personality, equipment, money, skills,
      disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
      current_hp, current_pr
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/characters/:id", (req, res) => {
    const {
      name, surname, quote, profession, gender, age, weight, height,
      appearance, history, personality, equipment, money, skills,
      disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
      current_hp, current_pr
    } = req.body;
    const stmt = db.prepare(`
      UPDATE characters
      SET name = ?, surname = ?, quote = ?, profession = ?, gender = ?, age = ?,
          weight = ?, height = ?, appearance = ?, history = ?, personality = ?,
          equipment = ?, money = ?, skills = ?, disadvantages = ?, stats = ?,
          general_stats = ?, techniques = ?, avatar_url = ?, appearance_images = ?,
          current_hp = ?, current_pr = ?
      WHERE id = ?
    `);
    stmt.run(
      name, surname, quote, profession, gender, age, weight, height,
      appearance, history, personality, equipment, money, skills,
      disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
      current_hp, current_pr, req.params.id
    );
    res.json({ success: true });
  });

  app.delete("/api/characters/:id", (req, res) => {
    db.prepare("DELETE FROM characters WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/characters/:id/stat_history", (req, res) => {
    const logs = db.prepare("SELECT * FROM stat_history WHERE character_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(logs);
  });

  app.post("/api/characters/:id/stat_history", (req, res) => {
    const { stat_name, amount, comment } = req.body;
    const characterId = req.params.id;

    // Insert history log
    const stmt = db.prepare(`
      INSERT INTO stat_history (character_id, stat_name, amount, comment)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(characterId, stat_name, amount, comment);

    // Update characters table - we need to fetch, parse, and string replace the stats
    const charRow = db.prepare("SELECT stats FROM characters WHERE id = ?").get(characterId) as { stats: string };
    if (charRow && charRow.stats) {
      const regex = new RegExp(`(${stat_name}:\\s*)(\\d+)`, 'i');
      const updatedStats = charRow.stats.replace(regex, (match, p1, p2) => {
        const currentVal = parseInt(p2);
        return `${p1}${currentVal + amount}`;
      });
      db.prepare("UPDATE characters SET stats = ? WHERE id = ?").run(updatedStats, characterId);
    }

    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get("/api/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { gm_post, player_post, manga_panel_url } = req.body;
    const stmt = db.prepare(`
      INSERT INTO posts (gm_post, player_post, manga_panel_url)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(gm_post, player_post, manga_panel_url);
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
