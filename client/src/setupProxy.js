const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onError: (err, req, res) => {
        res.status(503).json({
          success: false,
          error: 'Backend service unavailable'
        });
      }
    })
  );

  app.use((req, res, next) => {
    if (req.path === '/favicon.ico') {
      res.status(204).end();
    } else {
      next();
    }
  });
};
