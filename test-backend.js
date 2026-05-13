async function testBackend() {
  try {
    const res = await fetch('http://localhost:8080/user-data/tools/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'ed791dc7-7bab-4eac-920b-2d37e1458bd9' // The key from .env.local
      },
      body: JSON.stringify({
        tool: 'user_data_list_tables',
        arguments: {}
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error fetching backend:', err);
  }
}

testBackend();
