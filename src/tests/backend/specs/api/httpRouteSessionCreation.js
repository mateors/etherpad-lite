'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const settings = require('../../../../node/utils/Settings');
const fs = require('fs');
let agent;

const shouldCreateSession = [
  '/p/foo',
  '/p/foo/export/html',
];
const shouldNotCreateSession = [
  '/',
  '/api/',
  '/favicon.ico',
  '/locales.json',
  '/pluginfw/plugin-definitions.json',
  '/static/js/pad.js',
  '/stats/',
];

const getDatabaseSize = () => {
  const dbFile = settings.dbSettings.filename;
  const database = fs.readFileSync(settings.dbSettings.filename, 'utf8');
  return database.split('\n').length;
}

describe(__filename, function () {
  before(async function () { agent = await common.init(); });

  describe('Session Creation on endpoint', function () {
    if (settings.dbType !== 'dirty') this.skip;

    this.timeout(100);

    for (const endpoint of shouldNotCreateSession) {
      it(endpoint, async function () {
        const previousCount = getDatabaseSize();
        await agent.get(endpoint)
        .expect(200)
        .expect(() => {
          const newCount = getDatabaseSize();
          assert(newCount === previousCount);
        })
      });
    }

    for (const endpoint of shouldCreateSession) {
      const previousCount = getDatabaseSize();
      it(endpoint, async function () {
        await agent.get(endpoint)
        .expect(200)
        .expect(() => {
          const newCount = getDatabaseSize();
          assert(newCount > previousCount);
        })
      });
    }

  });
});