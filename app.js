import connectToDatabase from './db.js'; // Ensure to use import

const run = async () => {
  let dbClient;

  try {
    dbClient = await connectToDatabase();
    console.log("Connected to the database successfully!");

    const res = await dbClient.query('SELECT * FROM users');
    console.log("Users:", res.rows);
    
  } catch (error) {
    console.error("Error connecting to the database :", error);
  } finally {
    if (dbClient) {
      await dbClient.end(); // Close the database connection
    }
  }
};

run();
