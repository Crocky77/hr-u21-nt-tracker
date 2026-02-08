import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "announcements.json");

async function readAnnouncements() {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeAnnouncements(items) {
  await fs.writeFile(filePath, JSON.stringify(items, null, 2));
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const items = await readAnnouncements();
    res.status(200).json(items);
    return;
  }

  if (req.method === "POST") {
    const items = await readAnnouncements();
    const { text, level = "info", active = true } = req.body || {};
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Missing text" });
      return;
    }
    const next = [
      {
        id: `${Date.now()}`,
        text: text.trim(),
        level,
        active: Boolean(active),
      },
      ...items,
    ];
    await writeAnnouncements(next);
    res.status(200).json(next);
    return;
  }

  if (req.method === "PUT") {
    const items = await readAnnouncements();
    const { id, updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const next = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await writeAnnouncements(next);
    res.status(200).json(next);
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const items = await readAnnouncements();
    const next = items.filter((item) => item.id !== id);
    await writeAnnouncements(next);
    res.status(200).json(next);
    return;
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).json({ error: "Method not allowed" });
}
