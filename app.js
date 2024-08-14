// This is test script for using db and sever by node.js
const express = require('express');
const { Pool } = require('pg'); // Import Pool from pg to connect to the database
const app = express();
const port = 3000;

// PostgreSQL database connection string
const DB_CONNECTION_STRING = 'postgresql://landing_page_user:simRtZ7no84aeF3kj88f@ccdatabasedev.cluster-c29v1welcmzq.us-east-1.rds.amazonaws.com:5432/ccdatabasedev';

// Create a pool of connections
const pool = new Pool({
    connectionString: DB_CONNECTION_STRING,
});

// Logging all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handler for POST requests to /submit-form
app.post('/submit-form', async (req, res) => {
    try {
        const formData = req.body;

        // Check for data presence
        if (!formData || Object.keys(formData).length === 0) {
            console.error('Error: Form data is required');
            return res.status(400).json({ success: false, message: 'Form data is required' });
        }

        // Log the data
        console.log('Received form data:', formData);

        // Insert data into the database
        const queryText = 'INSERT INTO landingpage.lead_form(form) VALUES($1) RETURNING *';
        const values = [formData];
        const result = await pool.query(queryText, values);

        console.log('Data successfully inserted into the database:', result.rows[0]);

        // Send a successful response
        res.status(200).json({ success: true, message: 'Form successfully submitted', data: result.rows[0] });
    } catch (error) {
        // Log the error
        console.error('Error processing request:', error);
        res.status(500).json({ success: false, message: 'Internal server error occurred' });
    }
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Page not found' });
});

// Global error handling
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ success: false, message: 'Internal server error occurred' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`);
});
