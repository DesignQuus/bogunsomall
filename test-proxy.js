async function testProxy() {
  try {
    const res = await fetch('http://localhost:3000/__user_data_proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    console.error('Error fetching proxy:', err);
  }
}

testProxy();
