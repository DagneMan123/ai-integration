// Quick test to see what the /companies endpoint returns
const axios = require('axios');

async function testCompaniesAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/companies');
    console.log('=== FULL RESPONSE ===');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n=== RESPONSE.DATA TYPE ===');
    console.log('Type:', typeof response.data);
    console.log('Is Array:', Array.isArray(response.data));
    console.log('Keys:', Object.keys(response.data));
    
    if (response.data.data) {
      console.log('\n=== RESPONSE.DATA.DATA ===');
      console.log('Type:', typeof response.data.data);
      console.log('Is Array:', Array.isArray(response.data.data));
      if (Array.isArray(response.data.data)) {
        console.log('Length:', response.data.data.length);
        if (response.data.data.length > 0) {
          console.log('First item:', JSON.stringify(response.data.data[0], null, 2));
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCompaniesAPI();
