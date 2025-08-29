const layouts = {
    "main_dashboard": [
        { x: 0, y: 0, w: 12, h: 13, content: `<h3>Bar Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-1"></canvas></div>`, chartType: 'bar' },
        { x: 0, y: 13, w: 6, h: 13, content: `<h3>Pie Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-2"></canvas></div>`, chartType: 'pie' },
        { x: 6, y: 13, w: 6, h: 13, content: `<h3>Line Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-3"></canvas></div>`, chartType: 'line' }
    ],
    "sales_focus": [
        { x: 0, y: 0, w: 8, h: 26, content: `<h3>Line Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-1"></canvas></div>`, chartType: 'line' },
        { x: 8, y: 0, w: 4, h: 13, content: `<h3>Pie Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-2"></canvas></div>`, chartType: 'pie' },
        { x: 8, y: 13, w: 4, h: 13, content: `<h3>Doughnut Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-3"></canvas></div>`, chartType: 'doughnut' }
    ],
    "data_exploration": [
        { x: 0, y: 0, w: 6, h: 13, content: `<h3>Scatter Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-1"></canvas></div>`, chartType: 'scatter' },
        { x: 6, y: 0, w: 6, h: 13, content: `<h3>Bubble Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-2"></canvas></div>`, chartType: 'bubble' },
        { x: 0, y: 13, w: 6, h: 13, content: `<h3>Radar Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-3"></canvas></div>`, chartType: 'radar' },
        { x: 6, y: 13, w: 6, h: 13, content: `<h3>Polar Area Chart</h3><div class="chart-container"><div class="loading-indicator">Loading...</div><canvas id="chart-4"></canvas></div>`, chartType: 'polarArea' }
    ]
};