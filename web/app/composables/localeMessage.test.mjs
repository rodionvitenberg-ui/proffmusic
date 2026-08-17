import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ru = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../i18n/locales/ru.json'), 'utf8'),
)

function readLocalePath(root, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), root)
}

function asList(value) {
  return Array.isArray(value) ? value : []
}

const articles = asList(readLocalePath(ru, 'journal.articles'))
assert.equal(articles.length, 5)
assert.equal(typeof articles[0].title, 'string')
assert.ok(articles[0].title.length > 0)
assert.ok(Array.isArray(articles[0].body))
assert.equal(asList(readLocalePath(ru, 'journal.missing')).length, 0)
console.log('locale path ok')
