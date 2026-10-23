import http from "node:http"
import { readFileSync } from "node:fs"
const port = Number(process.env.PORT || 3000)
const api = process.env.API_URL || "http://localhost:3001"
http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") { res.setHeader("Content-Type", "text/plain; charset=utf-8"); res.end("ok"); return }
  if (req.url === "/api/items") {
    try { const r = await fetch(api + "/api/items"); res.setHeader("Content-Type", "application/json"); res.end(await r.text()) }
    catch { res.statusCode = 502; res.end("[]") }
    return
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(readFileSync(new URL("./index.html", import.meta.url)))
}).listen(port, () => console.log(`web on ${port}`))
