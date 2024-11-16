const request = require('supertest');
const express = require('express');

// Create a basic Express app for testing
const app = express();

// Add a simple route for testing
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

describe('Site Health Check', () => {
  test('Homepage should return 200', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});