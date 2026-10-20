const http = require("http");
const PORT = 3000;

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.url !== "/sse") {
      res.writeHead(404);
      return res.end("Not found");
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let counter = 0;

    const send = () => {
      counter++;
      const payload = {
        id: counter,
        message: `Сообщение №${counter}`,
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    send(); // сразу одно сообщение
    const interval = setInterval(send, 2000);

    req.on("close", () => {
      clearInterval(interval);
      console.log("client disconnected");
    });
  })
  .listen(PORT, () => {
    console.log(`SSE Server: http://localhost:${PORT}/sse`);
  });
