const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "dist");
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  let file = path.resolve(root, cleanPath);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!path.extname(file)) file = path.join(root, "index.html");
  fs.readFile(file, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": types[".html"], "Cache-Control": "no-store" });
        res.end(fallback);
      });
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": file.endsWith("index.html") ? "no-store" : "public, max-age=60",
    });
    res.end(data);
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`PametniPanj dist live on http://0.0.0.0:${port}`);
});
