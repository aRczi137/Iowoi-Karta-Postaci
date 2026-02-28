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
    const charRow = db.prepare("SELECT stats, general_stats, profession, skills FROM characters WHERE id = ?").get(characterId) as any;
    if (charRow && charRow.stats) {
      // 1. Update the base stats string
      const regex = new RegExp(`(${stat_name}:\\s*)(\\d+)`, 'i');
      const updatedStats = charRow.stats.replace(regex, (match: string, p1: string, p2: string) => {
        const currentVal = parseInt(p2);
        return `${p1}${currentVal + amount}`;
      });

      // 2. Parse all stats from the fresh string to recalculate general_stats
      const statsObj: Record<string, number> = {};
      updatedStats.split(',').forEach((s: string) => {
        const [k, v] = s.split(':').map((str: string) => str.trim());
        if (k && v) statsObj[k] = parseInt(v) || 5;
      });

      const wytrzymalosc = statsObj['Wytrzymałość'] || 5;
      const szybkosc = statsObj['Szybkość'] || 5;
      const sila = statsObj['Siła'] || 5;
      const reiatsu = statsObj['Reiatsu'] || 5;
      const kontrola = statsObj['Kontrola Reiatsu'] || 5;
      const zrecznosc = statsObj['Zręczność'] || 5;

      // 3. Re-calculate metrics
      const udzwig = Math.ceil(Math.pow(sila, 1.8) * 1.5) + (wytrzymalosc * 5);
      const isQuincy = charRow.profession?.toLowerCase().includes('quincy');
      const predkoscSr = Math.max(1, isQuincy ? szybkosc * 0.8 : szybkosc);
      const predkoscMax = Math.max(1, isQuincy ? szybkosc * 2.2 : szybkosc * 3);

      const pz = wytrzymalosc * 10;

      const hasWulkan = charRow.skills?.includes('Wulkan reiatsu');
      const pr = hasWulkan
        ? Math.floor(1.3 * Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2))
        : Math.floor(Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2));

      const updatedGeneralStats = `Udźwig: ${udzwig}kg, Prędkość (śr.): ${predkoscSr}km/h, Prędkość (max.): ${predkoscMax}km/h, PŻ: ${pz}, PR: ${pr}`;

      // 4. Extract current HP and PR to see if we need to adjust them (heal them up if max goes up)
      const oldPzMatch = charRow.general_stats?.match(/PŻ:\s*(\d+)/i);
      const oldPrMatch = charRow.general_stats?.match(/PR:\s*(\d+)/i);
      const oldPz = oldPzMatch ? parseInt(oldPzMatch[1]) : pz;
      const oldPr = oldPrMatch ? parseInt(oldPrMatch[1]) : pr;

      // 5. Build query to update stats, general stats and bump missing current HP/PR if Max grew
      const updateQuery = `
        UPDATE characters 
        SET stats = ?, 
            general_stats = ?,
            current_hp = CASE WHEN current_hp IS NOT NULL THEN current_hp + (? - ?) ELSE ? END,
            current_pr = CASE WHEN current_pr IS NOT NULL THEN current_pr + (? - ?) ELSE ? END
        WHERE id = ?
      `;

      db.prepare(updateQuery).run(
        updatedStats,
        updatedGeneralStats,
        pz, oldPz, pz,
        pr, oldPr, pr,
        characterId
      );
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
