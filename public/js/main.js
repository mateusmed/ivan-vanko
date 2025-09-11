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
    if (window.location.pathname.endsWith('/dashboards.html') || window.location.pathname.endsWith('/pages/dashboards.html')) {
        import('./dashboard.js').then(({ initializeDashboard }) => {
            initializeDashboard();
        }).catch(error => {
            console.error('Error loading dashboard.js:', error);
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

    populateLayoutsDropdown();
    populateDashboardsDropdown();
    initializeAboutModal();
});

function initializeAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    const aboutLink = document.getElementById('aboutLink');
    const closeBtn = aboutModal.querySelector('.close-btn');

    if (aboutLink) {
        aboutLink.addEventListener('click', (event) => {
            event.preventDefault();
            aboutModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
}

async function populateLayoutsDropdown() {
    const layoutsDropdown = document.getElementById('layout-options');
    if (!layoutsDropdown) return;

    try {
        const response = await fetch('/api/layouts-examples');
        if (response.ok) {
            const layoutNames = await response.json();
            // Clear existing dynamic layouts (if any, though none expected initially)
            layoutsDropdown.innerHTML = ''; 
            layoutNames.forEach(name => {
                const a = document.createElement('a');
                a.href = `/pages/dashboards.html?name=${encodeURIComponent(name)}`;
                a.textContent = name;
                layoutsDropdown.appendChild(a);
            });
        } else {
            console.error('[CLIENT] Failed to fetch example layout list.');
        }
    } catch (error) {
        console.error('[CLIENT] Error fetching example layout list:', error);
    }
}



async function populateDashboardsDropdown() {
    const dashboardDropdown = document.getElementById('dashboard-options');
    if (!dashboardDropdown) return;

    try {
        const response = await fetch('/api/dashboards');
        if (response.ok) {
            const dashboardNames = await response.json();
            // Clear existing dynamic layouts (if any, though none expected initially)
            dashboardDropdown.innerHTML = '<a href="/pages/dashboards.html">Novo Dashboard</a>';

            dashboardNames.forEach(name => {
                const a = document.createElement('a');
                a.href = `/pages/dashboards.html?name=${encodeURIComponent(name)}`;
                a.textContent = name;
                dashboardDropdown.appendChild(a);
            });
        } else {
            console.error('[CLIENT] Failed to fetch example layout list.');
        }
    } catch (error) {
        console.error('[CLIENT] Error fetching example layout list:', error);
    }
}



// Example of a function that might remain in script.js if it's used globally
// function someGlobalFunction() {
//     console.log('This is a global function.');
// }