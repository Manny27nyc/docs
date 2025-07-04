// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
/* global page, browser */
const sleep = require('await-sleep')
const querystring = require('querystring')

describe('homepage', () => {
  jest.setTimeout(60 * 1000)

  test('should be titled "GitHub Documentation"', async () => {
    await page.goto('http://localhost:4001')
    await expect(page.title()).resolves.toMatch('GitHub Documentation')
  })
})

describe('algolia browser search', () => {
  jest.setTimeout(60 * 1000)

  it('works on the homepage', async () => {
    await page.goto('http://localhost:4001/en')
    await page.click('#search-input-container input[type="search"]')
    await page.type('#search-input-container input[type="search"]', 'actions')
    await page.waitForSelector('.ais-Hits')
    const hits = await page.$$('.ais-Hits-item')
    expect(hits.length).toBeGreaterThan(5)
  })

  it('works on article pages', async () => {
    await page.goto('http://localhost:4001/en/actions')
    await page.click('#search-input-container input[type="search"]')
    await page.type('#search-input-container input[type="search"]', 'workflows')
    await page.waitForSelector('.ais-Hits')
    const hits = await page.$$('.ais-Hits-item')
    expect(hits.length).toBeGreaterThan(5)
  })

  it('works on 404 error page', async () => {
    await page.goto('http://localhost:4001/en/404')
    await page.click('#search-input-container input[type="search"]')
    await page.type('#search-input-container input[type="search"]', 'actions')
    await page.waitForSelector('.ais-Hits')
    const hits = await page.$$('.ais-Hits-item')
    expect(hits.length).toBeGreaterThan(5)
  })

  it('sends the correct data to algolia for Enterprise Server', async () => {
    expect.assertions(12) // 3 assertions x 4 letters ('test')

    const newPage = await browser.newPage()
    await newPage.goto('http://localhost:4001/ja/enterprise/2.22/admin/installation')

    await newPage.setRequestInterception(true)
    newPage.on('request', interceptedRequest => {
      if (interceptedRequest.method() === 'POST' && /algolia/i.test(interceptedRequest.url())) {
        const data = JSON.parse(interceptedRequest.postData())
        const { indexName, params } = data.requests[0]
        const parsedParams = querystring.parse(params)
        const analyticsTags = JSON.parse(parsedParams.analyticsTags)
        expect(indexName).toBe('github-docs-2.22-ja')
        expect(analyticsTags).toHaveLength(2)
        // browser tests are run against production build, so we are expecting env:production
        expect(analyticsTags).toEqual(expect.arrayContaining(['site:docs.github.com', 'env:production']))
      }
      interceptedRequest.continue()
    })

    await newPage.click('#search-input-container input[type="search"]')
    await newPage.type('#search-input-container input[type="search"]', 'test')
  })

  it('sends the correct data to algolia for GHAE', async () => {
    expect.assertions(12) // 3 assertions x 4 letters ('test')

    const newPage = await browser.newPage()
    await newPage.goto('http://localhost:4001/en/github-ae@latest/admin/overview')

    await newPage.setRequestInterception(true)
    newPage.on('request', interceptedRequest => {
      if (interceptedRequest.method() === 'POST' && /algolia/i.test(interceptedRequest.url())) {
        const data = JSON.parse(interceptedRequest.postData())
        const { indexName, params } = data.requests[0]
        const parsedParams = querystring.parse(params)
        const analyticsTags = JSON.parse(parsedParams.analyticsTags)
        expect(indexName).toBe('github-docs-ghae-en')
        expect(analyticsTags).toHaveLength(2)
        // browser tests are run against production build, so we are expecting env:production
        expect(analyticsTags).toEqual(expect.arrayContaining(['site:docs.github.com', 'env:production']))
      }
      interceptedRequest.continue()
    })

    await newPage.click('#search-input-container input[type="search"]')
    await newPage.type('#search-input-container input[type="search"]', 'test')
  })

  it('removes `algolia-query` query param after page load', async () => {
    await page.goto('http://localhost:4001/en?algolia-query=helpme')

    // check that the query is still present at page load
    let location = await getLocationObject(page)
    expect(location.search).toBe('?algolia-query=helpme')

    // query removal is in a setInterval, so wait a bit
    await sleep(1000)

    // check that the query has been removed after a bit
    location = await getLocationObject(page)
    expect(location.search).toBe('')
  })

  it('does not remove hash when removing `algolia-query` query', async () => {
    await page.goto('http://localhost:4001/en?algolia-query=helpme#some-header')

    // check that the query is still present at page load
    let location = await getLocationObject(page)
    expect(location.search).toBe('?algolia-query=helpme')

    // query removal is in a setInterval, so wait a bit
    await sleep(1000)

    // check that the query has been removed after a bit
    location = await getLocationObject(page)
    expect(location.search).toBe('')
    expect(location.hash).toBe('#some-header')
  })
})

describe('helpfulness', () => {
  it('sends an event to /events when submitting form', async () => {
    // Visit a page that displays the prompt
    await page.goto('http://localhost:4001/en/actions/getting-started-with-github-actions/about-github-actions')

    // Track network requests
    await page.setRequestInterception(true)
    page.on('request', request => {
      // Ignore GET requests
      if (!/\/events$/.test(request.url())) return request.continue()
      expect(request.method()).toMatch(/POST|PUT/)
      request.respond({
        contentType: 'application/json',
        body: JSON.stringify({ id: 'abcd1234' }),
        status: 200
      })
    })

    // When I click the "Yes" button
    await page.click('.js-helpfulness [for=helpfulness-yes]')
    // (sent a POST request to /events)
    // I see the request for my email
    await page.waitForSelector('.js-helpfulness [type="email"]')

    // When I fill in my email and submit the form
    await page.type('.js-helpfulness [type="email"]', 'test@example.com')

    await sleep(1000)

    await page.click('.js-helpfulness [type="submit"]')
    // (sent a PUT request to /events/{id})
    // I see the feedback
    await page.waitForSelector('.js-helpfulness [data-help-end]')
  })
})

describe('csrf meta', () => {
  it('should have a csrf-token meta tag on the page', async () => {
    await page.goto('http://localhost:4001/en/actions/getting-started-with-github-actions/about-github-actions')
    await page.waitForSelector('meta[name="csrf-token"]')
  })
})

async function getLocationObject (page) {
  const location = await page.evaluate(() => {
    return Promise.resolve(JSON.stringify(window.location, null, 2))
  })
  return JSON.parse(location)
}

describe('platform specific content', () => {
  // from tests/javascripts/user-agent.js
  const userAgents = [
    { name: 'Mac', id: 'mac', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9' },
    { name: 'Windows', id: 'windows', ua: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36' },
    { name: 'Linux', id: 'linux', ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1' }
  ]
  const linuxUserAgent = userAgents[2]
  const pageWithSwitcher = 'http://localhost:4001/en/github/using-git/configuring-git-to-handle-line-endings'
  const pageWithoutSwitcher = 'http://localhost:4001/en/github/using-git'
  const pageWithDefaultPlatform = 'http://localhost:4001/en/actions/hosting-your-own-runners/configuring-the-self-hosted-runner-application-as-a-service'

  it('should have a platform switcher', async () => {
    await page.goto(pageWithSwitcher)
    const nav = await page.$$('nav.UnderlineNav')
    const switches = await page.$$('a.platform-switcher')
    const selectedSwitch = await page.$$('a.platform-switcher.selected')
    expect(nav).toHaveLength(1)
    expect(switches.length).toBeGreaterThan(1)
    expect(selectedSwitch).toHaveLength(1)
  })

  it('should NOT have a platform switcher', async () => {
    await page.goto(pageWithoutSwitcher)
    const nav = await page.$$('nav.UnderlineNav')
    const switches = await page.$$('a.platform-switcher')
    const selectedSwitch = await page.$$('a.platform-switcher.selected')
    expect(nav).toHaveLength(0)
    expect(switches).toHaveLength(0)
    expect(selectedSwitch).toHaveLength(0)
  })

  it('should detect platform from user agent', async () => {
    for (const agent of userAgents) {
      await page.setUserAgent(agent.ua)
      await page.goto(pageWithSwitcher)
      const selectedPlatformElement = await page.waitForSelector('a.platform-switcher.selected')
      const selectedPlatform = await page.evaluate(el => el.textContent, selectedPlatformElement)
      expect(selectedPlatform).toBe(agent.name)
    }
  })

  it('should prefer defaultPlatform from frontmatter', async () => {
    for (const agent of userAgents) {
      await page.setUserAgent(agent.ua)
      await page.goto(pageWithDefaultPlatform)
      const defaultPlatform = await page.$eval('[data-default-platform]', el => el.dataset.defaultPlatform)
      const selectedPlatformElement = await page.waitForSelector('a.platform-switcher.selected')
      const selectedPlatform = await page.evaluate(el => el.textContent, selectedPlatformElement)
      expect(defaultPlatform).toBe(linuxUserAgent.id)
      expect(selectedPlatform).toBe(linuxUserAgent.name)
    }
  })

  it('should show the content for the selected platform only', async () => {
    await page.goto(pageWithSwitcher)

    const platforms = ['mac', 'windows', 'linux']
    for (const platform of platforms) {
      await page.click(`.platform-switcher[data-platform="${platform}"]`)

      // content for selected platform is expected to become visible
      await page.waitForSelector(`.extended-markdown.${platform}`, { visible: true, timeout: 3000 })

      // only a single tab should be selected
      const selectedSwitch = await page.$$('a.platform-switcher.selected')
      expect(selectedSwitch).toHaveLength(1)

      // content for NOT selected platforms is expected to become hidden
      const otherPlatforms = platforms.filter(e => e !== platform)
      for (const other of otherPlatforms) {
        await page.waitForSelector(`.extended-markdown.${other}`, { hidden: true, timeout: 3000 })
      }
    }
  })
})
