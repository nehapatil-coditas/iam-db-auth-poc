import pkg from 'pg'; // Import the entire pg module
import { Signer } from '@aws-sdk/rds-signer';
import fs from 'fs';

const { Client } = pkg; // Destructure Client from the imported module

const sslCA = fs.readFileSync('./global-bundle.pem');

// Variables to store the cached token and its expiration time
let cachedToken = null;
let tokenExpirationTime = 0; 
let tokenGenerationCount = 0; // Counter for token generation

const getRDSAuthToken = async (host, port, username, region) => {
  const currentTime = Date.now(); // Current time in milliseconds

  // Check if we already have a cached token and if it's still valid
  if (cachedToken && currentTime < tokenExpirationTime) {
    console.log(`Using cached token. Total tokens generated: ${tokenGenerationCount}`);
    return cachedToken; // Return the cached token if it's still valid
  }

  // Generate a new token if there is no valid cached token
  const signer = new Signer({
    region,
    hostname: host,
    port,
    username,
  });

  const startTime = Date.now(); // Start time before token generation
  cachedToken = await signer.getAuthToken(); // Generate new token
  const endTime = Date.now(); // End time after token generation

  // Increment the token generation count
  tokenGenerationCount++;
  
  // Set the token expiration time to 15 minutes from now
  tokenExpirationTime = currentTime + 15 * 60 * 1000; // 15 minutes in milliseconds

  // Calculate elapsed time in milliseconds
  const elapsedTime = endTime - startTime;

  // Log the elapsed time and token generation count
  console.log(`Token generated in ${elapsedTime} ms. Total tokens generated: ${tokenGenerationCount}`);

  return cachedToken; // Return the newly generated token
};

const connectToDatabase = async () => {
  const host = 'prod-codilytics-db.ctkuw0i8gtw8.us-east-1.rds.amazonaws.com'; // Replace with your DB host
  const port = 5432; // Default PostgreSQL port
  const username = 'neha'; // Replace with your DB username
  const region = 'us-east-1'; // Replace with your AWS region

  const token = await getRDSAuthToken(host, port, username, region); // Get the auth token

  const client = new Client({
    host,
    port,
    user: username,
    password: token,
    database: 'postgres_master', // Replace with your database name
    ssl: {
      rejectUnauthorized: true, // Change to true for production
      ca: sslCA,
    },
  });

  await client.connect(); // Connect to the database
  return client; // Return the database client
};

export default connectToDatabase; // Export the connectToDatabase function
