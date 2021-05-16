const fs = require('fs')
const path = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const cx = require('nanoclass')
const imageUrlBuilder = require('@sanity/image-url')
const client = require('./src/util/client')
const usePagination = require('./src/util/usePagination')
const html = require('./src/util/html')
const formatNumber = require('./src/util/formatNumber')
const builder = imageUrlBuilder(client)

module.exports = function(eleventyConfig) {
  // Resolves hashed filesnames for assets generated by webpack
  // (See usage in templates/layouts/base.liquid)
  eleventyConfig.addLiquidShortcode('webpackAsset', async (name) => {
    const manifestData = await readFile(
      path.resolve(__dirname, 'src/templates/includes/_manifest.json'),
    )
    const manifest = JSON.parse(manifestData)

    return manifest[name]
  })

  // Prints JSON to the page. Useful for debugging inside templates
  eleventyConfig.addShortcode(
    'debug',
    (value) =>
      `<div class="ph25 pv100">
        <pre
          class="p25 f14 mono bg-blue c-tan"
          style="width: 100%; overflow: auto; border-radius: 6px;"
        >
          ${JSON.stringify(value, null, 2)}
        </pre>
      </div>`,
  )

  // Builds urls for images using the Sanity image pipeline
  eleventyConfig.addShortcode('urlFor', (image, width) => {
    return builder
      .image(image)
      .width(width) // resize the image
      .auto('format') // automatically serves WebP for supporting browsers
      .url()
  })

  // Concatenates classnames using a tiny utility called nanoclass
  // https://github.com/estrattonbailey/nanoclass
  eleventyConfig.addShortcode('classNames', (...all) => cx(all))

  eleventyConfig.addShortcode('pagination', (page, count) => {
    const items = usePagination({ page, count })

    return html`
      <ul class="df jcc aic" data-component="pagination">
        ${items
          .map(({ page, type, selected, ...item }) => {
            let children = null

            if (type === 'start-ellipsis' || type === 'end-ellipsis') {
              children = html`
                <div class="rel w30 h30 br3">
                  <div class="absolute-center text-16 font-medium leading-100">
                    …
                  </div>
                </div>
              `
            } else if (type === 'page') {
              children = html`
                <button
                  type="button"
                  class="${cx(['p10 br3 mh5 js-buttons', selected && 'ba'])}"
                  aria-label="${selected
                    ? `The current page is ${page}`
                    : `Go to page ${page}`}"
                  ${item.disabled ? 'disabled' : ''}
                  ${item['aria-current'] ? 'aria-current="true"' : ''}
                  ${page ? `data-target="${page}"` : ``}
                >
                  <div class="mono f18 lh100">
                    ${formatNumber(page)}
                  </div>
                </button>
              `
            } else {
              children = html`
                <button
                  type="button"
                  class="rel p10 br3 mh10 js-buttons"
                  aria-label="Go to ${type} page"
                  ${item.disabled ? 'disabled' : ''}
                  ${item['aria-current'] ? 'aria-current="true"' : ''}
                  ${page ? `data-target="${page}"` : ``}
                >
                  <div class="w9">
                    ${type === 'previous'
                      ? html`
                          <svg
                            class="db"
                            viewBox="0 0 9 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M7.71759 0.646484L8.4247 1.35359L1.70718 8.07111L8.4247 14.7886L7.71759 15.4957L0.292969 8.07111L7.71759 0.646484Z"
                              class="fill-current"
                            />
                          </svg>
                        `
                      : html`
                          <svg
                            class="db"
                            viewBox="0 0 9 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M7.364 8.07111L0.646484 1.35359L1.35359 0.646484L8.77821 8.07111L1.35359 15.4957L0.646484 14.7886L7.364 8.07111Z"
                              fill="#3F5262"
                            />
                          </svg>
                        `}
                  </div>
                </button>
              `
            }

            return html`
              <li>${children}</li>
            `
          })
          .join('')}
      </ul>
    `
  })

  // Copy favicons into the root of the build directory
  eleventyConfig.addPassthroughCopy({ 'src/assets/icons': '/' })
  eleventyConfig.addPassthroughCopy({ 'src/assets/images': '/' })

  // Configure eleventy directory names and locations
  return {
    dir: {
      input: 'src/templates',
      data: '../data',
      includes: 'includes',
      layouts: 'layouts',
      output: 'build',
    },
  }
}
