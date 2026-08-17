import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const copy = JSON.parse(readFileSync(join(here, '../data/copy.json'), 'utf8'))
const journal = JSON.parse(readFileSync(join(here, '../data/journal.json'), 'utf8'))

function readLocalePath(root, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), root)
}

function asList(value) {
  return Array.isArray(value) ? value : []
}

for (const lang of ['ru', 'en']) {
  const about = asList(readLocalePath(copy[lang], 'static.aboutParas'))
  assert.ok(about.length >= 3, `${lang} aboutParas`)
  assert.equal(typeof about[0], 'string')
  assert.ok(about[0].length > 20)
  assert.equal(asList(readLocalePath(copy[lang], 'legal.gdprParas')).length, 5)
}

assert.equal(journal.ru.length, 5)
assert.equal(journal.en.length, 5)
console.log('locale path ok')
