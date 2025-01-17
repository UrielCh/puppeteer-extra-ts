const test = require('ava')

// import test from 'ava';
// import { type Plugin, type PluginOptions } from '..';
// import type Puppeteer from 'puppeteer-extra';

const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

test.beforeEach(t => {
  // Make sure we work with pristine modules
  delete require.cache[require.resolve('puppeteer-extra')]
  delete require.cache[require.resolve('puppeteer-extra-plugin-anonymize-ua')]
})

test.serial('will remove headless from the user-agent', async t => {
  const puppeteer = require('puppeteer-extra')
  const AnonymizeUA = require('puppeteer-extra-plugin-anonymize-ua').default()
  puppeteer.use(AnonymizeUA)

  const browser = await puppeteer.launch({ args: PUPPETEER_ARGS })
  const page = await browser.newPage()
  await page.goto('https://httpbin.org/headers', {
    waitUntil: 'domcontentloaded'
  })

  const content = await page.content()
  t.true(content.includes('Windows NT 10.0'))
  t.true(!content.includes('HeadlessChrome'))

  await browser.close()
  t.true(true)
})

test.serial('will remove headless from the user-agent in incognito page', async t => {
  const puppeteer = require('puppeteer-extra')
  puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua').default())

  const browser = await puppeteer.launch({ args: PUPPETEER_ARGS })

  // Requires puppeteer@next currrently
  if (browser.createIncognitoBrowserContext) {
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    await page.goto('https://httpbin.org/headers', {
      waitUntil: 'domcontentloaded'
    })

    const content = await page.content()
    t.true(content.includes('Windows NT 10.0'))
    t.true(!content.includes('HeadlessChrome'))
  }

  await browser.close()
  t.true(true)
})

test.serial('will use a custom fn to modify the user-agent', async t => {
  const puppeteer = require('puppeteer-extra')
  puppeteer.use(
    require('puppeteer-extra-plugin-anonymize-ua').default({
      customFn: ua => 'MyCoolAgent/' + ua.replace('Chrome', 'Beer')
    })
  )

  const browser = await puppeteer.launch({ args: PUPPETEER_ARGS })
  const page = await browser.newPage()
  await page.goto('https://httpbin.org/headers', {
    waitUntil: 'domcontentloaded'
  })

  const content = await page.content()
  t.true(content.includes('Windows NT 10.0'))
  t.true(!content.includes('HeadlessChrome'))
  t.true(content.includes('MyCoolAgent/Mozilla'))
  t.true(content.includes('Beer/'))

  await browser.close()
  t.true(true)
})
