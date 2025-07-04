// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const findPageInVersion = require('../lib/find-page-in-version')
const { getVersionedPathWithLanguage } = require('../lib/path-utils')

// this middleware adds properties to the context object
module.exports = async (req, res, next) => {
  if (!req.context.page) return next()

  if (!(req.context.page.relativePath.endsWith('index.md') || req.context.page.layout === 'product-landing')) return next()

  if (!req.context.page.featuredLinks) return next()

  req.context.featuredLinks = {}
  for (const key in req.context.page.featuredLinks) {
    req.context.featuredLinks[key] = await getLinkData(req.context.page.featuredLinks[key], req.context)
  }

  return next()
}

// rawLinks is an array of paths: [ '/foo' ]
// we need to convert it to an array of localized objects: [ { href: '/en/foo', title: 'Foo', intro: 'Description here' } ]
async function getLinkData (rawLinks, context) {
  if (!rawLinks) return

  const links = []

  for (const link of rawLinks) {
    const href = link.href
      ? getVersionedPathWithLanguage(link.href, context.currentVersion, context.currentLanguage)
      : getVersionedPathWithLanguage(link, context.currentVersion, context.currentLanguage)

    const linkedPage = findPageInVersion(href, context.pages, context.redirects, context.currentLanguage, context.currentVersion)
    if (!linkedPage) continue

    const opts = { textOnly: true, encodeEntities: true }

    links.push({
      href,
      title: await linkedPage.renderTitle(context, opts),
      intro: await linkedPage.renderProp('intro', context, opts),
      page: linkedPage
    })
  }

  return links
}
