const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Your Google Sheets CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1n2ixGKjtYRaYepZ5JTGY2apoe6GfrnbzvC-Umir4-u8/export?format=csv&gid=1946378280';

// Serve the frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch the CSV data
app.get('/api/scores', async (req, res) => {
    try {
        // Append a timestamp to ensure we bypass Google's cache
        const response = await fetch(`${SHEET_URL}&t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        const scores = getScores(data);
        res.json(scores);
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        res.status(500).send('Failed to fetch data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

function getScores(csvText) {
    // Split into rows and remove the header row
    const rows = csvText.trim().split('\n').slice(1); 
    const scores = [];

    rows.forEach(row => {
        // Handle basic CSV splitting (assuming no commas inside the answers)
        const cols = row.split(','); 
        if (cols.length > 1) {
            // Google Forms puts the Timestamp in column 0, and the first question in column 1
            const score = parseInt(cols[1].match(/-?\d+/)?.[0] || 0, 10);
            if (!isNaN(score)) {
                scores.push(score);
            }
        }
    });

    return scores;
}