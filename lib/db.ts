import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database.');
    client.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

// Function to upload a file to the database
export async function uploadFile(fileName: string, fileData: Buffer): Promise<string> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryText = 'INSERT INTO files(file_name, file_data) VALUES($1, $2) RETURNING id';
        const res = await client.query(queryText, [fileName, fileData]);
        await client.query('COMMIT');
        return res.rows[0].id;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Export the pool for use in other modules
export default pool;
