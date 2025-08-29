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

document.addEventListener('DOMContentLoaded', function () {

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

    function setupFilterableChart() {
        const regionFilter = document.getElementById('regionFilter3');
        const categoryFilter = document.getElementById('categoryFilter3');
        let allSalesData = [];

        fetch('/api/sales-data')
            .then(response => response.json())
            .then(data => {
                allSalesData = data;
                const regions = ['All', ...new Set(allSalesData.map(d => d.Region))].sort();
                const categories = ['All', ...new Set(allSalesData.map(d => d.Category))].sort();

                regions.forEach(region => {
                    const option = document.createElement('option');
                    option.value = region;
                    option.textContent = region;
                    regionFilter.appendChild(option);
                });
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categoryFilter.appendChild(option);
                });

                updateFilteredChart();
            });

        function updateFilteredChart() {
            const selectedRegion = regionFilter.value;
            const selectedCategory = categoryFilter.value;

            const filteredData = allSalesData.filter(d =>
                (selectedRegion === 'All' || d.Region === selectedRegion) &&
                (selectedCategory === 'All' || d.Category === selectedCategory)
            );

            const aggregatedSales = {};
            filteredData.forEach(item => {
                aggregatedSales[item.Category] = (aggregatedSales[item.Category] || 0) + item.Sales;
            });

            const chartData = {
                labels: Object.keys(aggregatedSales),
                datasets: [{
                    label: 'Sales',
                    data: Object.values(aggregatedSales),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }]
            };
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Sales in ${selectedRegion} for ${selectedCategory}`
                    }
                }
            };
            createOrUpdateChart('filteredChart3', 'bar', chartData, chartOptions);
        }

        regionFilter.addEventListener('change', updateFilteredChart);
        categoryFilter.addEventListener('change', updateFilteredChart);
    }

    setupChartSettingsForGrid(grid);
    setupAddChartButton(grid);

    // Close dropdowns when clicking outside
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.chart-settings-btn')) {
            document.querySelectorAll('.chart-settings-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
});

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
            const isStatic = gridItem.getAttribute('gs-static') === 'true';

            if (isStatic) {
                grid.movable(gridItem, true);
                grid.resizable(gridItem, true);
                gridItem.removeAttribute('gs-static');
                event.currentTarget.textContent = 'Fix';
            } else {
                grid.movable(gridItem, false);
                grid.resizable(gridItem, false);
                gridItem.setAttribute('gs-static', 'true');
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
        `
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

    fetchChartData(chartId, `/api/chart-boilerplate/${chartType}`, chartType, sampleOptions);
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
        const newUrl = urlRegex.exec(curlCommand)[1];
        const poolingSeconds = document.getElementById('pooling-seconds').value;
        
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

        console.log('[CLIENT] Updating chart with:', { newUrl, poolingSeconds });
        modal.style.display = 'none';
    }
}