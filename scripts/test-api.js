async function testAPI() {
    console.log('Testing /api/materials...');
    try {
        const res1 = await fetch('http://localhost:3000/api/materials?course=all');
        console.log('Materials OK:', res1.ok, res1.status);
        if (res1.ok) {
            const data = await res1.json();
            console.log('Materials count:', data.length);
        }
    } catch (e) {
        console.error('Materials fetch failed:', e.message);
    }

    console.log('Testing /api/summaries/sync...');
    try {
        const res2 = await fetch('http://localhost:3000/api/summaries/sync');
        console.log('Summaries OK:', res2.ok, res2.status);
        if (res2.ok) {
            const data = await res2.json();
            console.log('Summaries count:', data.length);
        }
    } catch (e) {
        console.error('Summaries fetch failed:', e.message);
    }
}

testAPI();
