import { oneLine, stripIndent } from "common-tags"
import React from "react"

const generateGTM = ({ id, environmentParamStr }) => stripIndent`
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${environmentParamStr}';f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer', '${id}');`

const generateGTMIframe = ({ id, environmentParamStr }) =>
  oneLine`<iframe src="https://www.googletagmanager.com/ns.html?id=${id}${environmentParamStr}" height="0" width="0" style="display: none; visibility: hidden"></iframe>`

const generateDefaultDataLayer = (dataLayer, reporter) => {
  let result = `window.dataLayer = window.dataLayer || [];`

  if (typeof dataLayer === `function`) {
    result += `window.dataLayer.push((${dataLayer})());`
  } else {
    if (typeof dataLayer !== `object` || dataLayer.constructor !== Object) {
      reporter.panic(
        `Oops the plugin option "defaultDataLayer" should be a plain object. "${dataLayer}" is not valid.`
      )
    }

    result += `window.dataLayer.push(${JSON.stringify(dataLayer)});`
  }

  return stripIndent`${result}`
}

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents, reporter },
  { id, includeInDevelopment = false, gtmAuth, gtmPreview, defaultDataLayer }
) => {
  if (process.env.NODE_ENV === `production` || includeInDevelopment) {
    const environmentParamStr =
      gtmAuth && gtmPreview
        ? oneLine`
      &gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x
    `
        : ``

    let defaultDataLayerCode
    if (defaultDataLayer) {
      defaultDataLayerCode = generateDefaultDataLayer(
        defaultDataLayer,
        reporter
      )
    }

    setHeadComponents([
      <script
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: oneLine`
            ${defaultDataLayerCode}
            ${generateGTM({ id, environmentParamStr })}`,
        }}
      />,
    ])

    setPreBodyComponents([
      <noscript
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: generateGTMIframe({ id, environmentParamStr }),
        }}
      />,
    ])
  }
}
