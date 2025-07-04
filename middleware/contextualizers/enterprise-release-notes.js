// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const semver = require('semver')
const renderContent = require('../../lib/render-content')
const patterns = require('../../lib/patterns')
const enterpriseReleases = require('../../lib/enterprise-server-releases').supported

/**
 * Turn { [key]: { notes, intro, date } }
 * into [{ version, notes, intro, date }]
 */
function sortPatchKeys (release, version) {
  const keys = Object.keys(release)
    .map(key => ({ version: `${version}.${key}`, patchVersion: key, ...release[key] }))
  return keys
    .sort((a, b) => {
      if (semver.gt(a.version, b.version)) return -1
      if (semver.lt(a.version, b.version)) return 1
      return 0
    })
}

/**
 * Render each note in the given patch, by looping through the
 * sections and rendering either `note` or `note.notes` in the
 * case of a sub-section
 */
async function renderPatchNotes (patch, ctx) {
  // Run the notes through the markdown rendering pipeline
  for (const key in patch.sections) {
    await Promise.all(patch.sections[key].map(async (noteOrHeading, index) => {
      patch.sections[key][index] = typeof noteOrHeading === 'string'
        ? await renderContent(noteOrHeading, ctx)
        : {
            ...noteOrHeading,
            notes: await Promise.all(noteOrHeading.notes.map(note => renderContent(note, ctx)))
          }
    }))
  }

  return patch
}

module.exports = async (req, res, next) => {
  // The `/release-notes` sub-path
  if (!req.path.endsWith('/release-notes')) return next()

  // ignore paths that don't have an enterprise version number
  if (!patterns.getEnterpriseServerNumber.test(req.path)) return next()

  // extract enterprise version from path, e.g. 2.16
  const requestedVersion = req.path.match(patterns.getEnterpriseServerNumber)[1]

  const versionString = `${requestedVersion.replace(/\./g, '-')}`

  const allReleaseNotes = req.context.site.data['release-notes']

  // This version doesn't have any release notes - let's be helpful and redirect
  // to the notes on `enterprise.github.com`
  if (!allReleaseNotes || !allReleaseNotes[versionString]) {
    return res.redirect(`https://enterprise.github.com/releases/${requestedVersion}.0/notes`)
  }

  const releaseNotes = allReleaseNotes[versionString]
  const patches = sortPatchKeys(releaseNotes, requestedVersion)

  req.context.releaseNotes = await Promise.all(patches.map(async patch => renderPatchNotes(patch, req.context)))

  // Put together information about other releases
  req.context.releases = enterpriseReleases.map(version => {
    const ret = { version }
    if (!req.context.site.data['release-notes']) return ret
    const release = req.context.site.data['release-notes'][version.replace(/\./g, '-')]
    if (!release) return ret
    const patches = sortPatchKeys(release, version)
    return { ...ret, patches }
  })

  const releaseIndex = enterpriseReleases.findIndex(release => release === requestedVersion)
  req.context.nextRelease = enterpriseReleases[releaseIndex - 1]
  req.context.prevRelease = enterpriseReleases[releaseIndex + 1]

  return next()
}
