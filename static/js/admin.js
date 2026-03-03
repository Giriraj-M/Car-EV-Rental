// ===== Admin Dashboard Specific JavaScript =====

// Auto-refresh data every 30 seconds (simulated)
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        // In a real application, this would fetch new data from the server
        console.log('Auto-refreshing data...');
        simulateDataUpdate();
    }, 30000);
}

// Resize charts when section becomes visible
function resizeChartsInSection(sectionId) {
    // Get all Chart.js instances and resize
    if (typeof Chart !== 'undefined' && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => {
            if (chart && chart.canvas) {
                chart.resize();
            }
        });
    }
    
    // Special handling for charging section
    if (sectionId === 'charging') {
        if (typeof window.updateChargingAnalysisChart === 'function') {
            window.updateChargingAnalysisChart();
        }
        // Initialize charging analytics charts
        setTimeout(function() {
            if (typeof window.initEnergyConsumptionChart === 'function') {
                window.initEnergyConsumptionChart();
            }
            if (typeof window.initChargingSessionsChart === 'function') {
                window.initChargingSessionsChart();
            }
        }, 100);
    }
    
    // Special handling for maintenance section
    if (sectionId === 'maintenance') {
        setTimeout(function() {
            if (typeof window.initMaintenanceTrendChart === 'function') {
                window.initMaintenanceTrendChart();
            }
            if (typeof window.initMaintenanceDistChart === 'function') {
                window.initMaintenanceDistChart();
            }
            if (typeof window.initMaintenanceSessionsChart === 'function') {
                window.initMaintenanceSessionsChart();
            }
        }, 100);
    }
    
    // Special handling for costs section - ensure charts are initialized
    if (sectionId === 'costs') {
        console.log('Costs section activated, reinitializing charts...');
        // Always reinitialize charts when section becomes visible for proper sizing
        setTimeout(function() {
            // Get current cost type from button or default to maintenance
            var currentType = 'maintenance';
            var activeBtn = document.querySelector('.ctb.active');
            if (activeBtn && activeBtn.dataset && activeBtn.dataset.type) {
                currentType = activeBtn.dataset.type;
            } else if (typeof window.currentCostType !== 'undefined') {
                currentType = window.currentCostType;
            }
            
            // Use switchCostType to properly initialize charts with current type
            if (typeof window.switchCostType === 'function') {
                window.switchCostType(currentType);
                console.log('Initialized costs charts with type:', currentType);
            }
        }, 50);
    }
}

// ===== Sidebar Navigation =====
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar menu navigation
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            if (section) {
                // Update active menu item
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section
                document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
                const targetSection = document.getElementById(section);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // Update page title and breadcrumb
                const titles = {
                    'overview': 'Dashboard Overview',
                    'drivers': 'All Drivers',
                    'fleet': 'Fleet Status',
                    'charging': 'Charging Analytics',
                    'maintenance': 'Maintenance Analytics',
                    'revenue': 'Revenue Analytics',
                    'costs': 'Cost Analysis',
                    'speed': 'Speed Monitoring'
                };
                
                document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
                document.getElementById('breadcrumbCurrent').textContent = titles[section]?.replace(' Analytics', '').replace(' Monitoring', '') || 'Overview';
                
                // Resize charts when section becomes visible
                resizeChartsInSection(section);
            }
        });
    });
    
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});

// ===== Driver Details Modal =====
function showDriverDetails(username) {
    const driver = driversData.find(d => d.username === username);
    if (!driver) return;
    
    const modal = document.getElementById('driverModal');
    const modalBody = document.getElementById('driverModalBody');
    
    modalBody.innerHTML = `
        <div class="driver-profile-header">
            <div class="dp-avatar ${driver.status}">
                <i class="fas fa-user"></i>
            </div>
            <h4>${driver.name}</h4>
            <span style="font-size: 11px; color: #6366f1; background: rgba(99, 102, 241, 0.2); padding: 3px 10px; border-radius: 6px; margin-bottom: 8px; display: inline-block;">${driver.unique_id}</span>
            <p>${driver.car_number} - ${driver.car_model}</p>
        </div>
        <div class="driver-profile-grid">
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-birthday-cake"></i> Age</span>
                <span class="dp-value">${driver.age} years</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-venus-mars"></i> Gender</span>
                <span class="dp-value">${driver.gender}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-phone"></i> Phone</span>
                <span class="dp-value">${driver.phone}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-envelope"></i> Email</span>
                <span class="dp-value">${driver.email}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-tint"></i> Blood Group</span>
                <span class="dp-value">${driver.blood_group}</span>
            </div>
            <div class="dp-item full">
                <span class="dp-label"><i class="fas fa-home"></i> Address</span>
                <span class="dp-value">${driver.address}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-id-card"></i> License Number</span>
                <span class="dp-value">${driver.license_number}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-calendar-plus"></i> Joining Date</span>
                <span class="dp-value">${driver.joining_date}</span>
            </div>
            <div class="dp-item full">
                <span class="dp-label"><i class="fas fa-phone-square-alt"></i> Emergency Contact</span>
                <span class="dp-value">${driver.emergency_contact}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-battery-half"></i> Battery</span>
                <span class="dp-value">${driver.battery_percentage}%</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-tachometer-alt"></i> Current Speed</span>
                <span class="dp-value" style="${driver.current_speed > speedLimit ? 'color: #f87171;' : ''}">${driver.current_speed} km/h</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-map-marker-alt"></i> Location</span>
                <span class="dp-value">${driver.location}</span>
            </div>
            <div class="dp-item">
                <span class="dp-label"><i class="fas fa-circle"></i> Status</span>
                <span class="dp-value" style="color: ${driver.status === 'running' ? '#4ade80' : '#fb923c'};">${driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}</span>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeDriverModal() {
    document.getElementById('driverModal').classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const driverModal = document.getElementById('driverModal');
    if (e.target === driverModal) {
        closeDriverModal();
    }
    
    const alertModal = document.getElementById('alertModal');
    if (e.target === alertModal) {
        closeModal();
    }
});

// ===== Fleet Filter =====
function filterFleet() {
    const filter = document.getElementById('statusFilter').value;
    const cards = document.querySelectorAll('.fleet-card');
    
    cards.forEach(card => {
        const status = card.dataset.status;
        if (filter === 'all' || status === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== Scroll to Section =====
function scrollToSection(sectionId) {
    // Update menu active state
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    menuItems.forEach(item => {
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show section
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Resize charts when section becomes visible
    resizeChartsInSection(sectionId);
    
    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'drivers': 'All Drivers',
        'fleet': 'Fleet Status',
        'charging': 'Charging Analytics',
        'revenue': 'Revenue Analytics',
        'costs': 'Cost Analysis',
        'speed': 'Speed Monitoring'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionId] || 'Dashboard';
    }
}

// ===== Charging View Toggle =====
function updateChargingView(period) {
    // Update active tab
    document.querySelectorAll('.cost-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.period === period);
    });
    
    // Update chart based on period
    if (window.chargingCostChart) {
        // This would update the chart data based on period
        console.log('Updating charging view to:', period);
    }
}

// Note: switchCostType is now defined in charts.js to properly update all charts
// This function was removed to avoid conflicts

// Simulate data updates (for demonstration)
function simulateDataUpdate() {
    // Randomly update battery percentages slightly
    driversData.forEach(driver => {
        if (driver.charging_status === 'charging') {
            driver.battery_percentage = Math.min(100, driver.battery_percentage + Math.random() * 2);
        } else if (driver.status === 'running') {
            driver.battery_percentage = Math.max(5, driver.battery_percentage - Math.random() * 0.5);
        }
        
        // Random speed changes for running vehicles
        if (driver.status === 'running') {
            driver.current_speed = Math.max(0, Math.min(130, driver.current_speed + (Math.random() - 0.5) * 10));
        }
    });
    
    // Update UI would happen here
    updateSpeedAlertBadge();
}

// Update speed alert badge
function updateSpeedAlertBadge() {
    const overSpeedCount = driversData.filter(d => d.current_speed > speedLimit).length;
    const badge = document.querySelector('.notification-badge');
    
    if (badge) {
        if (overSpeedCount > 0) {
            badge.textContent = overSpeedCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Export data to CSV
function exportToCSV(type) {
    let csvContent = '';
    let filename = '';
    
    if (type === 'revenue') {
        filename = 'revenue_report.csv';
        csvContent = 'Car Number,Driver Name,Model,' + monthsData.join(',') + ',Total\n';
        driversData.forEach(driver => {
            const total = driver.monthly_revenue.reduce((a, b) => a + b, 0);
            csvContent += `${driver.car_number},${driver.name},${driver.car_model},${driver.monthly_revenue.join(',')},${total}\n`;
        });
    } else if (type === 'maintenance') {
        filename = 'maintenance_cost_report.csv';
        csvContent = 'Car Number,Driver Name,' + monthsData.join(',') + ',Total\n';
        driversData.forEach(driver => {
            const total = driver.maintenance_cost_monthly.reduce((a, b) => a + b, 0);
            csvContent += `${driver.car_number},${driver.name},${driver.maintenance_cost_monthly.join(',')},${total}\n`;
        });
    } else if (type === 'charging') {
        filename = 'charging_cost_report.csv';
        csvContent = 'Car Number,Driver Name,' + monthsData.join(',') + ',Total\n';
        driversData.forEach(driver => {
            const total = driver.charging_cost_monthly.reduce((a, b) => a + b, 0);
            csvContent += `${driver.car_number},${driver.name},${driver.charging_cost_monthly.join(',')},${total}\n`;
        });
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Print specific section
function printSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>EV Taxi Fleet Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f5f5f5; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            ${section.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Search/Filter functionality
function initSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.vehicle-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press 'Escape' to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Press '1-6' to switch sections (when not in input)
    if (document.activeElement.tagName !== 'INPUT') {
        const sections = ['overview', 'fleet', 'charging', 'revenue', 'costs', 'speed'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
            scrollToSection(sections[num - 1]);
        }
    }
});

// Notification system
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            animation: slideIn 0.3s ease;
            cursor: pointer;
        `;
        
        let bgColor, icon;
        switch(type) {
            case 'success':
                bgColor = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                icon = 'check-circle';
                break;
            case 'error':
                bgColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                icon = 'exclamation-circle';
                break;
            case 'warning':
                bgColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                icon = 'exclamation-triangle';
                break;
            default:
                bgColor = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                icon = 'info-circle';
        }
        
        notification.style.background = bgColor;
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        notification.onclick = () => this.dismiss(notification);
        
        this.container.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => this.dismiss(notification), duration);
        }
        
        return notification;
    }
    
    dismiss(notification) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize notification manager
const notifications = new NotificationManager();

// Check for speed alerts on page load
document.addEventListener('DOMContentLoaded', function() {
    const overSpeedDrivers = driversData.filter(d => d.current_speed > speedLimit);
    
    if (overSpeedDrivers.length > 0) {
        setTimeout(() => {
            notifications.show(
                `⚠️ ${overSpeedDrivers.length} vehicle(s) exceeding speed limit!`,
                'warning',
                10000
            );
        }, 2000);
    }
    
    // Initialize auto-refresh
    // startAutoRefresh();
    
    // Initialize search
    initSearch();
});

// Real-time clock
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        clockElement.textContent = timeStr;
    }
}

setInterval(updateClock, 1000);

// Tooltip functionality
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: #1e293b;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
            
            this._tooltip = tooltip;
        });
        
        el.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
            }
        });
    });
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', initTooltips);

console.log('EV Taxi Admin Dashboard loaded successfully! 🚗⚡');

// ===== Revenue Table Sorting =====
function sortRevenueTable() {
    const table = document.getElementById('revenueTable');
    if (!table) return;
    
    const sortOrder = document.getElementById('revenueSortOrder').value;
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        // Get the last cell (Total column) and extract numeric value
        const aCells = a.cells;
        const bCells = b.cells;
        const aVal = parseFloat(aCells[aCells.length - 1].textContent.replace(/[₹,]/g, '')) || 0;
        const bVal = parseFloat(bCells[bCells.length - 1].textContent.replace(/[₹,]/g, '')) || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Clear and re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Make function globally available
window.sortRevenueTable = sortRevenueTable;

// ===== Charging Cost Table Sorting =====
function sortChargingCostTable() {
    const table = document.getElementById('chargingCostTable');
    if (!table) return;
    
    const sortOrder = document.getElementById('chargingCostSortOrder').value;
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        // Get the last cell (Total column) and extract numeric value
        const aCells = a.cells;
        const bCells = b.cells;
        const aVal = parseFloat(aCells[aCells.length - 1].textContent.replace(/[₹,]/g, '')) || 0;
        const bVal = parseFloat(bCells[bCells.length - 1].textContent.replace(/[₹,]/g, '')) || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Clear and re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Make function globally available
window.sortChargingCostTable = sortChargingCostTable;

// ===== Maintenance Table Sorting =====
function sortMaintenanceTable() {
    const table = document.getElementById('maintenanceTable');
    if (!table) return;
    
    const sortOrder = document.getElementById('maintenanceSortOrder').value;
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        // Get the last cell (Total column) and extract numeric value
        const aCells = a.cells;
        const bCells = b.cells;
        const aVal = parseFloat(aCells[aCells.length - 1].textContent.replace(/[₹,]/g, '')) || 0;
        const bVal = parseFloat(bCells[bCells.length - 1].textContent.replace(/[₹,]/g, '')) || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Clear and re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Make function globally available
window.sortMaintenanceTable = sortMaintenanceTable;
