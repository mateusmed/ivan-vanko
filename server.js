const express = require('express');
const path = require('path');
const chartService = require('./services/chart.service.js');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



// --- API Endpoints for Chart Data ---

app.get('/api/chart-boilerplate/:chartType', (req, res) => {
    const chartType = req.params.chartType;
    console.log(`[SERVER] Received request for boilerplate of type: ${chartType}`);
    const boilerplate = chartService.getChartBoilerplate(chartType);
    console.log(`[SERVER] Returning boilerplate for ${chartType}`);
    setTimeout(() => {
        res.json(boilerplate);
    }, 2000);
});

app.get('/api/sales-data', (req, res) => {
    setTimeout(() => {
        res.json([
            { Region: 'North', Category: 'Electronics', Sales: 150 },
            { Region: 'North', Category: 'Clothing', Sales: 80 },
            { Region: 'South', Category: 'Electronics', Sales: 120 },
            { Region: 'South', Category: 'Clothing', Sales: 90 },
            { Region: 'East', Category: 'Electronics', Sales: 200 },
            { Region: 'East', Category: 'Clothing', Sales: 110 },
            { Region: 'West', Category: 'Electronics', Sales: 180 },
            { Region: 'West', Category: 'Clothing', Sales: 70 },
            { Region: 'North', Category: 'Books', Sales: 50 },
            { Region: 'South', Category: 'Books', Sales: 60 },
            { Region: 'East', Category: 'Books', Sales: 70 },
            { Region: 'West', Category: 'Books', Sales: 80 },
        ]);
    }, 5000);
});

app.get('/api/random-bar-chart', (req, res) => {
    const randomData = () => Math.floor(Math.random() * 1000);
    const randomColor = () => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`;

    const data = {
        labels: ['Electronics', 'Clothing', 'Books'],
        datasets: [{
            label: 'Random Sales',
            data: [randomData(), randomData(), randomData()],
            backgroundColor: [randomColor(), randomColor(), randomColor()]
        }]
    };

    res.json(data);
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});