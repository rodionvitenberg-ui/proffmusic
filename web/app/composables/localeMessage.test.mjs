import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ru = JSON.parse(readFileSync(join(here, '../../i18n/locales/ru.json'), 'utf8'))
const journal = JSON.parse(readFileSync(join(here, '../data/journal.json'), 'utf8'))

function readLocalePath(root, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), root)
}

function asList(value) {
  return Array.isArray(value) ? value : []
}

const paras = asList(readLocalePath(ru, 'legal.rulesParas'))
assert.ok(paras.length >= 3)
assert.equal(typeof paras[0], 'string')
assert.equal(asList(readLocalePath(ru, 'journal.missing')).length, 0)
assert.equal(journal.ru.length, 5)
assert.equal(journal.en.length, 5)
assert.equal(typeof journal.ru[0].title, 'string')
assert.ok(Array.isArray(journal.ru[0].body))
console.log('locale path ok')
