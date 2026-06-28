const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 5500);
const clients = new Set();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const liveReloadScript = `
<script>
  (() => {
    const events = new EventSource("/__live-reload");
    events.onmessage = () => location.reload();
  })();
</script>`;

const sendFile = (response, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Archivo no encontrado" : "Error interno");
      return;
    }

    let body = content;
    if (ext === ".html") {
      body = Buffer.from(content.toString("utf8").replace("</body>", `${liveReloadScript}</body>`));
    }

    response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    response.end(body);
  });
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);

  if (url.pathname === "/__live-reload") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write("data: connected\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Acceso no permitido");
    return;
  }

  sendFile(response, filePath);
});

const notifyReload = () => {
  for (const client of clients) {
    client.write("data: reload\n\n");
  }
};

for (const file of ["index.html", "styles.css", "script.js"]) {
  fs.watch(path.join(root, file), { persistent: true }, notifyReload);
}

server.listen(port, "127.0.0.1", () => {
  console.log(`Vista activa en http://127.0.0.1:${port}`);
});
