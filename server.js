const express = require('express');
const path = require('path');
const chartService = require('./services/chart.service.js');
const fs = require('fs');
const fsPromises = require('fs/promises');
const app = express();
const port = 3000;

// Use environment variable for DATA path in production, with a fallback for local development.
const dataDir = process.env.DATA_PATH || path.join(__dirname, 'data');

// Ensure the data directory exists.
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`[SERVER] Created data directory at ${dataDir}`);
}

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
    const layoutsDir = path.join(dataDir, 'layouts-examples');
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
    let filePath = path.join(dataDir, `${dashboardName}.json`);

    try {
        let data = await fsPromises.readFile(filePath, 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        // If not found in data directory, try layouts-examples directory
        filePath = path.join(dataDir, 'layouts-examples', `${dashboardName}.json`);
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
    const dashboardNameFromQuery = req.query.name;
    let { newName, lastName, layout } = req.body;
    let config = req.body;

    const finalNewName = newName || dashboardNameFromQuery;

    if (!finalNewName) {
        return res.status(400).json({ message: 'Dashboard name is required.' });
    }

    if (layout) { // New format from our modified client
        config = layout;
    }

    if (lastName && finalNewName !== lastName) {
        const oldFilePath = path.join(dataDir, `${lastName}.json`);
        try {
            await fsPromises.unlink(oldFilePath);
            console.log(`[SERVER] Deleted old dashboard file for rename: ${oldFilePath}`);
        } catch (error) {
            // If the file doesn't exist, that's fine. But if another error occurs, it's a problem.
            if (error.code !== 'ENOENT') {
                console.error(`[SERVER ERROR] Could not delete old dashboard file '${oldFilePath}' during rename:`, error);
                // Return a specific error to the client
                return res.status(500).json({ message: `Failed to remove old dashboard '${lastName}' during rename.`, error: error.message });
            }
        }
    }

    const newFilePath = path.join(dataDir, `${finalNewName}.json`);

    try {
        await fsPromises.mkdir(path.dirname(newFilePath), { recursive: true });
        await fsPromises.writeFile(newFilePath, JSON.stringify(config, null, 2));
        console.log('[SERVER] Dashboard configuration saved to:', newFilePath);
        res.status(200).json({ message: 'Dashboard configuration saved successfully!' });
    } catch (error) {
        console.error('[SERVER ERROR] Failed to save dashboard configuration:', error);
        res.status(500).json({ message: 'Failed to save dashboard configuration', error: error.message });
    }
});

// Endpoint to delete a dashboard by name
app.delete('/api/dashboards/:name', async (req, res) => {
    const dashboardName = req.params.name;
    const filePath = path.join(dataDir, `${dashboardName}.json`);

    try {
        await fsPromises.unlink(filePath);
        console.log(`[SERVER] Dashboard "${dashboardName}" deleted successfully.`);
        res.status(200).json({ message: `Dashboard "${dashboardName}" deleted successfully.` });
    } catch (error) {
        console.error(`[SERVER ERROR] Failed to delete dashboard "${dashboardName}":`, error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: `Dashboard "${dashboardName}" not found.` });
        } else {
            res.status(500).json({ message: `Failed to delete dashboard "${dashboardName}"`, error: error.message });
        }
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