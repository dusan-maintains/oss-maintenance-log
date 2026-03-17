'use strict';

const https = require('https');
const http = require('http');

function fetchJson(url, extraHeaders) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;

    const headers = {
      'User-Agent': 'oss-health-scan/1.0',
      'Accept': 'application/json',
      ...extraHeaders
    };

    const req = mod.get({ hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location, extraHeaders).then(resolve, reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}`)); }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

module.exports = { fetchJson };
