// testServer.js
const { spawn } = require('child_process');
const axios = require('axios');
const waitOn = require('wait-on');

const server = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });

// Function to test server responsiveness
async function testServer() {
  try {
    await waitOn({ resources: ['http://localhost:3000'] }); // Adjust the URL as necessary
    const response = await axios.get('http://localhost:3000'); // Adjust as needed for specific routes
    console.log('Server responded with status:', response.status);
    if (response.status === 200) {
      console.log('Test passed: Server is up and running!');
    } else {
      console.log('Test failed: Server responded but not with status 200.');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    server.kill('SIGINT'); // Attempt to gracefully stop the server
  }
}

// Delay the test to give the server time to start
setTimeout(testServer, 10000); // Adjust the delay based on server start time
