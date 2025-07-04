// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const slash = require('slash')
const patterns = require('./patterns')
const allVersions = Object.keys(require('./all-versions'))
const { getVersionedPathWithLanguage } = require('./path-utils')

module.exports = function findPage (href, pageMap, redirects = {}, languageCode = 'en', sourceLanguage = null) {
  // Convert Windows backslashes to forward slashes
  // remove trailing slash
  href = slash(href).replace(patterns.trailingSlash, '$1')

  // do an initial lookup on the path as-is
  let page = pageMap[removeFragment(href)]
  if (page) return page

  // check all potential versions
  const versionedPathsToCheck = [...new Set(allVersions.map(version => {
    return getVersionedPathWithLanguage(href, version, languageCode)
  }))]

  // get the first found path of the page (account for redirects)
  let pathToPage = versionedPathsToCheck.find(path => {
    path = redirects[path] || path
    return pageMap[removeFragment(path)]
  })

  // need to account for redirects again
  pathToPage = redirects[pathToPage] || pathToPage

  // try finding the page again
  page = pageMap[removeFragment(pathToPage)]

  if (page) return page

  if (process.env.NODE_ENV !== 'test' && languageCode === 'en') {
    const error = sourceLanguage
      ? `href not found in ${sourceLanguage} pages (no English fallback found)`
      : 'href not found'

    // if English page can't be found, throw an error
    // because these errors should be surfaced and fixed right away
    if (sourceLanguage === 'en') {
      throw new Error(`${error}: ${href}`)
    } else {
      console.error(`${error}: ${href}`)
    }
  }

  // if English page can't be found in tests, don't throw an error
  // or the tests will stall
  if (process.env.NODE_ENV === 'test' && languageCode === 'en') {
    if (sourceLanguage === 'en') console.log(`href not found: ${href}`)
    return null
  }

  // if localized page can't be found, fall back to English
  // because localized content is not yet synced
  if (languageCode !== 'en') {
    // pass the source language so we can surface it in error messages
    return findPage(href, pageMap, redirects, 'en', languageCode)
  }
}

// some redirects include fragments
// need to remove the fragment to find the page
function removeFragment (path) {
  if (!path) return

  return path.replace(/#.*$/, '')
}
