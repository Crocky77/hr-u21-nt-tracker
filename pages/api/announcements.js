import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const filePath = path.join(process.cwd(), "data", "announcements.json");

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !(serviceKey || anonKey)) return null;
  return createClient(url, serviceKey || anonKey);
}

async function readAnnouncementsFromFile() {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeAnnouncementsToFile(items) {
  await fs.writeFile(filePath, JSON.stringify(items, null, 2));
}

async function readAnnouncements() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) return data;
  }
  return readAnnouncementsFromFile();
}

async function writeAnnouncements(items) {
  await writeAnnouncementsToFile(items);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const items = await readAnnouncements();
    res.status(200).json(items);
    return;
  }

  if (req.method === "POST") {
    const { text, level = "info", active = true } = req.body || {};
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Missing text" });
      return;
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          text: text.trim(),
          level,
          active: Boolean(active),
        })
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        res.status(200).json(data);
        return;
      }
    }
    const items = await readAnnouncementsFromFile();
    const next = [
      {
        id: `${Date.now()}`,
        text: text.trim(),
        level,
        active: Boolean(active),
      },
      ...items,
    ];
    await writeAnnouncementsToFile(next);
    res.status(200).json(next);
    return;
  }

  if (req.method === "PUT") {
    const { id, updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .update(updates)
        .eq("id", id)
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        res.status(200).json(data);
        return;
      }
    }
    const items = await readAnnouncementsFromFile();
    const next = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await writeAnnouncementsToFile(next);
    res.status(200).json(next);
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id)
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        res.status(200).json(data);
        return;
      }
    }
    const items = await readAnnouncementsFromFile();
    const next = items.filter((item) => item.id !== id);
    await writeAnnouncementsToFile(next);
    res.status(200).json(next);
    return;
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).json({ error: "Method not allowed" });
}
