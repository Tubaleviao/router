const domains = "tuba.work,skycode.work".split(',')
const ports = "3011,3012".split(',')
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const fs = require('fs')
const protocol = require('https')

const app = express()
const getSecureContext = domain => ({
      key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`),
      cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`),
    })
const options = { ...getSecureContext('tuba.work') }
let server = protocol.createServer(options, app)
domains.forEach(d => server.addContext(d, getSecureContext(d)))

const routes = { ...domains.reduce((p,n,i) => ({ ...p, [n]: 'https://'+n+':'+ports[i]}), {}) }
// {'tuba.work': 'https://tuba.work:3011', 'skycode.work': 'https://skycode.work:3011'}

const apiProxy = createProxyMiddleware({
  target: 'https://tuba.work:3011', changeOrigin: true, ws: true, router: routes,
})
app.use('/', apiProxy)

server.listen(443, () => console.log(`Port 443`))