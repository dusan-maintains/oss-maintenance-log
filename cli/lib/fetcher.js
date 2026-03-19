'use strict';

const https = require('https');
const http = require('http');

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

/**
 * Fetch JSON from a URL with retry logic for transient errors.
 * Returns { data, rateLimit } for GitHub API responses.
 */
function fetchJson(url, extraHeaders, _attempt) {
  _attempt = _attempt || 1;

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;

    const headers = {
      'User-Agent': 'oss-health-scan/1.0',
      'Accept': 'application/json',
      ...extraHeaders
    };

    const req = mod.get({ hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers }, res => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location, extraHeaders, 1).then(resolve, reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Retry on 5xx
        if (res.statusCode >= 500 && _attempt <= MAX_RETRIES) {
          return setTimeout(() => {
            fetchJson(url, extraHeaders, _attempt + 1).then(resolve, reject);
          }, RETRY_DELAY_MS * _attempt);
        }

        // Retry on 429 (rate limit) with Retry-After or exponential backoff
        if (res.statusCode === 429 && _attempt <= MAX_RETRIES) {
          const retryAfter = parseInt(res.headers['retry-after'] || '0') * 1000;
          const delay = retryAfter > 0 ? retryAfter : RETRY_DELAY_MS * Math.pow(2, _attempt);
          return setTimeout(() => {
            fetchJson(url, extraHeaders, _attempt + 1).then(resolve, reject);
          }, delay);
        }

        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        }

        let parsed;
        try { parsed = JSON.parse(data); }
        catch (e) { return reject(new Error(`Invalid JSON from ${url}`)); }

        // Extract rate limit headers for GitHub API
        const rateLimit = res.headers['x-ratelimit-remaining'] != null ? {
          remaining: parseInt(res.headers['x-ratelimit-remaining']),
          limit: parseInt(res.headers['x-ratelimit-limit'] || '60'),
          reset: parseInt(res.headers['x-ratelimit-reset'] || '0')
        } : null;

        if (rateLimit) {
          resolve({ data: parsed, rateLimit });
        } else {
          resolve(parsed);
        }
      });
    });

    req.on('error', err => {
      // Retry on network errors
      if (_attempt <= MAX_RETRIES && (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND')) {
        return setTimeout(() => {
          fetchJson(url, extraHeaders, _attempt + 1).then(resolve, reject);
        }, RETRY_DELAY_MS * _attempt);
      }
      reject(err);
    });

    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

module.exports = { fetchJson };
