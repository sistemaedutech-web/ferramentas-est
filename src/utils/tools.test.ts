import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  validateTool,
  normalizeUrl,
  filterTools,
  sortTools,
  exportToolsToJson,
  parseToolsFromJson,
  INITIAL_TOOLS,
  type ToolItem,
} from './tools.ts';

test('Super Admin credentials and hashing check', () => {
  const superAdminEmail = 'ivan@profesorivan.com.br';
  const superAdminPassword = '123@mudar';

  const hash = crypto.createHash('sha256').update(superAdminPassword).digest('hex');
  // SHA-256 for '123@mudar'
  assert.equal(hash, '93082ff9b55cff94ee7f4d728013baa1863409cf3e5873d3f639aa9238bdb4de');

  // Case insensitive email check
  assert.equal(superAdminEmail.toLowerCase(), 'ivan@profesorivan.com.br');
});

test('SuperPei is the primary featured tool in INITIAL_TOOLS', () => {
  assert.ok(INITIAL_TOOLS.length > 0);
  const superPei = INITIAL_TOOLS.find((t) => t.name === 'SuperPei');
  assert.ok(superPei, 'SuperPei must be present in INITIAL_TOOLS');
  assert.equal(superPei.url, 'https://pei.sistemaedutech.com.br/login');
  assert.equal(superPei.category, 'Educação Inclusiva & PEI');
  assert.equal(superPei.isPinned, true);
  assert.ok(superPei.description.includes('neurodivergentes'));
});

test('normalizeUrl prepends https:// if protocol is omitted', () => {
  assert.equal(normalizeUrl('pei.sistemaedutech.com.br/login'), 'https://pei.sistemaedutech.com.br/login');
  assert.equal(normalizeUrl('home.esantateresinha.com.br'), 'https://home.esantateresinha.com.br');
  assert.equal(normalizeUrl('https://portal.esantateresinha.com.br'), 'https://portal.esantateresinha.com.br');
  assert.equal(normalizeUrl('http://diario.local:8080'), 'http://diario.local:8080');
  assert.equal(normalizeUrl('  google.com  '), 'https://google.com');
  assert.equal(normalizeUrl(''), '');
});

test('validateTool checks required fields and formats', () => {
  // Empty payload
  const emptyRes = validateTool({});
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.name);
  assert.ok(emptyRes.errors.description);
  assert.ok(emptyRes.errors.url);
  assert.ok(emptyRes.errors.category);

  // Missing domain in url
  const invalidUrlRes = validateTool({
    name: 'SuperPei Teste',
    description: 'Gestão de PEI',
    url: 'invalid_url_without_domain',
    category: 'Educação Inclusiva & PEI',
  });
  assert.equal(invalidUrlRes.isValid, false);
  assert.ok(invalidUrlRes.errors.url);

  // Valid SuperPei payload
  const validRes = validateTool({
    name: 'SuperPei',
    description: 'Ferramenta para criação, edição e acompanhamento de estudantes neurodivergentes.',
    url: 'https://pei.sistemaedutech.com.br/login',
    category: 'Educação Inclusiva & PEI',
  });
  assert.equal(validRes.isValid, true);
  assert.equal(Object.keys(validRes.errors).length, 0);
});

test('filterTools filters by category and search keyword (including SuperPei)', () => {
  // Match all
  assert.equal(filterTools(INITIAL_TOOLS, '', 'Todas').length, INITIAL_TOOLS.length);

  // Filter by Educação Inclusiva & PEI
  const peiTools = filterTools(INITIAL_TOOLS, '', 'Educação Inclusiva & PEI');
  assert.ok(peiTools.length >= 1);
  assert.equal(peiTools[0].name, 'SuperPei');

  // Search by "superpei"
  const searchSuperPei = filterTools(INITIAL_TOOLS, 'superpei', 'Todas');
  assert.equal(searchSuperPei.length, 1);
  assert.equal(searchSuperPei[0].name, 'SuperPei');

  // Search by "neurodivergentes"
  const searchNeuro = filterTools(INITIAL_TOOLS, 'neurodivergentes', 'Todas');
  assert.ok(searchNeuro.length >= 1);
  assert.equal(searchNeuro[0].name, 'SuperPei');

  // Search by link domain
  const searchEdutech = filterTools(INITIAL_TOOLS, 'sistemaedutech', 'Todas');
  assert.equal(searchEdutech.length, 1);
  assert.equal(searchEdutech[0].name, 'SuperPei');
});

test('sortTools prioritizes pinned tools and orders correctly', () => {
  const sorted = sortTools(INITIAL_TOOLS);
  let reachedUnpinned = false;
  for (const tool of sorted) {
    if (!tool.isPinned) {
      reachedUnpinned = true;
    } else if (reachedUnpinned) {
      assert.fail('Pinned tool found after unpinned tool in sorted list');
    }
  }
  // SuperPei should be in the top pinned items
  assert.equal(sorted[0].name, 'SuperPei');
});

test('exportToolsToJson and parseToolsFromJson roundtrip correctly', () => {
  const jsonOutput = exportToolsToJson(INITIAL_TOOLS);
  assert.ok(jsonOutput.includes('Escola Santa Teresinha'));
  assert.ok(jsonOutput.includes('Professores e Funcionários'));
  assert.ok(jsonOutput.includes('https://pei.sistemaedutech.com.br/login'));

  const parsed = parseToolsFromJson(jsonOutput);
  assert.equal(parsed.success, true);
  assert.ok(parsed.data);
  assert.equal(parsed.data.length, INITIAL_TOOLS.length);
  assert.equal(parsed.data[0].name, 'SuperPei');

  // Corrupted JSON error handling
  const badParsed = parseToolsFromJson('not a valid json');
  assert.equal(badParsed.success, false);
  assert.ok(badParsed.error);
});
