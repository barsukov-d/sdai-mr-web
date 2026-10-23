import { test } from "node:test"
import assert from "node:assert"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { once } from "node:events"
const freePort = async () => { const s = createServer().listen(0); await once(s, "listening"); const { port } = s.address(); s.close(); await once(s, "close"); return port }
test("GET /health answers 200 ok", async (t) => {
  const port = await freePort()
  const child = spawn(process.execPath, [new URL("./server.js", import.meta.url).pathname], { env: { ...process.env, PORT: String(port) } })
  t.after(() => child.kill())
  await new Promise((resolve, reject) => { child.stdout.on("data", (d) => { if (String(d).includes("web on")) resolve() }); child.on("exit", (c) => reject(new Error("server exited " + c))) })
  const r = await fetch(`http://localhost:${port}/health`)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(await r.text(), "ok")
})
