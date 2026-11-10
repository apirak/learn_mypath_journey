// Copies the data this prototype reads from its sibling repos (ADR-0001):
// - learn_tcas/data/browse.json → public/data/programs.json (slimmed)
// - learn_mypath host fixtures → src/data/mypath/*.json
// - learn_mypath public/cover → public/cover
// - learn_mypath packages/mypath/src → vendor/mypath/src (SDK source)
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const at = p => new URL(p, root)

const browse = JSON.parse(readFileSync(at('../learn_tcas/data/browse.json'), 'utf8'))
const d = browse.data
const programs = d.programs.map(p => ({
  id: p.id, name: p.name, type: p.type, uni: p.uni, group: p.group, field: p.field,
  faculty: p.faculty, exams: p.exams, either: p.either, others: p.others, ly: p.ly || undefined,
}))
mkdirSync(at('public/data'), { recursive: true })
writeFileSync(at('public/data/programs.json'), JSON.stringify({
  fetched_at: browse.fetched_at,
  groups: d.groups, fields: d.fields, universities: d.universities, subjects: d.subjects, short: d.short,
  programs,
}))

cpSync(at('../learn_mypath/src/host/fixtures/mypath'), at('src/data/mypath'), { recursive: true })
cpSync(at('../learn_mypath/public/cover'), at('public/cover'), { recursive: true })
rmSync(at('vendor/mypath/src'), { recursive: true, force: true })
cpSync(at('../learn_mypath/packages/mypath/src'), at('vendor/mypath/src'), { recursive: true })
cpSync(at('../learn_mypath/packages/mypath/CHANGELOG.md'), at('vendor/mypath/CHANGELOG.md'))
const sdkSha = execSync('git rev-parse --short HEAD', { cwd: at('../learn_mypath') }).toString().trim()
const vendorReadme = at('vendor/mypath/README.md')
writeFileSync(vendorReadme, readFileSync(vendorReadme, 'utf8').replace(/Copied from commit `[^`]*`/, `Copied from commit \`${sdkSha}\``))
console.log(`programs: ${programs.length}`)
