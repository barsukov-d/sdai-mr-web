import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import vm from "node:vm"
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8")
test("page has a title", () => { assert.match(html, /Список записей/) })
test("list shows «название — цена ₽»", () => {
  const ctx = { fetch: () => new Promise(() => {}), document: {} }
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], ctx)
  const out = ctx.renderList([{ id: 1, title: "Первая запись", price: 100 }, { id: 2, title: "Вторая запись", price: 250 }])
  assert.ok(out.includes("Первая запись — 100 ₽"))
  assert.ok(out.includes("Вторая запись — 250 ₽"))
})
test("page lists items in an ordered list", () => { assert.match(readFileSync(new URL("./index.html", import.meta.url), "utf8"), /<ol id="list">/) })
