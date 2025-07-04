// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
#!/usr/bin/env node

// [start-readme]
//
// This script is run automatically via GitHub Actions on every push to `master` to generate searchable data
// and upload it to our Algolia account. It can also be run manually. For more info see [contributing/search.md](contributing/search.md)
//
// [end-readme]

require('make-promises-safe')

main()

async function main () {
  const sync = require('../lib/algolia/sync')
  const opts = {
    dryRun: 'DRY_RUN' in process.env,
    language: process.env.LANGUAGE,
    version: process.env.VERSION
  }
  await sync(opts)
}
