// ---------------------------------------------------------------------------
// Local server for storyboard — serves HTML, saves edits back to timeline .md
// ---------------------------------------------------------------------------

import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import matter from "gray-matter";

interface StoryboardServerOptions {
  htmlPath: string;
  timelinePath: string;
  port?: number;
}

export function startStoryboardServer(
  options: StoryboardServerOptions,
): Promise<{ url: string; close: () => void }> {
  const { htmlPath, timelinePath, port = 0 } = options;

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      // CORS headers for fetch from file:// if needed
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      // Serve the storyboard HTML
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        try {
          const html = readFileSync(htmlPath, "utf-8");
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(html);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to read storyboard HTML" }));
        }
        return;
      }

      // Save endpoint — receives updated shots + notes, writes back to timeline
      if (req.method === "POST" && req.url === "/save") {
        let body = "";
        req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            const raw = readFileSync(timelinePath, "utf-8");
            const parsed = matter(raw);

            // Update shots
            if (payload.shots && Array.isArray(payload.shots)) {
              parsed.data.shots = payload.shots;
            }

            // Update director's notes (content below frontmatter)
            const notes = typeof payload.notes === "string"
              ? payload.notes
              : parsed.content;

            // Rebuild the file
            const updated = matter.stringify(notes, parsed.data);
            writeFileSync(timelinePath, updated, "utf-8");

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, path: timelinePath }));
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: msg }));
          }
        });
        return;
      }

      // Read current timeline state
      if (req.method === "GET" && req.url === "/timeline") {
        try {
          const raw = readFileSync(timelinePath, "utf-8");
          const parsed = matter(raw);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            frontmatter: parsed.data,
            notes: parsed.content,
          }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to read timeline" }));
        }
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    });

    server.on("error", reject);

    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      const assignedPort = typeof addr === "object" && addr ? addr.port : port;
      const url = `http://127.0.0.1:${assignedPort}`;
      resolve({
        url,
        close: () => server.close(),
      });
    });
  });
}
