// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import parseUserAgent from '../../javascripts/user-agent'

describe('parseUserAgent', () => {
  it('android, chrome', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('android')
    expect(browser).toBe('chrome')
  })

  it('ios, safari', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('ios')
    expect(browser).toBe('safari')
  })

  it('windows, edge', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('windows')
    expect(browser).toBe('edge')
  })

  it('mac, safari', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('mac')
    expect(browser).toBe('safari')
  })

  it('windows, chrome', () => {
    const ua = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('windows')
    expect(browser).toBe('chrome')
  })

  it('linux, firefox', () => {
    const ua = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('linux')
    expect(browser).toBe('firefox')
  })

  it('other, other', () => {
    const ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    const { os, browser } = parseUserAgent(ua)
    expect(os).toBe('other')
    expect(browser).toBe('other')
  })
})
