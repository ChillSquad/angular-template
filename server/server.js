const http = require("http");
const PORT = 3000;

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    if (req.url === "/sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      res.write(
        `data: ${JSON.stringify({
          id: Date.now(),
          type: "welcome",
          message: "Подключено к SSE-серверу",
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );

      const t1 = setInterval(() => {
        res.write(`event: customUpdate\n`);
        res.write(
          `data: ${JSON.stringify({
            id: Date.now(),
            type: "update",
            message: `Серверное время: ${new Date().toLocaleTimeString()}`,
            value: Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString(),
          })}\n\n`,
        );
      }, 2000);

      const t2 = setInterval(() => {
        const products = ["Ноутбук", "Смартфон", "Наушники", "Клавиатура"];
        res.write(`event: productUpdate\n`);
        res.write(
          `data: ${JSON.stringify({
            productId: Math.floor(Math.random() * 1000),
            name: products[Math.floor(Math.random() * products.length)],
            price: Math.round(1000 + Math.random() * 90000),
            discount:
              Math.random() > 0.6 ? Math.round(Math.random() * 30) : undefined,
            timestamp: new Date().toISOString(),
          })}\n\n`,
        );
      }, 4000);

      const t3 = setInterval(() => {
        res.write(`event: specialEvent\n`);
        res.write(
          `data: ${JSON.stringify({
            id: Date.now(),
            type: "special",
            message: "Специальное предложение!",
            timestamp: new Date().toISOString(),
          })}\n\n`,
        );
      }, 10000);

      req.on("close", () => {
        clearInterval(t1);
        clearInterval(t2);
        clearInterval(t3);
      });
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(PORT, () => {
    console.log(`SSE Server: http://localhost:${PORT}/sse`);
  });
