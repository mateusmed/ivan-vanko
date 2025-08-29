const express = require('express');
const path = require('path');
const chartService = require('./services/chart.service.js');
const fs = require('fs');
const fsPromises = require('fs/promises');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



// --- API Endpoints for Chart Data ---

app.get('/api/chart-boilerplate/:chartType', (req, res) => {
    const chartType = req.params.chartType;
    console.log(`[SERVER] Received request for boilerplate of type: ${chartType}`);
    const boilerplate = chartService.getChartBoilerplate(chartType, req.query);
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

// Endpoint to get mocked layout 1
app.get('/api/layouts/layout1', (req, res) => {
    const mockedLayout = [
        { x: 0, y: 0, w: 6, h: 13, content: '<h3>Mock Chart 1</h3><div class="chart-container"><canvas id="mock-chart-1"></canvas></div>' },
        { x: 6, y: 0, w: 6, h: 13, content: '<h3>Mock Chart 2</h3><div class="chart-container"><canvas id="mock-chart-2"></canvas></div>' }
    ];
    res.json(mockedLayout);
});

// Endpoint to list saved dashboards
app.get('/api/dashboards', async (req, res) => {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fsPromises.mkdir(dataDir, { recursive: true }); // Ensure directory exists
        const files = await fsPromises.readdir(dataDir);
        const dashboardNames = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        res.status(200).json(dashboardNames);
    } catch (error) {
        console.error('[SERVER ERROR] Failed to list dashboards:', error);
        res.status(500).json({ message: 'Failed to list dashboards', error: error.message });
    }
});

// Endpoint to get a specific dashboard by name
app.get('/api/dashboards/:name', async (req, res) => {
    const dashboardName = req.params.name;
    const filePath = path.join(__dirname, 'data', `${dashboardName}.json`);

    try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        console.error(`[SERVER ERROR] Failed to load dashboard "${dashboardName}":`, error);
        res.status(404).json({ message: `Dashboard "${dashboardName}" not found`, error: error.message });
    }
});

// Endpoint to save dashboard configuration
app.post('/dashboard', async (req, res) => {
    const config = req.body;
    const dashboardName = req.query.name;

    if (!dashboardName) {
        return res.status(400).json({ message: 'Dashboard name is required.' });
    }

    const filePath = path.join(__dirname, 'data', `${dashboardName}.json`);

    try {
        // Ensure the data directory exists
        await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        await fsPromises.writeFile(filePath, JSON.stringify(config, null, 2));
        console.log('[SERVER] Dashboard configuration saved to:', filePath);
        res.status(200).json({ message: 'Dashboard configuration saved successfully!' });
    } catch (error) {
        console.error('[SERVER ERROR] Failed to save dashboard configuration:', error);
        res.status(500).json({ message: 'Failed to save dashboard configuration', error: error.message });
    }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});