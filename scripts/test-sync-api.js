const { GET } = require('../app/api/summaries/sync/route');

async function testFetch() {
    try {
        console.log('Calling GET()...');
        const res = await GET();
        const data = await res.json();
        console.log('Data returned:', data.length, 'records');
        if (data.length > 0) {
            console.log('First record uuid:', data[0].uuid);
        }
    } catch (e) {
        console.error('Test failed:', e);
    }
}

testFetch();
