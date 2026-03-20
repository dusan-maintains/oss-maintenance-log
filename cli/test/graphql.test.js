'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { batchFetchRepos } = require('../lib/github-graphql');

describe('batchFetchRepos', () => {
  it('returns empty map for empty input', async () => {
    const result = await batchFetchRepos([], 'fake-token');
    assert.equal(result.size, 0);
  });

  it('returns empty map without token', async () => {
    const result = await batchFetchRepos([{ owner: 'facebook', repo: 'react' }], null);
    assert.equal(result.size, 0);
  });

  it('returns empty map without token (undefined)', async () => {
    const result = await batchFetchRepos([{ owner: 'facebook', repo: 'react' }], undefined);
    assert.equal(result.size, 0);
  });
});

describe('GraphQL integration with GITHUB_TOKEN', { skip: !process.env.GITHUB_TOKEN }, () => {
  it('fetches real repo data for express', async () => {
    const result = await batchFetchRepos(
      [{ owner: 'expressjs', repo: 'express' }],
      process.env.GITHUB_TOKEN
    );
    assert.equal(result.size, 1);
    const data = result.get('expressjs/express');
    assert.ok(data);
    assert.ok(typeof data.stargazers_count === 'number');
    assert.ok(typeof data.forks_count === 'number');
    assert.ok(typeof data.open_issues_count === 'number');
    assert.equal(data.archived, false);
  });

  it('fetches multiple repos in one query', async () => {
    const result = await batchFetchRepos([
      { owner: 'expressjs', repo: 'express' },
      { owner: 'lodash', repo: 'lodash' },
      { owner: 'facebook', repo: 'react' }
    ], process.env.GITHUB_TOKEN);
    assert.equal(result.size, 3);
    assert.ok(result.has('expressjs/express'));
    assert.ok(result.has('lodash/lodash'));
    assert.ok(result.has('facebook/react'));
  });
});
