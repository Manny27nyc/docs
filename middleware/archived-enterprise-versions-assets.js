// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const path = require('path')
const patterns = require('../lib/patterns')
const isArchivedVersion = require('../lib/is-archived-version')
const got = require('got')

// This module handles requests for the CSS and JS assets for
// deprecated GitHub Enterprise versions by routing them to static content in
// help-docs-archived-enterprise-versions
//
// See also ./archived-enterprise-versions.js for non-CSS/JS paths

module.exports = async (req, res, next) => {
  const { isArchived, requestedVersion } = isArchivedVersion(req)
  if (!isArchived) return next()

  // Only match asset paths
  if (!patterns.assetPaths.test(req.path)) return next()

  const assetPath = req.path.replace(`/enterprise/${requestedVersion}`, '')
  const proxyPath = path.join('/', requestedVersion, assetPath)

  try {
    const r = await got(`https://github.github.com/help-docs-archived-enterprise-versions${proxyPath}`)
    res.set('accept-ranges', 'bytes')
    res.set('content-type', r.headers['content-type'])
    res.set('content-length', r.headers['content-length'])
    res.set('x-is-archived', 'true')
    res.set('x-robots-tag', 'noindex')
    res.send(r.body)
  } catch (err) {
    next()
  }
}
