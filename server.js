import http from "node:http"
import { readFileSync } from "node:fs"
const port = Number(process.env.PORT || 3000)
const api = process.env.API_URL || "http://localhost:3001"
http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") { res.setHeader("Content-Type", "text/plain; charset=utf-8"); res.end("alive"); return }
  if (req.url === "/api/items") {
    try { const r = await fetch(api + "/api/items"); res.setHeader("Content-Type", "application/json"); res.end(await r.text()) }
    catch { res.statusCode = 502; res.end("[]") }
    return
  }
  if (req.method === "GET" && req.url === "/version") {
    try {
      if (!process.env.API_URL) throw new Error("API_URL is not set")
      const r = await fetch(process.env.API_URL + "/api/version", { signal: AbortSignal.timeout(5000) })
      const body = Buffer.from(await r.arrayBuffer())
      res.statusCode = r.status
      const type = r.headers.get("content-type")
      if (type) res.setHeader("Content-Type", type)
      res.end(body)
    } catch { res.statusCode = 502; res.end("bad gateway") }
    return
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(readFileSync(new URL("./index.html", import.meta.url)))
}).listen(port, () => console.log(`web on ${port}`))
