import connectToDatabase from './db.js'; // Ensure to use import

const run = async () => {
  let dbClient;

  try {
    dbClient = await connectToDatabase();
    console.log("Connected to the database successfully!");

  } catch (error) {
    console.error("Error connecting to the database :", error);
  } finally {
    if (dbClient) {
      await dbClient.end(); // Close the database connection
    }
  }
};

run();
