import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildObjectKey, buildPublicUrl, sanitizeFilename } from './upload.js';

describe('sanitizeFilename', () => {
  it('把路径分隔符和空白替换掉，保留中文与扩展名', () => {
    const name = sanitizeFilename('报告 v1/../secret.pdf');
    assert.equal(name, '报告_v1_.._secret.pdf');
    assert.ok(!name.includes('/'));
  });

  it('清洗后为空时使用默认名', () => {
    assert.equal(sanitizeFilename('   /// '), 'file');
  });
});

describe('buildObjectKey', () => {
  it('按年月分目录并加随机前缀', () => {
    const key = buildObjectKey('a b.png', new Date('2026-11-23T08:00:00Z'));
    assert.match(key, /^mcp\/2026\/11\/[0-9a-f-]{36}-a_b\.png$/);
  });
});

describe('buildPublicUrl', () => {
  it('去掉 base 结尾斜杠并逐段编码', () => {
    assert.equal(
      buildPublicUrl('https://example.com/', 'mcp/2026/11/id-报告.pdf'),
      'https://example.com/mcp/2026/11/id-%E6%8A%A5%E5%91%8A.pdf',
    );
  });
});
