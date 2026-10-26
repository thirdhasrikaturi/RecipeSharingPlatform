const http = require('http');

const recipe = JSON.stringify({
  name: 'Margherita Pizza',
  category: 'Italian',
  time: '20 min',
  image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600',
  description: 'A delicious homemade cheese pizza.'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/recipes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(recipe)
  }
};

const request = http.request(options, (response) => {
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    console.log('Status:', response.statusCode);
    console.log('Response:', data);
  });
});

request.on('error', (error) => {
  console.error('Request failed:', error.message);
});

request.write(recipe);
request.end();