const charts = {};
const pollingConfig = {};

function createOrUpdateChart(elementId, type, data, options) {
    console.log(`[CLIENT] Creating or updating chart ${elementId}`);
    const canvas = document.getElementById(elementId);
    if (!canvas) {
        console.error(`[CLIENT] Canvas element not found for ${elementId}`);
        return;
    }
    const chartContainer = canvas.parentElement;
    const loadingIndicator = chartContainer.querySelector('.loading-indicator');
    if (loadingIndicator) {
        console.log(`[CLIENT] Hiding loading indicator for ${elementId}`);
        loadingIndicator.style.display = 'none';
    } else {
        console.log(`[CLIENT] Loading indicator not found for ${elementId}`);
    }

    if (data.filters) {
        let filtersContainer = chartContainer.querySelector('.chart-filters');
        if (!filtersContainer) {
            filtersContainer = document.createElement('div');
            filtersContainer.className = 'chart-filters';
            chartContainer.insertBefore(filtersContainer, canvas);
        }
        filtersContainer.innerHTML = '';

        data.filters.forEach(filter => {
            const select = document.createElement('select');
            select.dataset.key = filter.key;
            filter.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.text = option;
                select.appendChild(opt);
            });
            select.value = filter.selected;
            filtersContainer.appendChild(select);

            select.addEventListener('change', () => {
                const queryParams = new URLSearchParams();
                chartContainer.querySelectorAll('.chart-filters select').forEach(s => {
                    queryParams.append(s.dataset.key, s.value);
                });
                const newUrl = `/api/chart-boilerplate/${type}?${queryParams.toString()}`;
                fetchChartData(elementId, newUrl, type, options);
            });
        });
    }

    const ctx = canvas.getContext('2d');
    if (charts[elementId]) {
        // Update existing chart
        charts[elementId].data.labels = data.labels;
        charts[elementId].data.datasets = data.datasets;
        // Merge options if necessary, or reassign if a full replacement is desired
        
        charts[elementId].update();
    } else {
        // Create new chart
        charts[elementId] = new Chart(ctx, { type, data, options });
        charts[elementId].config.customUrl = options.customUrl;
        charts[elementId].config.pollingSeconds = options.pollingSeconds;
        charts[elementId].config.type = type;
        charts[elementId].options = options;
    }
    console.log(`[CLIENT] Chart ${elementId} created successfully`);
}

function fetchChartData(elementId, url, type, options) {
    console.log(`[CLIENT] Fetching data for ${elementId} from ${url}`);
    fetch(url)
        .then(response => {
            console.log(`[CLIENT] Received response for ${elementId}`, response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`[CLIENT] Received data for ${elementId}`, data);
            createOrUpdateChart(elementId, type, data, options);
        })
        .catch(error => {
            console.error(`[CLIENT] Error fetching data for ${elementId}:`, error);
            const chartContainer = document.getElementById(elementId)?.parentElement;
            if (chartContainer) {
                const loadingIndicator = chartContainer.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.textContent = 'Error!';
                }
            }
        });
}

function setupChartSettingsForItem(item, grid) {
    console.log('[CLIENT] Setting up chart settings for item:', item);
    const content = item.querySelector('.grid-stack-item-content');
    const h3 = content.querySelector('h3');
    if (h3 && !content.querySelector('.chart-header')) { // Check if header already exists
        const header = document.createElement('div');
        header.className = 'chart-header';

        const settings = document.createElement('div');
        settings.className = 'chart-settings';
        settings.innerHTML = `
            <button class="chart-settings-btn">...</button>
            <div class="chart-settings-dropdown">
                <a href="#" class="toggle-fix-chart-btn">Fix</a>
                <a href="#" class="configure-chart-btn">Configure</a>
                <a href="#" class="remove-chart-btn">Remove</a>
            </div>
        `;

        header.appendChild(h3.cloneNode(true));
        header.appendChild(settings);
        content.insertBefore(header, h3);
        content.removeChild(h3);

        const settingsBtn = header.querySelector('.chart-settings-btn');
        settingsBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdown = event.currentTarget.nextElementSibling;
            // Close other dropdowns
            document.querySelectorAll('.chart-settings-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.style.display = 'none';
                }
            });
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        const toggleFixBtn = header.querySelector('.toggle-fix-chart-btn');
        toggleFixBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const gridItem = event.currentTarget.closest('.grid-stack-item');
            const node = gridItem.gridstackNode; // Get the GridStack node
            const isStatic = node.static; // Check the static property on the node

            if (isStatic) {
                grid.movable(gridItem, true);
                grid.resizable(gridItem, true);
                // gridItem.removeAttribute('gs-static'); // GridStack handles this
                node.static = false; // Update the node's static property
                event.currentTarget.textContent = 'Fix';
            } else {
                grid.movable(gridItem, false);
                grid.resizable(gridItem, false);
                // gridItem.setAttribute('gs-static', 'true'); // GridStack handles this
                node.static = true; // Update the node's static property
                event.currentTarget.textContent = 'Unfix';
            }

            const dropdown = event.currentTarget.closest('.chart-settings-dropdown');
            dropdown.style.display = 'none';
        });

        const configureBtn = header.querySelector('.configure-chart-btn');
        configureBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const chartId = event.currentTarget.closest('.grid-stack-item').querySelector('canvas').id;
            openConfigureModal(chartId);
            const dropdown = event.currentTarget.closest('.chart-settings-dropdown');
            dropdown.style.display = 'none';
        });

        const removeBtn = header.querySelector('.remove-chart-btn');
        removeBtn.addEventListener('click', (event) => {
            console.log('[CLIENT] Remove button clicked');
            event.preventDefault();
            event.stopPropagation();
            const gridItem = event.currentTarget.closest('.grid-stack-item');
            const chartId = gridItem.querySelector('canvas').id;
            
            if (charts[chartId]) {
                charts[chartId].destroy();
                delete charts[chartId];
            }

            if (pollingConfig[chartId]) {
                clearInterval(pollingConfig[chartId].intervalId);
                delete pollingConfig[chartId];
            }
            
            grid.removeWidget(gridItem);
            grid.compact();
        });
    }
}

function setupChartSettingsForGrid(grid) {
    document.querySelectorAll('.grid-stack-item').forEach(item => {
        setupChartSettingsForItem(item, grid);
    });
}

function setupAddChartButton(grid) {
    const addChartBtn = document.getElementById('add-chart-btn');
    const addChartDropdown = document.getElementById('add-chart-dropdown');

    addChartBtn.addEventListener('click', (event) => {
        event.preventDefault();
        addChartDropdown.style.display = addChartDropdown.style.display === 'block' ? 'none' : 'block';
    });

    addChartDropdown.addEventListener('click', (event) => {
        if (event.target.matches('[data-chart-type]')) {
            event.preventDefault();
            const chartType = event.target.getAttribute('data-chart-type');
            addNewChart(grid, chartType);
            // Close the main dropdown
            addChartDropdown.style.display = 'none';
        }
    });
}

let newChartCounter = 0;
function addNewChart(grid, chartType) {
    const chartId = `new-chart-${newChartCounter}`;
    const chartTitle = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart ${newChartCounter}`;
    const initialUrl = `/api/chart-boilerplate/${chartType}`;

    const widgetCount = grid.engine.nodes.length;
    const x = (widgetCount % 2) * 6;
    const y = Math.floor(widgetCount / 2) * 13;
    newChartCounter++;

    const newItem = {
        x: x,
        y: y,
        w: 6,
        h: 13,
        content: `
            <h3>${chartTitle}</h3>
            <div class="chart-container">
                <div class="loading-indicator">Loading...</div>
                <canvas id="${chartId}"></canvas>
            </div>
        `,
        // Custom attributes to be saved with the widget
        chartId: chartId,
        chartType: chartType,
        chartUrl: initialUrl // Initial URL, will be updated on configure
    };

    const newWidget = grid.addWidget(newItem);
    setupChartSettingsForItem(newWidget, grid);

    const sampleOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: chartTitle
            }
        }
    };

    fetchChartData(chartId, initialUrl, chartType, sampleOptions);
}

function openConfigureModal(chartId) {
    const modal = document.getElementById('configure-modal');
    const jsonStructure = document.getElementById('json-structure');
    const curlCommand = document.getElementById('curl-command');
    const chartType = charts[chartId].config.type;

    fetch(`/api/chart-boilerplate/${chartType}`)
        .then(response => response.json())
        .then(data => {
            jsonStructure.textContent = JSON.stringify(data, null, 2);
            curlCommand.value = `curl -X GET ${window.location.origin}/api/chart-boilerplate/${chartType}`;
            modal.style.display = 'block';
        });

    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    const updateBtn = modal.querySelector('#update-chart-btn');
    updateBtn.onclick = function() {
        const curlCommand = document.getElementById('curl-command').value;
        const urlRegex = /\s(https?:\/\/[^\s]+)/;
        let newUrl = urlRegex.exec(curlCommand)[1];
        const poolingSeconds = document.getElementById('pooling-seconds').value;
        
        // Ensure newUrl includes the origin if it's a relative path
        if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            newUrl = window.location.origin + newUrl;
        }

        if (pollingConfig[chartId]) {
            clearInterval(pollingConfig[chartId].intervalId);
        }

        pollingConfig[chartId] = {
            url: newUrl,
            interval: poolingSeconds * 1000,
            intervalId: setInterval(() => {
                fetchChartData(chartId, newUrl, charts[chartId].config.type, charts[chartId].options);
            }, poolingSeconds * 1000)
        };

        // Update the chartUrl property of the GridStack item
        const gridItem = document.getElementById(chartId).closest('.grid-stack-item');
        if (gridItem) {
            const node = grid.engine.nodes.find(n => n.id === gridItem.gridstackNode.id);
            if (node) {
                node.chartUrl = newUrl;
                node.poolingSeconds = poolingSeconds; // Also save pooling seconds to the node
            }
        }

        console.log('[CLIENT] Updating chart with:', { newUrl, poolingSeconds });
        modal.style.display = 'none';
    }
}

export function initializeDashboard() {
    const grid = GridStack.init({
        float: true,
        cellHeight: 30,
        column: 12
    });

    grid.on('resizestop', function(event, el) {
        const chartId = el.querySelector('canvas').id;
        if (charts[chartId]) {
            charts[chartId].resize();
            charts[chartId].update();
        }
    });

    grid.on('dragstop', function(event, el) {
        const chartId = el.querySelector('canvas').id;
        if (charts[chartId]) {
            charts[chartId].resize();
            charts[chartId].update();
        }
    });

    // The setupFilterableChart function is not directly related to GridStack or dashboard management,
    // so it can remain in script.js or be moved to a more general utility file if needed.
    // For now, I'll leave it out of dashboard.js as it's a specific chart example.

    setupChartSettingsForGrid(grid);
    setupAddChartButton(grid);

    // Function to load a dashboard from the backend
    async function loadDashboard(dashboardName) {
        console.log(`[CLIENT] Loading dashboard: ${dashboardName}`);
        try {
            const response = await fetch(`/api/dashboards/${dashboardName}`);
            if (response.ok) {
                const layout = await response.json();
                console.log('[CLIENT] Dashboard loaded:', layout);
                grid.removeAll(); // Clear existing widgets

                // Convert the loaded layout to GridStack format
                const gridStackLayout = layout.map(chartConfig => {
                    const chartId = `loaded-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Generate a new unique ID
                    return {
                        x: chartConfig.coordinates.x,
                        y: chartConfig.coordinates.y,
                        w: chartConfig.coordinates.w,
                        h: chartConfig.coordinates.h,
                        content: `
                            <h3>${chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)} Chart</h3>
                            <div class="chart-container">
                                <div class="loading-indicator">Loading...</div>
                                <canvas id="${chartId}"></canvas>
                            </div>
                        `,
                        chartId: chartId,
                        chartType: chartConfig.type,
                        chartUrl: chartConfig.properties.url,
                        poolingSeconds: chartConfig.properties.pooling,
                        static: chartConfig.fixed // Set the static property for GridStack
                    };
                });

                grid.load(gridStackLayout, true); // Load the new layout
                
                // Re-setup chart settings and fetch data for newly loaded items
                gridStackLayout.forEach(chartConfig => {
                    const item = document.getElementById(chartConfig.chartId).closest('.grid-stack-item');
                    setupChartSettingsForItem(item, grid); // Setup settings UI

                    const chartId = chartConfig.chartId;
                    const chartType = chartConfig.chartType;
                    const chartUrl = chartConfig.chartUrl;
                    const poolingSeconds = chartConfig.poolingSeconds;

                    // Define initial options for the chart (can be extended if options are saved)
                    const initialOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
                            }
                        }
                    };

                    // Initialize charts[chartId] with a dummy Chart.js instance or just options
                    // This ensures createOrUpdateChart has a base to work with
                    if (!charts[chartId]) {
                        const canvas = document.getElementById(chartId);
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            charts[chartId] = new Chart(ctx, { type: chartType, data: {}, options: initialOptions });
                            charts[chartId].config.type = chartType;
                            charts[chartId].options = initialOptions;
                        }
                    }

                    // Re-initialize polling config
                    if (pollingConfig[chartId]) {
                        clearInterval(pollingConfig[chartId].intervalId);
                    }
                    pollingConfig[chartId] = {
                        url: chartUrl,
                        interval: poolingSeconds * 1000,
                        intervalId: setInterval(() => {
                            fetchChartData(chartId, chartUrl, chartType, charts[chartId]?.options || initialOptions);
                        }, poolingSeconds * 1000)
                    };
                    fetchChartData(chartId, chartUrl, chartType, charts[chartId]?.options || initialOptions);
                });

                alert(`Dashboard "${dashboardName}" loaded successfully!`);
            } else {
                const errorData = await response.json();
                console.error('[CLIENT] Failed to load dashboard:', errorData.message);
                alert('Failed to load dashboard: ' + errorData.message);
            }
        } catch (error) {
            console.error('[CLIENT] Error loading dashboard:', error);
            alert('Error loading dashboard: ' + error.message);
        }
    }

    // Function to populate the Dashboards dropdown
    async function populateDashboardsDropdown() {
        const layoutsDropdown = document.getElementById('layouts-dropdown');
        if (!layoutsDropdown) return;

        // Clear existing dynamic dashboards (keep "Novo Dashboard")
        const existingDashboards = layoutsDropdown.querySelectorAll('[data-dashboard-name]');
        existingDashboards.forEach(item => item.remove());

        try {
            const response = await fetch('/api/dashboards');
            if (response.ok) {
                const dashboardNames = await response.json();
                dashboardNames.forEach(name => {
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = name;
                    a.dataset.dashboardName = name; // Store the name for loading
                    a.addEventListener('click', (event) => {
                        event.preventDefault();
                        loadDashboard(name);
                    });
                    layoutsDropdown.appendChild(a);
                });
            } else {
                console.error('[CLIENT] Failed to fetch dashboard list.');
            }
        } catch (error) {
            console.error('[CLIENT] Error fetching dashboard list:', error);
        }
    }

    // Initial population of the dropdown
    populateDashboardsDropdown();

    // Save Dashboard button logic
    const saveDashboardBtn = document.getElementById('save-dashboard-btn');
    if (saveDashboardBtn) {
        saveDashboardBtn.addEventListener('click', async (event) => {
            event.preventDefault();

            const dashboardName = prompt("Enter a name for your dashboard:");
            if (!dashboardName) {
                alert("Dashboard name cannot be empty. Save cancelled.");
                return;
            }

            const dashboardConfig = grid.save(); // Get the current grid layout (includes custom properties)
            
            const serializableCharts = dashboardConfig.map(widget => {
                // Only process widgets that have chart-specific data
                if (widget.chartType && widget.chartUrl) {
                    return {
                        type: widget.chartType,
                        fixed: !!widget.static, // GridStack uses 'static' for fixed items
                        coordinates: {
                            x: widget.x,
                            y: widget.y,
                            w: widget.w,
                            h: widget.h
                        },
                        properties: {
                            url: widget.chartUrl,
                            pooling: widget.poolingSeconds ? String(widget.poolingSeconds) : "60" // Default to "60" if not set
                        }
                    };
                }
                return null; // Filter out non-chart widgets
            }).filter(item => item !== null); // Remove null entries

            console.log('[CLIENT] Saving serializable dashboard config:', serializableCharts);

            try {
                const response = await fetch(`/dashboard?name=${encodeURIComponent(dashboardName)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(serializableCharts)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('[CLIENT] Dashboard saved successfully:', result.message);
                    alert('Dashboard saved successfully!');
                    populateDashboardsDropdown(); // Refresh the list after saving
                } else {
                    const errorData = await response.json();
                    console.error('[CLIENT] Failed to save dashboard:', errorData.message);
                    alert('Failed to save dashboard: ' + errorData.message);
                }
            } catch (error) {
                console.error('[CLIENT] Error saving dashboard:', error);
                alert('Error saving dashboard: ' + error.message);
            }
        });
    }

    // Load Dashboard Layout logic (for mocked layout1)
    const loadLayout1Btn = document.getElementById('load-layout-1');
    if (loadLayout1Btn) {
        loadLayout1Btn.addEventListener('click', async (event) => {
            event.preventDefault();
            const layoutName = event.target.dataset.layoutName;
            // This now calls the generic loadDashboard function
            loadDashboard(layoutName);
        });
    }

    // Close dropdowns when clicking outside
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.chart-settings-btn')) {
            document.querySelectorAll('.chart-settings-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
}