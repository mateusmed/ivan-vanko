function getChartBoilerplate(chartType) {
    switch (chartType) {
        case 'bar':
            return {
                labels: ['Electronics', 'Clothing', 'Books'],
                datasets: [{
                    label: 'Overall Sales',
                    data: [550, 350, 260],
                    backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)']
                }]
            };
        case 'pie':
            return {
                labels: ['Product A', 'Product B', 'Product C'],
                datasets: [{
                    label: 'Market Share',
                    data: [45, 30, 25],
                    backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(75, 192, 192, 0.6)']
                }]
            };
        case 'line':
            return {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
                datasets: [{
                    label: 'Monthly Sales',
                    data: [65, 59, 80, 81, 56],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };
        case 'doughnut':
            return {
                labels: ['Red', 'Blue', 'Yellow', 'Green'],
                datasets: [{
                    label: 'Dataset 1',
                    data: [300, 50, 100, 40],
                    backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)']
                }]
            };
        case 'radar':
            return {
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
                }]
            };
        case 'polarArea':
            return {
                labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
                datasets: [{
                    label: 'My Dataset',
                    data: [11, 16, 7, 3, 14],
                    backgroundColor: ['rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)', 'rgb(54, 162, 235)']
                }]
            };
        case 'bubble':
            return {
                datasets: [{
                    label: 'First Dataset',
                    data: [
                        { x: 20, y: 30, r: 15 },
                        { x: 40, y: 10, r: 10 },
                        { x: 30, y: 20, r: 20 }
                    ],
                    backgroundColor: 'rgb(255, 99, 132)'
                }]
            };
        case 'scatter':
            return {
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
                }]
            };
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