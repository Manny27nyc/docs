// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const { eachOfLimit } = require('async')
const enterpriseServerReleases = require('../../lib/enterprise-server-releases')
const { get } = require('../helpers/supertest')
const nonEnterpriseDefaultVersion = require('../../lib/non-enterprise-default-version')
const restRedirectFixtures = require('../fixtures/rest-redirects')
const graphqlRedirectFixtures = require('../fixtures/graphql-redirects')
const developerRedirectFixtures = require('../fixtures/developer-redirects')

const MAX_CONCURRENT_REQUESTS = 50

describe('developer redirects', () => {
  jest.setTimeout(60 * 1000)

  beforeAll(async () => {
    // The first page load takes a long time so let's get it out of the way in
    // advance to call out that problem specifically rather than misleadingly
    // attributing it to the first test
    await get('/v4')
  })

  describe('redirects /v4 requests to /graphql', () => {
    test('graphql homepage', async () => {
      const res = await get('/v4')
      expect(res.statusCode).toBe(301)
      const expectedFinalPath = `/en/${nonEnterpriseDefaultVersion}/graphql`
      expect(res.headers.location).toBe(expectedFinalPath)
    })

    test('graphql enterprise homepage', async () => {
      const res = await get('/enterprise/v4', { followAllRedirects: true })
      expect(res.statusCode).toBe(200)
      const finalPath = (new URL(res.request.url)).pathname
      const expectedFinalPath = `/en/enterprise-server@${enterpriseServerReleases.latest}/graphql`
      expect(finalPath).toBe(expectedFinalPath)
    })

    test('graphql overview paths', async () => {
      const oldPath = '/v4/breaking_changes'
      const newPath = `/${nonEnterpriseDefaultVersion}/graphql/overview/breaking-changes`
      const res = await get(oldPath)
      expect(res.statusCode).toBe(301)
      expect(res.headers.location).toBe(`/en${newPath}`)

      const enterpriseRes = await get(`/enterprise${oldPath}`, { followAllRedirects: true })
      expect(enterpriseRes.statusCode).toBe(200)
      const finalPath = (new URL(enterpriseRes.request.url)).pathname
      const expectedFinalPath = newPath.replace(nonEnterpriseDefaultVersion, `enterprise-server@${enterpriseServerReleases.latest}`)
      expect(finalPath).toBe(`/en${expectedFinalPath}`)
    })

    test('graphql reference paths with child pages', async () => {
      const sclarRes = await get('/en/v4/scalar/boolean')
      expect(sclarRes.statusCode).toBe(301)
      const sclarResFinalPath = `/en/${nonEnterpriseDefaultVersion}/graphql/reference/scalars#boolean`
      expect(sclarRes.headers.location).toBe(sclarResFinalPath)

      const enumRes = await get('/en/v4/enum/searchtype')
      expect(enumRes.statusCode).toBe(301)
      const enumResFinalPath = `/en/${nonEnterpriseDefaultVersion}/graphql/reference/enums#searchtype`
      expect(enumRes.headers.location).toBe(enumResFinalPath)
    })
  })

  test('redirects /v3 requests to /rest', async () => {
    let expectedFinalPath
    let res = await get('/v3')
    expect(res.statusCode).toBe(301)
    expectedFinalPath = `/en/${nonEnterpriseDefaultVersion}/rest`
    expect(res.headers.location).toBe(expectedFinalPath)

    // REST subresources like activity notifications don't have their own page
    // any more, so redirect to an anchor on the resource page
    res = await get('/en/v3/activity')
    expect(res.statusCode).toBe(301)
    expectedFinalPath = `/en/${nonEnterpriseDefaultVersion}/rest/reference/activity`
    expect(res.headers.location).toBe(expectedFinalPath)

    // REST subresources like activity notifications don't have their own page
    // any more, so redirect to an anchor on the resource page
    res = await get('/en/v3/activity/notifications')
    expect(res.statusCode).toBe(301)
    expectedFinalPath = `/en/${nonEnterpriseDefaultVersion}/rest/reference/activity#notifications`
    expect(res.headers.location).toBe(expectedFinalPath)

    // trailing slashes are handled separately by the `slashes` module;
    // any request to a /v3 URL with a trailing slash will be redirected twice
    res = await get('/en/v3/activity/notifications/')
    expect(res.statusCode).toBe(301)
    expect(res.headers.location).toBe('/en/v3/activity/notifications')

    // non-reference redirects (e.g. guides)
    res = await get('/en/v3/guides/basics-of-authentication')
    expect(res.statusCode).toBe(301)
    expectedFinalPath = `/en/${nonEnterpriseDefaultVersion}/rest/guides/basics-of-authentication`
    expect(res.headers.location).toBe(expectedFinalPath)
  })

  describe('fixtures', () => {
    // this fixtures file includes paths like /apps and /webhooks, plus /enterprise paths
    test('developer redirects', async () => {
      await eachOfLimit(
        developerRedirectFixtures,
        MAX_CONCURRENT_REQUESTS,
        async (newPath, oldPath) => {
          const res = await get(oldPath)
          expect(res.statusCode, `${oldPath} did not redirect to ${newPath}`).toBe(301)
          expect(res.headers.location).toBe(newPath)
        }
      )
    })

    // this fixtures file includes /v3 and /enterprise/v3 paths
    test('rest reference redirects', async () => {
      await eachOfLimit(
        restRedirectFixtures,
        MAX_CONCURRENT_REQUESTS,
        async (newPath, oldPath) => {
          // REST and GraphQL developer Enterprise paths with a version are only supported up to 2.21.
          // We make an exception to always redirect versionless paths to the latest version.
          newPath = newPath.replace('/enterprise-server/', `/enterprise-server@${enterpriseServerReleases.latest}/`)
          const res = await get(oldPath)
          expect(res.statusCode, `${oldPath} did not redirect to ${newPath}`).toBe(301)
          expect(res.headers.location).toBe(newPath)
        }
      )
    })

    // this fixtures file includes /v4 and /enterprise/v4 paths
    test('graphql reference redirects', async () => {
      await eachOfLimit(
        graphqlRedirectFixtures,
        MAX_CONCURRENT_REQUESTS,
        async (newPath, oldPath) => {
          // REST and GraphQL developer Enterprise paths with a version are only supported up to 2.21.
          // We make an exception to always redirect versionless paths to the latest version.
          newPath = newPath.replace('/enterprise-server/', `/enterprise-server@${enterpriseServerReleases.latest}/`)
          const res = await get(oldPath)
          expect(res.statusCode, `${oldPath} did not redirect to ${newPath}`).toBe(301)
          expect(res.headers.location).toBe(newPath)
        }
      )
    })
  })
})
