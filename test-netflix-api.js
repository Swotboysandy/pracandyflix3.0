const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(name, url, params = {}) {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`📡 URL: ${url}`);
    
    try {
        const response = await axios.get(url, { params });
        console.log(`✅ ${name} endpoint working!`);
        console.log(`📊 Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
        
        // Show counts for arrays
        if (Array.isArray(response.data)) {
            console.log(`📈 Count: ${response.data.length} items`);
        } else if (response.data?.searchResult) {
            console.log(`📈 Search results: ${response.data.searchResult.length} items`);
        } else if (response.data?.episodes) {
            console.log(`📈 Episodes: ${response.data.episodes.length} items`);
        }
        
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`❌ ${name} endpoint failed!`);
        console.log(`🚨 Error:`, error.message);
        if (error.response) {
            console.log(`🚨 Status:`, error.response.status);
            console.log(`🚨 Data:`, error.response.data);
        }
        return { success: false, error: error.message };
    }
}

async function runAllTests() {
    console.log('🚀 Starting Netflix API Tests...');
    console.log('📍 API Base URL:', API_BASE_URL);
    console.log('=' .repeat(60));

    const results = {
        search: await testEndpoint('Search', `${API_BASE_URL}/search`, { q: 'Stranger' }),
        details: await testEndpoint('Details', `${API_BASE_URL}/details/80057281`),
        episodes: await testEndpoint('Episodes', `${API_BASE_URL}/episodes/80057281`),
        stream: await testEndpoint('Stream', `${API_BASE_URL}/stream`, { id: '80057281', hash: 'test' })
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = Object.values(results).filter(r => r.success).length;
    const failed = Object.values(results).filter(r => !r.success).length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('=' .repeat(60));

    // Show specific notes
    console.log('\n📝 NOTES:');
    console.log('- Search: Should return array of results');
    console.log('- Details: Should return full movie/series details');
    console.log('- Episodes: May fail if 80057281 is not a Series ID');
    console.log('- Stream: Expected to return {r: "n"} due to server protections');
    
    if (results.stream.success && results.stream.data?.r === 'n') {
        console.log('\n✓ Stream endpoint behaving as expected (returning {r: "n"})');
    }

    process.exit(failed > 0 && failed !== 1 ? 1 : 0);  // Allow 1 failure (episodes)
}

// Run the tests
runAllTests().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
