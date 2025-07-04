// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const externalSites = require('../../lib/redirects/external-sites')

// blanket redirects to external websites
module.exports = async function externalRedirects (req, res, next) {
  if (req.path in externalSites) {
    return res.redirect(301, externalSites[req.path])
  } else {
    return next()
  }
}
