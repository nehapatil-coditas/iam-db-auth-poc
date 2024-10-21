import express from 'express';
import cors from 'cors'; // Import CORS
import connectToDatabase from './db.js';

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

app.get('/test-db', async (req, res) => {
    let dbClient;
    try {
        console.time('Database Connection Time');
        dbClient = await connectToDatabase();
        console.timeEnd('Database Connection Time');

        console.time('Query Execution Time');
        const dbResponse = await dbClient.query('SELECT * FROM users');
        console.timeEnd('Query Execution Time');

        res.json({ success: true, data: dbResponse.rows });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (dbClient) {
            await dbClient.end();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
