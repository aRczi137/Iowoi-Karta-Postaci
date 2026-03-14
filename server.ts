import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

// Initialize database
await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT,
    quote TEXT,
    type TEXT NOT NULL,
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

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    raw_text TEXT NOT NULL,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS encountered_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    character_name TEXT,
    description TEXT,
    relationship TEXT,
    notes TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    stat_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/characters", async (req, res) => {
    const type = req.query.type;
    const result = type
      ? await db.execute({ sql: "SELECT * FROM characters WHERE type = ? ORDER BY created_at DESC", args: [type as string] })
      : await db.execute("SELECT * FROM characters ORDER BY created_at DESC");
    res.json(result.rows);
  });

  app.post("/api/characters", async (req, res) => {
    const {
      name, surname, quote, type, profession, gender, age, weight, height,
      appearance, history, personality, equipment, money, skills,
      disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
      current_hp, current_pr
    } = req.body;
    const result = await db.execute({
      sql: `INSERT INTO characters (
        name, surname, quote, type, profession, gender, age, weight, height,
        appearance, history, personality, equipment, money, skills,
        disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
        current_hp, current_pr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name ?? null, surname ?? null, quote ?? null, type ?? null, profession ?? null, gender ?? null, age ?? null, weight ?? null, height ?? null,
        appearance ?? null, history ?? null, personality ?? null, equipment ?? null, money ?? null, skills ?? null,
        disadvantages ?? null, stats ?? null, general_stats ?? null, techniques ?? null, avatar_url ?? null, appearance_images ?? null,
        current_hp ?? null, current_pr ?? null
      ]
    });
    res.json({ id: Number(result.lastInsertRowid) });
  });

  app.put("/api/characters/:id", async (req, res) => {
    const {
      name, surname, quote, profession, gender, age, weight, height,
      appearance, history, personality, equipment, money, skills,
      disadvantages, stats, general_stats, techniques, avatar_url, appearance_images,
      current_hp, current_pr
    } = req.body;
    await db.execute({
      sql: `UPDATE characters
        SET name = ?, surname = ?, quote = ?, profession = ?, gender = ?, age = ?,
            weight = ?, height = ?, appearance = ?, history = ?, personality = ?,
            equipment = ?, money = ?, skills = ?, disadvantages = ?, stats = ?,
            general_stats = ?, techniques = ?, avatar_url = ?, appearance_images = ?,
            current_hp = ?, current_pr = ?
        WHERE id = ?`,
      args: [
        name ?? null, surname ?? null, quote ?? null, profession ?? null, gender ?? null, age ?? null, weight ?? null, height ?? null,
        appearance ?? null, history ?? null, personality ?? null, equipment ?? null, money ?? null, skills ?? null,
        disadvantages ?? null, stats ?? null, general_stats ?? null, techniques ?? null, avatar_url ?? null, appearance_images ?? null,
        current_hp ?? null, current_pr ?? null, req.params.id
      ]
    });
    res.json({ success: true });
  });

  app.delete("/api/characters/:id", async (req, res) => {
    await db.execute({ sql: "DELETE FROM characters WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.get("/api/characters/:id/stat_history", async (req, res) => {
    const result = await db.execute({ sql: "SELECT * FROM stat_history WHERE character_id = ? ORDER BY created_at DESC", args: [req.params.id] });
    res.json(result.rows);
  });

  app.post("/api/characters/:id/stat_history", async (req, res) => {
    const { stat_name, amount, comment } = req.body;
    const characterId = req.params.id;

    const result = await db.execute({
      sql: `INSERT INTO stat_history (character_id, stat_name, amount, comment) VALUES (?, ?, ?, ?)`,
      args: [characterId, stat_name ?? null, amount ?? null, comment ?? null]
    });

    const charResult = await db.execute({ sql: "SELECT stats, general_stats, profession, skills FROM characters WHERE id = ?", args: [characterId] });
    const charRow = charResult.rows[0] as any;

    if (charRow && charRow.stats) {
      const regex = new RegExp(`(${stat_name}:\\s*)(\\d+)`, 'i');
      const updatedStats = (charRow.stats as string).replace(regex, (_match: string, p1: string, p2: string) => {
        const currentVal = parseInt(p2);
        return `${p1}${currentVal + amount}`;
      });

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

      const udzwig = Math.ceil(Math.pow(sila, 1.8) * 1.5) + (wytrzymalosc * 5);
      const isQuincy = (charRow.profession as string)?.toLowerCase().includes('quincy');
      const predkoscSr = Math.max(1, isQuincy ? szybkosc * 0.8 : szybkosc);
      const predkoscMax = Math.max(1, isQuincy ? szybkosc * 2.2 : szybkosc * 3);

      const pz = wytrzymalosc * 10;
      const hasWulkan = (charRow.skills as string)?.includes('Wulkan reiatsu');
      const pr = hasWulkan
        ? Math.floor(1.3 * Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2))
        : Math.floor(Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2));

      const updatedGeneralStats = `Udźwig: ${udzwig}kg, Prędkość (śr.): ${predkoscSr}km/h, Prędkość (max.): ${predkoscMax}km/h, PŻ: ${pz}, PR: ${pr}`;

      const oldPzMatch = (charRow.general_stats as string)?.match(/PŻ:\s*(\d+)/i);
      const oldPrMatch = (charRow.general_stats as string)?.match(/PR:\s*(\d+)/i);
      const oldPz = oldPzMatch ? parseInt(oldPzMatch[1]) : pz;
      const oldPr = oldPrMatch ? parseInt(oldPrMatch[1]) : pr;

      await db.execute({
        sql: `UPDATE characters 
          SET stats = ?, 
              general_stats = ?,
              current_hp = CASE WHEN current_hp IS NOT NULL THEN current_hp + (? - ?) ELSE ? END,
              current_pr = CASE WHEN current_pr IS NOT NULL THEN current_pr + (? - ?) ELSE ? END
          WHERE id = ?`,
        args: [updatedStats, updatedGeneralStats, pz, oldPz, pz, pr, oldPr, pr, characterId]
      });
    }

    res.json({ id: Number(result.lastInsertRowid), success: true });
  });

  app.delete("/api/characters/:charId/stat_history/:logId", async (req, res) => {
    const { charId, logId } = req.params;

    const logResult = await db.execute({ sql: "SELECT * FROM stat_history WHERE id = ? AND character_id = ?", args: [logId, charId] });
    const log = logResult.rows[0] as any;
    if (!log) return res.status(404).json({ error: "Log not found" });

    const { stat_name, amount } = log;

    await db.execute({ sql: "DELETE FROM stat_history WHERE id = ?", args: [logId] });

    const charResult = await db.execute({ sql: "SELECT stats, general_stats, profession, skills FROM characters WHERE id = ?", args: [charId] });
    const charRow = charResult.rows[0] as any;

    if (charRow && charRow.stats) {
      const regex = new RegExp(`(${stat_name}:\\s*)(\\d+)`, 'i');
      let updatedStats = charRow.stats as string;

      const matchFound = updatedStats.match(regex);
      if (matchFound) {
        updatedStats = updatedStats.replace(regex, (_match: string, p1: string, p2: string) => {
          const currentVal = parseInt(p2);
          const newVal = Math.max(1, currentVal - amount);
          return `${p1}${newVal}`;
        });

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

        const udzwig = Math.ceil(Math.pow(sila, 1.8) * 1.5) + (wytrzymalosc * 5);
        const isQuincy = (charRow.profession as string)?.toLowerCase().includes('quincy');
        const predkoscSr = Math.max(1, isQuincy ? szybkosc * 0.8 : szybkosc);
        const predkoscMax = Math.max(1, isQuincy ? szybkosc * 2.2 : szybkosc * 3);

        const pz = wytrzymalosc * 10;
        const hasWulkan = (charRow.skills as string)?.includes('Wulkan reiatsu');
        const pr = hasWulkan
          ? Math.floor(1.3 * Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2))
          : Math.floor(Math.pow(0.75 * reiatsu + 0.25 * kontrola, 2));

        const updatedGeneralStats = `Udźwig: ${udzwig}kg, Prędkość (śr.): ${predkoscSr}km/h, Prędkość (max.): ${predkoscMax}km/h, PŻ: ${pz}, PR: ${pr}`;

        const oldPzMatch = (charRow.general_stats as string)?.match(/PŻ:\s*(\d+)/i);
        const oldPrMatch = (charRow.general_stats as string)?.match(/PR:\s*(\d+)/i);
        const oldPz = oldPzMatch ? parseInt(oldPzMatch[1]) : pz;
        const oldPr = oldPrMatch ? parseInt(oldPrMatch[1]) : pr;

        await db.execute({
          sql: `UPDATE characters 
            SET stats = ?, 
                general_stats = ?,
                current_hp = CASE WHEN current_hp IS NOT NULL THEN current_hp + (? - ?) ELSE ? END,
                current_pr = CASE WHEN current_pr IS NOT NULL THEN current_pr + (? - ?) ELSE ? END
            WHERE id = ?`,
          args: [updatedStats, updatedGeneralStats, pz, oldPz, pz, pr, oldPr, pr, charId]
        });
      }
    }

    res.json({ success: true });
  });

  app.get("/api/posts", async (req, res) => {
    const result = await db.execute("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(result.rows);
  });

  app.post("/api/posts", async (req, res) => {
    const { gm_post, player_post, manga_panel_url } = req.body;
    const result = await db.execute({
      sql: `INSERT INTO posts (gm_post, player_post, manga_panel_url) VALUES (?, ?, ?)`,
      args: [gm_post ?? null, player_post ?? null, manga_panel_url ?? null]
    });
    res.json({ id: Number(result.lastInsertRowid) });
  });

  // Sessions API
  app.get("/api/sessions", async (req, res) => {
    const result = await db.execute("SELECT id, title, summary, created_at, substr(raw_text, 1, 200) as preview FROM sessions ORDER BY created_at DESC");
    res.json(result.rows);
  });

  app.get("/api/sessions/context", async (req, res) => {
    const summariesResult = await db.execute("SELECT id, title, summary, created_at FROM sessions WHERE summary IS NOT NULL ORDER BY created_at DESC LIMIT 10");
    const recentFullResult = await db.execute("SELECT id, title, raw_text, created_at FROM sessions ORDER BY created_at DESC LIMIT 3");
    res.json({ summaries: summariesResult.rows, recentFull: recentFullResult.rows });
  });

  app.post("/api/sessions", async (req, res) => {
    const { title, raw_text } = req.body;
    if (!raw_text) return res.status(400).json({ error: "raw_text is required" });
    const result = await db.execute({
      sql: "INSERT INTO sessions (title, raw_text) VALUES (?, ?)",
      args: [title || null, raw_text]
    });
    res.json({ id: Number(result.lastInsertRowid) });
  });

  app.put("/api/sessions/:id/summary", async (req, res) => {
    const { summary } = req.body;
    await db.execute({ sql: "UPDATE sessions SET summary = ? WHERE id = ?", args: [summary ?? null, req.params.id] });
    res.json({ success: true });
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  // Proxy for image generation via Hugging Face Inference API
  app.post("/api/generate-avatar", async (req: any, res: any) => {
    const { prompt, width = 512, height = 512 } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    const hfToken = process.env.HF_API_KEY;
    if (!hfToken) {
      return res.status(503).json({ error: "HF_API_KEY nie ustawiony w pliku .env" });
    }

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    async function callHF(model: string): Promise<Buffer | null> {
      const isAnimagine = model.includes("animagine");
      const isDreamlike = model.includes("dreamlike");
      const isFlux = model.includes("FLUX");

      const dreamlikeNegative = "simple background, duplicate, retro style, low quality, lowest quality, 1980s, 1990s, 2000s, 2005 2006 2007 2008 2009 2010 2011 2012 2013, bad anatomy, bad proportions, extra digits, lowres, username, artist name, error, duplicate, watermark, signature, text, extra digit, fewer digits, worst quality, jpeg artifacts, blurry";

      const animagineNegative = [
        "worst quality, low quality, lowres, jpeg artifacts, blurry",
        "bad anatomy, bad proportions, extra limbs, missing limbs, extra fingers, missing fingers, mutated hands",
        "deformed iris, deformed pupils, bad eyes, cross-eyed, fused eyes, poorly drawn eyes, asymmetric eyes, mismatched eyes",
        "bad mouth, deformed mouth, bad teeth, open mouth deformed, crooked teeth, floating teeth",
        "poorly drawn face, ugly face, disfigured face, mutation, deformed face",
        "watermark, signature, text, username, artist name, error, duplicate",
        "extra digit, fewer digits, missing digit",
      ].join(", ");

      const generalNegative = "lowres, bad anatomy, bad hands, text, watermark, blurry, deformed, deformed eyes, asymmetric eyes, crossed eyes, misaligned pupils, eye artifacts, ugly eyes, extra fingers, mutated hands, extra limbs";

      const negativePrompt = isAnimagine ? animagineNegative : isDreamlike ? dreamlikeNegative : generalNegative;

      const body: any = {
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          num_inference_steps: isFlux ? 4 : (isAnimagine ? 40 : isDreamlike ? 35 : 30),
          guidance_scale: isFlux ? 0.0 : (isAnimagine ? 7.0 : 7.5),
        },
      };

      for (let attempt = 0; attempt < 4; attempt++) {
        const response = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(90000),
          }
        );

        if (response.ok) {
          const buf = await response.arrayBuffer();
          return Buffer.from(buf);
        }

        if (response.status === 503) {
          const json = await response.json().catch(() => ({}) as any);
          const wait = Math.min(((json as any).estimated_time ?? 20) + 5, 60) * 1000;
          console.log(`[Avatar] ${model} loading, waiting ${wait / 1000}s... (attempt ${attempt + 1})`);
          await sleep(wait);
          continue;
        }

        if (response.status === 429) {
          console.warn(`[Avatar] ${model} rate limited (429). HuggingFace free tier limit reached.`);
          return null;
        }

        const errText = await response.text();
        console.warn(`[Avatar] ${model} error ${response.status}: ${errText.slice(0, 300)}`);
        return null;
      }
      return null;
    }

    const models = [
      "cagliostrolab/animagine-xl-3.1",
      "dreamlike-art/dreamlike-anime-1.0",
      "stabilityai/stable-diffusion-xl-base-1.0",
    ];

    for (const model of models) {
      try {
        console.log(`[Avatar] Trying HF model: ${model}`);
        const buf = await callHF(model);
        if (buf) {
          const base64 = buf.toString("base64");
          console.log(`[Avatar] Success with model: ${model}`);
          return res.json({ image: `data:image/jpeg;base64,${base64}` });
        }
      } catch (err: any) {
        console.warn(`[Avatar] Failed with ${model}:`, err.message);
      }
    }

    res.status(500).json({ error: "Generowanie awatara nie powiodło się. Sprawdź logi serwera." });
  });

  // ── LOCATIONS ──────────────────────────────────────────────────────────────
  app.get("/api/locations", async (req, res) => {
    const result = await db.execute("SELECT * FROM locations ORDER BY created_at DESC");
    res.json(result.rows);
  });

  app.post("/api/locations", async (req, res) => {
    const { name, description, notes, avatar_url } = req.body;
    const result = await db.execute({
      sql: "INSERT INTO locations (name, description, notes, avatar_url) VALUES (?, ?, ?, ?)",
      args: [name, description || "", notes || "", avatar_url || ""]
    });
    res.json({ id: Number(result.lastInsertRowid) });
  });

  app.put("/api/locations/:id", async (req, res) => {
    const { name, description, notes, avatar_url } = req.body;
    await db.execute({
      sql: "UPDATE locations SET name=?, description=?, notes=?, avatar_url=? WHERE id=?",
      args: [name, description || "", notes || "", avatar_url || "", req.params.id]
    });
    res.json({ ok: true });
  });

  app.delete("/api/locations/:id", async (req, res) => {
    await db.execute({ sql: "DELETE FROM locations WHERE id=?", args: [req.params.id] });
    res.json({ ok: true });
  });

  // ── ENCOUNTERED PLAYERS ────────────────────────────────────────────────────
  app.get("/api/encountered-players", async (req, res) => {
    const result = await db.execute("SELECT * FROM encountered_players ORDER BY created_at DESC");
    res.json(result.rows);
  });

  app.post("/api/encountered-players", async (req, res) => {
    const { name, character_name, description, relationship, notes, avatar_url } = req.body;
    const result = await db.execute({
      sql: "INSERT INTO encountered_players (name, character_name, description, relationship, notes, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
      args: [name, character_name || "", description || "", relationship || "", notes || "", avatar_url || ""]
    });
    res.json({ id: Number(result.lastInsertRowid) });
  });

  app.put("/api/encountered-players/:id", async (req, res) => {
    const { name, character_name, description, relationship, notes, avatar_url } = req.body;
    await db.execute({
      sql: "UPDATE encountered_players SET name=?, character_name=?, description=?, relationship=?, notes=?, avatar_url=? WHERE id=?",
      args: [name, character_name || "", description || "", relationship || "", notes || "", avatar_url || "", req.params.id]
    });
    res.json({ ok: true });
  });

  app.delete("/api/encountered-players/:id", async (req, res) => {
    await db.execute({ sql: "DELETE FROM encountered_players WHERE id=?", args: [req.params.id] });
    res.json({ ok: true });
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
