import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Generic Supabase Data Proxy (Simplified for this example)
  // In a real app, you'd have specific endpoints for each table
  app.post("/api/supabase/:table", async (req, res) => {
    const { table } = req.params;
    const { data, error } = await supabase.from(table).upsert(req.body);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  });

  app.get("/api/supabase/:table", async (req, res) => {
    const { table } = req.params;
    const { data, error } = await supabase.from(table).select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  });

  // File Upload Proxy
  app.post("/api/upload", async (req, res) => {
    const { bucket, path: filePath, fileBase64, contentType } = req.body;
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(fileBase64, 'base64');

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });

    if (error) return res.status(500).json({ error: error.message });

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({ url: urlData.publicUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
