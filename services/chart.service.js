function getChartBoilerplate(chartType, queryParams) {
    switch (chartType) {
        case 'bar':
            const barChart = {
              "labels": ["Electronics", "Clothing", "Books"],
              "datasets": [
                {
                  "label": "Overall Sales",
                  "data": [550, 350, 260],
                  "backgroundColor": [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)"
                  ]
                },
                {
                  "label": "Online Sales",
                  "data": [300, 200, 150],
                  "backgroundColor": [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)"
                  ]
                }
              ],
              "filters": [
                {
                  "type": "selectItem",
                  "label": "Region",
                  "key": "region",
                  "options": ["All", "North", "South", "East", "West"],
                  "selected": "All"
                },
                {
                  "type": "selectItem",
                  "label": "Year",
                  "key": "year",
                  "options": ["All", "2023", "2024", "2025"],
                  "selected": "All"
                }
              ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                barChart.datasets[0].data = [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000];
                barChart.datasets[1].data = [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000];
                barChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return barChart;
        case 'pie':
            const pieChart = {
                labels: ['Product A', 'Product B', 'Product C'],
                datasets: [{
                    label: 'Market Share',
                    data: [45, 30, 25],
                    backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(75, 192, 192, 0.6)']
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Country",
                        "key": "country",
                        "options": ["All", "USA", "Canada", "Mexico"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                pieChart.datasets[0].data = [Math.random() * 100, Math.random() * 100, Math.random() * 100];
                pieChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return pieChart;
        case 'line':
            const lineChart = {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
                datasets: [{
                    label: 'Monthly Sales',
                    data: [65, 59, 80, 81, 56],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Monthly Revenue',
                    data: [45, 49, 60, 71, 46],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Store",
                        "key": "store",
                        "options": ["All", "Store A", "Store B"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                lineChart.datasets[0].data = [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];
                lineChart.datasets[1].data = [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];
                lineChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return lineChart;
        case 'doughnut':
            const doughnutChart = {
                labels: ['Red', 'Blue', 'Yellow', 'Green'],
                datasets: [{
                    label: 'Dataset 1',
                    data: [300, 50, 100, 40],
                    backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)']
                },
                {
                    label: 'Dataset 2',
                    data: [100, 150, 200, 80],
                    backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 205, 86, 0.5)', 'rgba(75, 192, 192, 0.5)']
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Department",
                        "key": "department",
                        "options": ["All", "Sales", "Marketing", "Engineering"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                doughnutChart.datasets[0].data = [Math.random() * 400, Math.random() * 400, Math.random() * 400, Math.random() * 400];
                doughnutChart.datasets[1].data = [Math.random() * 400, Math.random() * 400, Math.random() * 400, Math.random() * 400];
                doughnutChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return doughnutChart;
        case 'radar':
            const radarChart = {
                labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
                datasets: [{
                    label: 'My First Dataset',
                    data: [65, 59, 90, 81, 56, 55, 40],
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)'
                },
                {
                    label: 'My Second Dataset',
                    data: [28, 48, 40, 19, 96, 27, 100],
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)'
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Employee",
                        "key": "employee",
                        "options": ["All", "Alice", "Bob"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                radarChart.datasets[0].data = [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];
                radarChart.datasets[1].data = [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];
                radarChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return radarChart;
        case 'polarArea':
            const polarAreaChart = {
                labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
                datasets: [{
                    label: 'My Dataset',
                    data: [11, 16, 7, 3, 14],
                    backgroundColor: ['rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)', 'rgb(54, 162, 235)']
                },
                {
                    label: 'My Second Dataset',
                    data: [5, 10, 15, 2, 8],
                    backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 205, 86, 0.5)', 'rgba(201, 203, 207, 0.5)', 'rgba(54, 162, 235, 0.5)']
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Category",
                        "key": "category",
                        "options": ["All", "A", "B", "C"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                polarAreaChart.datasets[0].data = [Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20];
                polarAreaChart.datasets[1].data = [Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20, Math.random() * 20];
                polarAreaChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return polarAreaChart;
        case 'bubble':
            const bubbleChart = {
                datasets: [{
                    label: 'First Dataset',
                    data: [
                        { x: 20, y: 30, r: 15 },
                        { x: 40, y: 10, r: 10 },
                        { x: 30, y: 20, r: 20 }
                    ],
                    backgroundColor: 'rgb(255, 99, 132)'
                },
                {
                    label: 'Second Dataset',
                    data: [
                        { x: 10, y: 25, r: 10 },
                        { x: 35, y: 15, r: 15 },
                        { x: 25, y: 25, r: 25 }
                    ],
                    backgroundColor: 'rgb(54, 162, 235)'
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Factor",
                        "key": "factor",
                        "options": ["All", "X", "Y", "Z"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                bubbleChart.datasets[0].data = [
                    { x: Math.random() * 50, y: Math.random() * 50, r: Math.random() * 20 },
                    { x: Math.random() * 50, y: Math.random() * 50, r: Math.random() * 20 },
                    { x: Math.random() * 50, y: Math.random() * 50, r: Math.random() * 20 }
                ];
                bubbleChart.datasets[1].data = [
                    { x: Math.random() * 50, y: Math.random() * 50, r: Math.random() * 20 },
                    { x: Math.random() * 50, y: Math.random() * 50, r: Math.random() * 20 },
                    { x: Math.random() * 50, y: Math.random() * 50, r: Math.random() * 20 }
                ];
                bubbleChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return bubbleChart;
        case 'scatter':
            const scatterChart = {
                datasets: [{
                    label: 'Scatter Dataset',
                    data: [
                        { x: 1, y: 1 },
                        { x: 2, y: 3 },
                        { x: 3, y: 2 },
                        { x: 4, y: 4 },
                        { x: 5, y: 3 },
                    ],
                    backgroundColor: 'rgb(255, 99, 132)'
                },
                {
                    label: 'Scatter Dataset 2',
                    data: [
                        { x: 1.5, y: 2 },
                        { x: 2.5, y: 4 },
                        { x: 3.5, y: 3 },
                        { x: 4.5, y: 5 },
                        { x: 5.5, y: 4 },
                    ],
                    backgroundColor: 'rgb(54, 162, 235)'
                }],
                filters: [
                    {
                        "type": "selectItem",
                        "label": "Group",
                        "key": "group",
                        "options": ["All", "Group 1", "Group 2"],
                        "selected": "All"
                    }
                ]
            };
            if (queryParams && Object.keys(queryParams).length > 0) {
                scatterChart.datasets[0].data = [
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                ];
                scatterChart.datasets[1].data = [
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                    { x: Math.random() * 6, y: Math.random() * 6 },
                ];
                scatterChart.filters.forEach(filter => {
                    if (queryParams[filter.key]) {
                        filter.selected = queryParams[filter.key];
                    }
                });
            }
            return scatterChart;
        default:
            return {
                labels: ['Sample', 'Sample', 'Sample'],
                datasets: [{
                    label: 'Sample Data',
                    data: [10, 20, 30],
                    backgroundColor: 'rgba(100, 100, 100, 0.6)'
                }]
            };
    }
}

module.exports = {
    getChartBoilerplate
};