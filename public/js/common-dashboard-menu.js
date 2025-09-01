
// Function to toggle dropdown visibility
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
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
                a.href = `/pages/dashboards.html?name=${encodeURIComponent(name)}`;
                a.textContent = name;
                a.dataset.dashboardName = name; // Store the name for loading
                a.addEventListener('click', (event) => {
                    // For index.html, we just navigate to the dashboard page with the query param
                    // The dashboards.html page will handle loading the specific dashboard
                });
                layoutsDropdown.appendChild(a);
            });
        } else {
            console.error('[CLIENT] Failed to fetch dashboard list for index.html.');
        }
    } catch (error) {
        console.error('[CLIENT] Error fetching dashboard list for index.html:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Event listener for the Dashboards dropdown button
    const dashboardsDropbtn = document.querySelector('.dropdown .dropbtn[href="#layouts"]');
    if (dashboardsDropbtn) {
        dashboardsDropbtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleDropdown('layouts-dropdown');
        });
    }

    // Initial population of the dropdown
    populateDashboardsDropdown();

    // Close dropdowns when clicking outside
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.dropbtn')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
});
