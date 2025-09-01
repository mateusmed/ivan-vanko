const express = require('express');
const path = require('path');
const chartService = require('./services/chart.service.js');
const fs = require('fs');
const fsPromises = require('fs/promises');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/chart-boilerplate/:chartType', (req, res) => {
    const chartType = req.params.chartType;
    console.log(`[SERVER] Received request for boilerplate of type: ${chartType}`);
    const boilerplate = chartService.getChartBoilerplate(chartType, req.query);
    console.log(`[SERVER] Returning boilerplate for ${chartType}`);
    setTimeout(() => {
        res.json(boilerplate);
    }, 2000);
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

// Endpoint to list example layouts
app.get('/api/layouts-examples', async (req, res) => {
    const layoutsDir = path.join(__dirname, 'data', 'layouts-examples');
    try {
        await fsPromises.mkdir(layoutsDir, { recursive: true }); // Ensure directory exists
        const files = await fsPromises.readdir(layoutsDir);
        const layoutNames = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        res.status(200).json(layoutNames);
    } catch (error) {
        console.error('[SERVER ERROR] Failed to list example layouts:', error);
        res.status(500).json({ message: 'Failed to list example layouts', error: error.message });
    }
});

// Endpoint to get a specific dashboard by name
app.get('/api/dashboards/:name', async (req, res) => {
    const dashboardName = req.params.name;
    
    // Try to load from data directory first
    let filePath = path.join(__dirname, 'data', `${dashboardName}.json`);

    try {
        let data = await fsPromises.readFile(filePath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        // If not found in data directory, try layouts-examples directory
        filePath = path.join(__dirname, 'data', 'layouts-examples', `${dashboardName}.json`);
        try {
            let data = await fsPromises.readFile(filePath, 'utf8');
            res.status(200).json(JSON.parse(data));
        } catch (layoutError) {
            console.error(`[SERVER ERROR] Failed to load dashboard "${dashboardName}" from both data and layouts-examples:`, error, layoutError);
            res.status(404).json({ message: `Dashboard or example layout "${dashboardName}" not found`, error: error.message });
        }
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