// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const path = require('path')
const walk = require('walk-sync').entries
const Page = require('./page')
const languages = require('./languages')

function loadPageList () {
  // load english pages
  const englishPath = path.join(__dirname, '..', languages.en.dir, 'content')
  const englishPaths = walk(englishPath, {
    globs: ['**/*.md'],
    ignore: ['**/README.md']
  })
  const englishPages = englishPaths.map(
    opts => Page.read({
      ...opts,
      languageCode: languages.en.code
    })
  )

  // load matching pages in other languages
  const localizedPaths = Object.values(languages)
    .filter(({ code }) => code !== 'en')
    .map(language => {
      const basePath = path.join(__dirname, '..', language.dir, 'content')
      return englishPages.map(page => ({
        basePath,
        relativePath: page.relativePath,
        languageCode: language.code
      }))
    })
    .flat()

  const localizedPages = localizedPaths.map(
    ({ basePath, relativePath, languageCode }) =>
      Page.read({ basePath, relativePath, languageCode })
  )

  // Build out the list of prepared pages
  return englishPages
    .concat(localizedPages)
    .filter(Boolean)
    .map(opts => new Page(opts))
}

function createMapFromArray (pageList) {
  // add keys to the object for each of the page's permalinks for fast lookup
  const pageMap =
    pageList.reduce(
      (pageMap, page) => {
        for (const permalink of page.permalinks) {
          pageMap[permalink.href] = page
        }
        return pageMap
      },
      {}
    )

  return pageMap
}

function loadPageMap (pageList) {
  const pages = pageList || loadPageList()
  return createMapFromArray(pages)
}

module.exports = {
  loadPages: loadPageList,
  loadPageMap
}
