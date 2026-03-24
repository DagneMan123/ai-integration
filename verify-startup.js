#!/usr/bin/env node

const http = require('http');
const net = require('net');

console.log('\n========================================');
console.log('STARTUP VERIFICATION');
console.log('========================================\n');

// Check if port is in use
function checkPort(port, name) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`✓ ${name} is running on port ${port}`);
        resolve(true);
      } else {
        console.log(`✗ ${name} is NOT running on port ${port}`);
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      console.log(`✗ ${name} is NOT running on port ${port}`);
      resolve(false);
    });
    server.listen(port);
  });
}

// Check API endpoint
function checkAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✓ Server API is responding');
        resolve(true);
      } else {
        console.log('✗ Server API is not responding correctly');
        resolve(false);
      }
    });

    req.on('error', () => {
      console.log('✗ Cannot connect to Server API');
      resolve(false);
    });

    req.end();
  });
}

async function verify() {
  console.log('Checking services...\n');

  const postgresRunning = await checkPort(5432, 'PostgreSQL');
  const serverRunning = await checkPort(5000, 'Server');
  const clientRunning = await checkPort(3000, 'Client');

  if (serverRunning) {
    await checkAPI();
  }

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`PostgreSQL: ${postgresRunning ? '✓ Running' : '✗ Not running'}`);
  console.log(`Server:     ${serverRunning ? '✓ Running' : '✗ Not running'}`);
  console.log(`Client:     ${clientRunning ? '✓ Running' : '✗ Not running'}`);
  console.log('========================================\n');

  if (!postgresRunning) {
    console.log('ACTION: Start PostgreSQL with: start-postgres-now.bat\n');
  }
  if (!serverRunning) {
    console.log('ACTION: Start Server with: cd server && npm run dev\n');
  }
  if (!clientRunning) {
    console.log('ACTION: Start Client with: cd client && npm run dev\n');
  }

  if (postgresRunning && serverRunning && clientRunning) {
    console.log('✓ All services are running!');
    console.log('✓ Open browser: http://localhost:3000\n');
  }
}

verify().catch(console.error);
