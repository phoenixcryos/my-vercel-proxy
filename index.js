const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configuration
const PORT = process.env.PORT || 3001; // Vercel will set PORT env variable
const TARGET_URL = process.env.TARGET_URL || 'https://jsonplaceholder.typicode.com'; // Target API

// Info GET endpoint
app.get('/info', (req, res) => {
  res.json({
    message: 'This is a proxy server.',
    target: TARGET_URL,
    status: 'Running',
    instructions: `Make requests to /proxy/* to forward them to ${TARGET_URL}/*`
  });
});

// Proxy endpoints
// All requests to /proxy/* will be forwarded
app.use('/proxy', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true, // Needed for virtual hosted sites
  pathRewrite: {
    '^/proxy': '', // Rewrite '/proxy/users' to '/users' before forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    // You can add custom headers here if needed
    // proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
    console.log(`Proxying request ${req.method} ${req.originalUrl} to ${TARGET_URL}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response ${proxyRes.statusCode} from ${TARGET_URL}${req.originalUrl}`);
    // You can modify response headers here if needed
    // proxyRes.headers['X-Proxied-By'] = 'my-vercel-proxy';
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end('Something went wrong with the proxy. And we are sad.');
  }
}));

// For any other route, return a 404
app.use((req, res) => {
  res.status(404).send('Route not found. Try /info or /proxy/*');
});


app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
  console.log(`Proxying to: ${TARGET_URL}`);
  console.log(`Access info at: http://localhost:${PORT}/info`);
  console.log(`Proxy requests via: http://localhost:${PORT}/proxy/... (e.g., /proxy/todos/1)`);
});