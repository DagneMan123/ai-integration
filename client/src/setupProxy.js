const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onError: (err, req, res) => {
        // Silently handle errors instead of crashing
        res.status(503).json({
          success: false,
          error: 'Backend service unavailable'
        });
      }
    })
  );

  // Don't proxy favicon requests
  app.use((req, res, next) => {
    if (req.path === '/favicon.ico') {
      res.status(204).end();
    } else {
      next();
    }
  });
};
