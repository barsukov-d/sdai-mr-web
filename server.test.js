import { test } from "node:test"
import assert from "node:assert"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { once } from "node:events"
import http from "node:http"
const freePort = async () => { const s = createServer().listen(0); await once(s, "listening"); const { port } = s.address(); s.close(); await once(s, "close"); return port }
test("GET /health answers 200 ok", async (t) => {
  const port = await freePort()
  const child = spawn(process.execPath, [new URL("./server.js", import.meta.url).pathname], { env: { ...process.env, PORT: String(port) } })
  t.after(() => child.kill())
  await new Promise((resolve, reject) => { child.stdout.on("data", (d) => { if (String(d).includes("web on")) resolve() }); child.on("exit", (c) => reject(new Error("server exited " + c))) })
  const r = await fetch(`http://localhost:${port}/health`)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(await r.text(), "alive")
})
const startWeb = async (t, env) => {
  const port = await freePort()
  const child = spawn(process.execPath, [new URL("./server.js", import.meta.url).pathname], { env: { ...process.env, ...env, PORT: String(port) } })
  t.after(() => child.kill())
  await new Promise((resolve, reject) => { child.stdout.on("data", (d) => { if (String(d).includes("web on")) resolve() }); child.on("exit", (c) => reject(new Error("server exited " + c))) })
  return port
}
test("GET /version passes the API answer through as is", async (t) => {
  const seen = []
  const apiBody = JSON.stringify({ version: "1.0.0" })
  const api = http.createServer((req, res) => { seen.push(req.url); res.setHeader("Content-Type", "application/json"); res.end(apiBody) }).listen(0)
  await once(api, "listening")
  t.after(() => api.close())
  const port = await startWeb(t, { API_URL: `http://localhost:${api.address().port}` })
  const r = await fetch(`http://localhost:${port}/version`)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.headers.get("content-type"), "application/json")
  assert.strictEqual(await r.text(), apiBody)
  assert.deepStrictEqual(seen, ["/api/version"])
})
test("GET /version answers 502 when the API is unreachable", async (t) => {
  const port = await startWeb(t, { API_URL: `http://localhost:${await freePort()}` })
  const r = await fetch(`http://localhost:${port}/version`)
  assert.strictEqual(r.status, 502)
})
test("GET /version answers 502 when API_URL is not set", async (t) => {
  const port = await startWeb(t, { API_URL: "" })
  const r = await fetch(`http://localhost:${port}/version`)
  assert.strictEqual(r.status, 502)
})
