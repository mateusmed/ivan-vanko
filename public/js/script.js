// This script will contain general functionalities not specific to the dashboard grid.
// For example, global event listeners or functions used across multiple pages.

// Close dropdowns when clicking outside (this is a general UI concern)
document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.chart-settings-btn')) {
            document.querySelectorAll('.chart-settings-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });

    // Initialize dashboard-specific logic only on dashboard.html
    if (window.location.pathname.endsWith('/dashboard.html')) {
        import('./dashboard.js').then(({ initializeDashboard }) => {
            initializeDashboard();
        }).catch(error => {
            console.error('Error loading dashboard.js:', error);
        });
    }
});

// Example of a function that might remain in script.js if it's used globally
// function someGlobalFunction() {
//     console.log('This is a global function.');
// }