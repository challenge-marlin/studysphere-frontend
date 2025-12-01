const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // /apiで始まるパスのみをバックエンドにプロキシ
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5050',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to http://localhost:5050${req.url}`);
      }
    })
  );
};

