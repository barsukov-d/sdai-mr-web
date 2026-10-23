import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
test("page has a title", () => { assert.match(readFileSync(new URL("./index.html", import.meta.url), "utf8"), /Список записей/) })
