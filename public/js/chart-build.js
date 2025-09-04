export const charts = {};
export const pollingConfig = {};

export function createOrUpdateChart(elementId, type, data, options) {
    console.log(`[CLIENT] Creating or updating chart ${elementId}`);

    // // Ensure options and plugins objects exist
    // options = options || {};
    // options.plugins = options.plugins || {};
    //
    // // Forcefully disable the title
    // options.plugins.title = { display: false };

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

    const chartParent = chartContainer.parentElement;
    const existingFiltersContainer = chartParent.querySelector('.chart-filters');

    if (data.filters && data.filters.length > 0) {
        let filtersContainer = existingFiltersContainer;
        if (!filtersContainer) {
            filtersContainer = document.createElement('div');
            filtersContainer.className = 'chart-filters';
            chartParent.insertBefore(filtersContainer, chartContainer);
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
            console.log(`[CLIENT] Setting select for key: ${filter.key}, value: ${filter.selected}`);
            filtersContainer.appendChild(select);

            select.addEventListener('change', (event) => {
                const queryParams = new URLSearchParams();
                chartParent.querySelectorAll('.chart-filters select').forEach(s => {
                    queryParams.append(s.dataset.key, s.value);
                });
                const chart = charts[elementId];
                const chartType = chart.config.type;
                const baseUrl = chart.config.options.customUrl || `/api/chart-boilerplate/${chartType}`;
                const newUrl = `${baseUrl}?${queryParams.toString()}`;

                console.log("chart.config.customUrl", chart.config);
                console.log("========>>>", newUrl);
                fetchChartData(elementId, newUrl, chartType, options);
            });
        });
    } else if (existingFiltersContainer) {
        existingFiltersContainer.remove();
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

export function fetchChartData(elementId, url, type, options) {
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
