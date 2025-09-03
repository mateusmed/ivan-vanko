import { charts, pollingConfig, createOrUpdateChart, fetchChartData } from './chart-build.js';

let currentDashboardName = null;


function setupChartSettingsForItem(item, grid) {
    console.log('[CLIENT] Setting up chart settings for item:', item);
    const content = item.querySelector('.grid-stack-item-content');
    let h3 = content.querySelector('h3');

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
        h3 = header.querySelector('h3'); // Get the new h3 inside the header

        // Make chart title editable on click
        h3.addEventListener('click', (event) => {
            event.stopPropagation();
            const currentText = h3.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'chart-title-input';

            h3.replaceWith(input);
            input.focus();

            const updateTitle = () => {
                const newTitle = input.value.trim();
                if (newTitle) {
                    h3.textContent = newTitle;
                    const chartId = item.querySelector('canvas').id;
                    const node = item.gridstackNode; // Get the GridStack node
                    if (node) {
                        node.chartTitle = newTitle; // Update the node's chartTitle
                    }
                    if (charts[chartId]) {
                        charts[chartId].options.plugins.title.text = newTitle;
                        charts[chartId].update();
                    }
                } else {
                    h3.textContent = currentText; // Revert if empty
                }
                input.replaceWith(h3);
            };

            input.addEventListener('blur', updateTitle);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    updateTitle();
                }
            });
        });

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
                node.static = false; // Update the node's static property
                event.currentTarget.textContent = 'Fix';
            } else {
                grid.movable(gridItem, false);
                grid.resizable(gridItem, false);
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
        chartUrl: initialUrl, // Initial URL, will be updated on configure
        chartTitle: chartTitle // Store the initial chart title
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
    const poolingSecondsInput = document.getElementById('pooling-seconds');

    const chartElement = document.getElementById(chartId);
    const gridItem = chartElement.closest('.grid-stack-item');
    const node = gridItem.gridstackNode;

    const currentUrl = node.chartUrl || `/api/chart-boilerplate/${node.chartType}`;
    const currentPooling = node.poolingSeconds || '60';

    poolingSecondsInput.value = currentPooling;
    curlCommand.value = `curl -X GET ${currentUrl}`;

    const fetchUrl = currentUrl.startsWith('http') ? currentUrl : window.location.origin + currentUrl;

    fetch(fetchUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            jsonStructure.textContent = JSON.stringify(data, null, 2);
        })
        .catch(err => {
            console.error("Error fetching chart data for modal:", err);
            jsonStructure.textContent = 'Error loading chart data.';
        })
        .finally(() => {
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
        const newCurlCommand = curlCommand.value;
        const newPoolingSeconds = poolingSecondsInput.value;

        const urlRegex = /(https?:\/\/[^\s]+|\/[^\s]+)/;
        const match = urlRegex.exec(newCurlCommand);
        
        if (!match) {
            alert("Invalid cURL command. Could not extract URL.");
            return;
        }
        let newUrl = match[0];

        if (node) {
            node.chartUrl = newUrl;
            node.poolingSeconds = newPoolingSeconds;
        }

        if (pollingConfig[chartId]) {
            clearInterval(pollingConfig[chartId].intervalId);
        }

        const chart = charts[chartId];
        const options = chart ? chart.options : {};

        fetchChartData(chartId, newUrl, chart.config.type, options);

        if (newPoolingSeconds > 0) {
            pollingConfig[chartId] = {
                url: newUrl,
                interval: newPoolingSeconds * 1000,
                intervalId: setInterval(() => {
                    fetchChartData(chartId, newUrl, chart.config.type, options);
                }, newPoolingSeconds * 1000)
            };
        }

        console.log('[CLIENT] Updating chart with:', { newUrl, newPoolingSeconds });
        modal.style.display = 'none';
    }
}

export function initializeDashboard() {
    const grid = GridStack.init({
        float: true,
        cellHeight: 30,
        column: 12
    });

    // Check for dashboard name in URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const dashboardNameFromUrl = urlParams.get('name');
    currentDashboardName = dashboardNameFromUrl; // Store the loaded dashboard name

    if (dashboardNameFromUrl) {
        loadDashboard(dashboardNameFromUrl);
    }

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

    setupChartSettingsForGrid(grid);
    setupAddChartButton(grid);
    // populateDashboardsDropdown();

    // Function to load a dashboard from the backend
    async function loadDashboard(dashboardName) {
        console.log(`[CLIENT] Loading dashboard: ${dashboardName}`);
        try {
            const response = await fetch(`/api/dashboards/${dashboardName}`);
            if (response.ok) {
                const layout = await response.json();
                console.log('[CLIENT] Dashboard loaded:', layout);
                grid.removeAll(); // Clear existing widgets

                // Update the header title with the dashboard name
                const appTitleElement = document.getElementById('app-title');
                if (appTitleElement) {
                    appTitleElement.textContent = dashboardName;
                }

                // Convert the loaded layout to GridStack format
                const gridStackLayout = layout.map(chartConfig => {
                    const chartId = `loaded-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Generate a new unique ID
                    const loadedChartTitle = chartConfig.properties.title || `${chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)} Chart`;
                    return {
                        x: chartConfig.coordinates.x,
                        y: chartConfig.coordinates.y,
                        w: chartConfig.coordinates.w,
                        h: chartConfig.coordinates.h,
                        content: `
                            <h3>${loadedChartTitle}</h3>
                            <div class="chart-container">
                                <div class="loading-indicator">Loading...</div>
                                <canvas id="${chartId}"></canvas>
                            </div>
                        `,
                        chartId: chartId,
                        chartType: chartConfig.type,
                        chartUrl: chartConfig.properties.url,
                        poolingSeconds: chartConfig.properties.pooling,
                        chartTitle: loadedChartTitle, // Store the loaded chart title
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
                    const chartTitle = chartConfig.chartTitle; // Get the loaded chart title

                    // Define initial options for the chart (can be extended if options are saved)
                    const initialOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: false, // Show the Chart.js internal title
                                text: chartTitle // Use the loaded chart title
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

            } else {
                if (response.status === 404) {
                    if (dashboardName !== 'new-dashboard') {
                        const errorData = await response.json();
                        console.error('[CLIENT] Failed to load dashboard:', errorData.message);
                        alert('Failed to load dashboard: ' + errorData.message);
                    } else {
                        const appTitleElement = document.getElementById('app-title');
                        if (appTitleElement) {
                            appTitleElement.textContent = dashboardName;
                        }
                        currentDashboardName = dashboardName;
                        grid.removeAll();
                    }
                } else {
                    const errorData = await response.json();
                    console.error('[CLIENT] Failed to load dashboard:', errorData.message);
                    alert('Failed to load dashboard: ' + errorData.message);
                }
            }
        } catch (error) {
            console.error('[CLIENT] Error loading dashboard:', error);
            alert('Error loading dashboard: ' + error.message);
        }
    }

    async function getDashboardNames() {
        try {
            const response = await fetch('/api/dashboards');
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('[CLIENT] Error fetching dashboard list:', error);
            return [];
        }
    }

    // async function populateDashboardsDropdown() {
    //     const layoutsDropdown = document.getElementById('dashboard-options');
    //     if (!layoutsDropdown) return;
    //
    //     const existingDashboards = layoutsDropdown.querySelectorAll('[data-dashboard-name]');
    //     existingDashboards.forEach(item => item.remove());
    //
    //     try {
    //         const dashboardNames = await getDashboardNames();
    //         dashboardNames.forEach(name => {
    //             const a = document.createElement('a');
    //             a.href = `/pages/dashboards.html?name=${encodeURIComponent(name)}`;
    //             a.textContent = name;
    //             a.dataset.dashboardName = name;
    //             layoutsDropdown.appendChild(a);
    //         });
    //     } catch (error) {
    //         console.error('[CLIENT] Error populating dashboard list:', error);
    //     }
    // }



    // // Function to toggle dropdown visibility
    // function toggleDropdown(dropdownId) {
    //     const dropdown = document.getElementById(dropdownId);
    //     if (dropdown) {
    //         dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    //     }
    // }
    //
    // // Event listener for the Dashboards dropdown button
    // const dashboardsDropbtn = document.querySelector('.dropdown .dropbtn[href="#layouts"]');
    // if (dashboardsDropbtn) {
    //     dashboardsDropbtn.addEventListener('click', (event) => {
    //         event.preventDefault();
    //         toggleDropdown('layouts-dropdown');
    //     });
    // }


    // Save Dashboard button logic
    const saveDashboardBtn = document.getElementById('save-dashboard-btn');
    if (saveDashboardBtn) {
        saveDashboardBtn.addEventListener('click', async (event) => {
            event.preventDefault();

            const dashboardName = prompt("Enter a name for your dashboard:", currentDashboardName || "");
            if (!dashboardName) {
                alert("Dashboard name cannot be empty. Save cancelled.");
                return;
            }

            const dashboardConfig = grid.save();

            const serializableCharts = dashboardConfig.map(widget => {
                if (widget.chartType && widget.chartUrl) {
                    return {
                        type: widget.chartType,
                        fixed: !!widget.static,
                        coordinates: {
                            x: widget.x,
                            y: widget.y,
                            w: widget.w,
                            h: widget.h
                        },
                        properties: {
                            url: widget.chartUrl,
                            pooling: widget.poolingSeconds ? String(widget.poolingSeconds) : "60",
                            title: widget.chartTitle
                        }
                    };
                }
                return null;
            }).filter(item => item !== null);

            const payload = {
                newName: dashboardName,
                layout: serializableCharts
            };

            if (currentDashboardName && currentDashboardName !== dashboardName) {
                payload.lastName = currentDashboardName;
            }

            console.log('[CLIENT] Saving dashboard with payload:', payload);

            try {
                const response = await fetch('/dashboard', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('[CLIENT] Dashboard saved successfully:', result.message);
                    alert('Dashboard configuration saved successfully!');
                    window.location.href = `/pages/dashboards.html?name=${encodeURIComponent(dashboardName)}`;
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

    // Remove Dashboard button logic
    const removeDashboardBtn = document.getElementById('remove-dashboard-btn');
    if (removeDashboardBtn) {
        removeDashboardBtn.addEventListener('click', async (event) => {
            event.preventDefault();

            if (!currentDashboardName) {
                alert("No dashboard loaded to remove.");
                return;
            }

            if (confirm(`Are you sure you want to remove dashboard "${currentDashboardName}"?`)) {
                try {
                    const response = await fetch(`/api/dashboards/${encodeURIComponent(currentDashboardName)}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('[CLIENT] Dashboard removed successfully:', result.message);
                        alert('Dashboard removed successfully!');
                        window.location.href = '/pages/dashboards.html'; // Redirect to a clean dashboard page
                    } else {
                        const errorData = await response.json();
                        console.error('[CLIENT] Failed to remove dashboard:', errorData.message);
                        alert('Failed to remove dashboard: ' + errorData.message);
                    }
                } catch (error) {
                    console.error('[CLIENT] Error removing dashboard:', error);
                    alert('Error removing dashboard: ' + error.message);
                }
            }
        });
    }

    //
    // // Load Dashboard Layout logic (for mocked layout1)
    // const loadLayout1Btn = document.getElementById('load-layout-1');
    // if (loadLayout1Btn) {
    //     loadLayout1Btn.addEventListener('click', async (event) => {
    //         event.preventDefault();
    //         const layoutName = event.target.dataset.layoutName;
    //         // This now calls the generic loadDashboard function
    //         loadDashboard(layoutName);
    //     });
    // }

    // // Close dropdowns when clicking outside
    // window.addEventListener('click', (event) => {
    //     if (!event.target.matches('.chart-settings-btn')) {
    //         document.querySelectorAll('.chart-settings-dropdown').forEach(dropdown => {
    //             dropdown.style.display = 'none';
    //         });
    //     }
    // })
}