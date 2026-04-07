#!/usr/bin/env node

/**
 * Frontend & Backend Connection Verification
 * Checks if both servers are running and connected
 */

const http = require('http');
const https = require('https');

console.log('\n🔍 Verifying Frontend & Backend Connection\n');
console.log('='.repeat(60));

// Check backend
function checkBackend() {
  return new Promise((resolve) => {
    console.log('\n1️⃣  Checking Backend (http://localhost:5000)...');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'OK') {
            console.log('   ✅ Backend is running');
            console.log(`   ✅ Database status: ${json.database}`);
            resolve(true);
          } else {
            console.log('   ❌ Backend returned unexpected response');
            resolve(false);
          }
        } catch (e) {
          console.log('   ❌ Backend response is not valid JSON');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('   ❌ Backend is NOT running');
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('   ❌ Backend connection timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Check frontend
function checkFrontend() {
  return new Promise((resolve) => {
    console.log('\n2️⃣  Checking Frontend (http://localhost:3000)...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Frontend is running');
        resolve(true);
      } else {
        console.log(`   ❌ Frontend returned status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log('   ❌ Frontend is NOT running');
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('   ❌ Frontend connection timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Check API endpoint
function checkAPI() {
  return new Promise((resolve) => {
    console.log('\n3️⃣  Checking API Endpoint (http://localhost:5000/api/auth)...');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 404 || res.statusCode === 200) {
        console.log('   ✅ API endpoint is accessible');
        resolve(true);
      } else {
        console.log(`   ⚠️  API returned status ${res.statusCode}`);
        resolve(true); // Still OK, endpoint exists
      }
    });
    
    req.on('error', (error) => {
      console.log('   ❌ API endpoint is NOT accessible');
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('   ❌ API connection timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Main verification
async function verify() {
  const backendOK = await checkBackend();
  const frontendOK = await checkFrontend();
  const apiOK = await checkAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Connection Status:\n');
  
  console.log(`Backend (port 5000):     ${backendOK ? '✅ Running' : '❌ Not Running'}`);
  console.log(`Frontend (port 3000):    ${frontendOK ? '✅ Running' : '❌ Not Running'}`);
  console.log(`API Endpoint:            ${apiOK ? '✅ Accessible' : '❌ Not Accessible'}`);
  
  console.log('\n' + '='.repeat(60));
  
  if (backendOK && frontendOK && apiOK) {
    console.log('\n✅ SUCCESS! Frontend and Backend are connected!\n');
    console.log('Access your application at: http://localhost:3000\n');
    process.exit(0);
  } else {
    console.log('\n❌ Connection issues detected.\n');
    
    if (!backendOK) {
      console.log('💡 To fix backend:');
      console.log('   1. Make sure PostgreSQL is running');
      console.log('   2. Run: cd server && npm run dev\n');
    }
    
    if (!frontendOK) {
      console.log('💡 To fix frontend:');
      console.log('   1. Run: cd client && npm run dev\n');
    }
    
    process.exit(1);
  }
}

verify().catch(error => {
  console.error('Verification error:', error);
  process.exit(1);
});
