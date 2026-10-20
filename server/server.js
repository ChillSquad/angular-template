const http = require("http");
const PORT = 3000;

let present = false;
let lastSeen = null;
let counter = 0;
const clients = new Set();

function makeMessage() {
  counter++;
  return {
    id: counter,
    online: present,
    lastSeen: lastSeen ? lastSeen.toISOString() : null,
    timestamp: new Date().toISOString(),
  };
}

function broadcast() {
  const payload = `data: ${JSON.stringify(makeMessage())}\n\n`;
  for (const res of clients) res.write(payload);
  console.log(`[tick #${counter}] present=${present}, clients=${clients.size}`);
}

setInterval(broadcast, 3000);

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    if (req.method === "POST" && req.url === "/join") {
      present = true;
      lastSeen = new Date();
      console.log("[join] present=true (next tick will reflect it)");
      res.writeHead(204);
      return res.end();
    }

    if (req.method === "POST" && req.url === "/leave") {
      present = false;
      lastSeen = new Date();
      console.log("[leave] present=false (next tick will reflect it)");
      res.writeHead(204);
      return res.end();
    }

    if (req.method === "GET" && req.url === "/sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      clients.add(res);
      console.log(`[sse connect] clients=${clients.size}`);

      req.on("close", () => {
        clients.delete(res);
        console.log(`[sse disconnect] clients=${clients.size}`);
      });
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  })
  .listen(PORT, () => {
    console.log(`SSE Server: http://localhost:${PORT}/sse`);
  });
