import pkg from 'pg'; // Import the entire pg module
import { Signer } from '@aws-sdk/rds-signer';
import fs from 'fs';

const { Client } = pkg; // Destructure Client from the imported module

const sslCA = fs.readFileSync('./global-bundle.pem');

let tokenGenerationCount = 0; // Counter for token generation

const getRDSAuthToken = async (host, port, username, region) => {
  const signer = new Signer({
    region,
    hostname: host,
    port,
    username,
  });

  const startTime = Date.now(); // Start time before token generation
  const token = await signer.getAuthToken();
  const endTime = Date.now(); // End time after token generation

  // Increment the token generation count
  tokenGenerationCount++;

  // Calculate elapsed time in milliseconds
  const elapsedTime = endTime - startTime;

  // Log the elapsed time and token generation count
  console.log(`Token generated in ${elapsedTime} ms. Total tokens generated: ${tokenGenerationCount}`);

  return token;
};


const connectToDatabase = async () => {
  const host = 'prod-codilytics-db.ctkuw0i8gtw8.us-east-1.rds.amazonaws.com'; // Replace with your DB host
  const port = 5432; // Default PostgreSQL port
  const username = 'neha'; // Replace with your DB username
  const region = 'us-east-1'; // Replace with your AWS region

  const token = await getRDSAuthToken(host, port, username, region);

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

  await client.connect();
  return client;
};

export default connectToDatabase;
