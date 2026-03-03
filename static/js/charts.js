// ===== Chart.js Configurations and Initializations =====

// Chart.js global configuration
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = 'Inter, sans-serif';

// Register datalabels plugin globally
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

// Color palette
const chartColors = {
    primary: 'rgba(99, 102, 241, 0.8)',
    primaryLight: 'rgba(99, 102, 241, 0.2)',
    success: 'rgba(34, 197, 94, 0.8)',
    successLight: 'rgba(34, 197, 94, 0.2)',
    warning: 'rgba(245, 158, 11, 0.8)',
    warningLight: 'rgba(245, 158, 11, 0.2)',
    danger: 'rgba(239, 68, 68, 0.8)',
    dangerLight: 'rgba(239, 68, 68, 0.2)',
    purple: 'rgba(139, 92, 246, 0.8)',
    blue: 'rgba(59, 130, 246, 0.8)',
    pink: 'rgba(236, 72, 153, 0.8)',
    teal: 'rgba(20, 184, 166, 0.8)',
    orange: 'rgba(249, 115, 22, 0.8)',
    violet: 'rgba(168, 85, 247, 0.8)'
};

const driverColors = [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.danger,
    chartColors.purple,
    chartColors.blue,
    chartColors.pink,
    chartColors.teal,
    chartColors.orange,
    chartColors.violet
];

// Initialize all charts when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Give Chart.js a moment to fully initialize
    setTimeout(function() {
        initializeAllCharts();
    }, 100);
});

function initializeAllCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        return;
    }
    
    // Check if we have the required data before initializing charts
    if (typeof driversData !== 'undefined' && driversData && driversData.length > 0) {
        console.log('Initializing charts with', driversData.length, 'drivers');
        try {
            initFleetStatusChart();
            initBatteryLevelsChart();
            initRevenueChart();
            // Cost charts are initialized via switchCostType for consistency
            // Default to maintenance on page load
            switchCostType('maintenance');
            initSpeedChart();
            initEnergyConsumptionChart();
            initChargingSessionsChart();
            console.log('All admin charts initialized successfully');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    } else {
        console.log('Charts.js: driversData not available, skipping chart initialization');
    }
}

// Fleet Status Doughnut Chart
function initFleetStatusChart() {
    const ctx = document.getElementById('fleetStatusChart');
    if (!ctx) return;
    
    const running = driversData.filter(d => d.status === 'running').length;
    const garage = driversData.filter(d => d.status === 'garage').length;
    const charging = driversData.filter(d => d.charging_status === 'charging').length;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Running', 'In Garage', 'Charging'],
            datasets: [{
                data: [running, garage - charging, charging],
                backgroundColor: [
                    chartColors.success,
                    chartColors.warning,
                    chartColors.primary
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        return value > 0 ? value : '';
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Battery Levels Bar Chart
function initBatteryLevelsChart() {
    const ctx = document.getElementById('batteryLevelsChart');
    if (!ctx) return;
    
    const labels = driversData.map(d => d.car_number);
    const data = driversData.map(d => d.battery_percentage);
    const colors = data.map(val => {
        if (val > 60) return chartColors.success;
        if (val > 30) return chartColors.warning;
        return chartColors.danger;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Battery %',
                data: data,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'start',
                    offset: 4,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => value + '%'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        callback: value => value + '%'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Revenue Chart - Monthly by Vehicle
let revenueChart;
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Define more visible colors
    const revenueColors = [
        'rgba(59, 130, 246, 1)',    // Blue
        'rgba(34, 197, 94, 1)',     // Green
        'rgba(249, 115, 22, 1)',    // Orange
        'rgba(139, 92, 246, 1)',    // Purple
        'rgba(236, 72, 153, 1)',    // Pink
        'rgba(20, 184, 166, 1)',    // Teal
        'rgba(245, 158, 11, 1)',    // Amber
        'rgba(239, 68, 68, 1)',     // Red
        'rgba(99, 102, 241, 1)',    // Indigo
        'rgba(168, 85, 247, 1)'     // Violet
    ];
    
    const datasets = driversData.map((driver, index) => ({
        label: driver.car_number + ' - ' + driver.name + ' (' + driver.unique_id + ')',
        data: driver.monthly_revenue,
        borderColor: revenueColors[index % revenueColors.length],
        backgroundColor: revenueColors[index % revenueColors.length].replace('1)', '0.2)'),
        tension: 0.4,
        fill: false,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: revenueColors[index % revenueColors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2
    }));
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthsData,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        color: '#e2e8f0',
                        font: { size: 11, weight: '500' }
                    }
                },
                datalabels: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.15)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => '₹' + (value/1000).toFixed(0) + 'K'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Update Revenue Chart based on vehicle selection
function updateRevenueChart() {
    const select = document.getElementById('revenueVehicleSelect');
    const selectedValue = select.value;
    
    if (selectedValue === 'all') {
        // Show all vehicles
        revenueChart.data.datasets.forEach(ds => {
            ds.hidden = false;
        });
    } else {
        // Show only selected vehicle
        revenueChart.data.datasets.forEach(ds => {
            ds.hidden = !ds.label.includes(selectedValue);
        });
    }
    
    revenueChart.update();
}

// Charging Cost Chart - HANDLED IN TEMPLATE (admin_dashboard.html)
// The charging cost chart functions are defined in the template
// to ensure proper access to template data and avoid conflicts

// Cost Trend Chart - Use window for global access
window.costTrendChart = null;
window.costDistributionChart = null;
window.currentCostType = 'maintenance';

function initCostTrendChart() {
    const ctx = document.getElementById('costTrendChart');
    if (!ctx) {
        console.log('costTrendChart canvas not found');
        return;
    }
    
    // Destroy existing chart if any
    if (window.costTrendChart) {
        window.costTrendChart.destroy();
        window.costTrendChart = null;
    }
    
    // Check if data is available
    if (typeof driversData === 'undefined' || !driversData || driversData.length === 0) {
        console.log('driversData not available for cost trend chart');
        return;
    }
    
    // Calculate total monthly costs
    const monthlyMaintenanceTotals = monthsData.map((_, i) => 
        driversData.reduce((sum, d) => sum + ((d.maintenance_cost_monthly || [])[i] || 0), 0)
    );
    
    console.log('Creating costTrendChart with data:', monthlyMaintenanceTotals);
    
    window.costTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthsData,
            datasets: [{
                label: 'Total Maintenance Cost',
                data: monthlyMaintenanceTotals,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 10,
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: { padding: { top: 20 } },
            plugins: {
                legend: { display: false },
                title: { display: false },
                datalabels: {
                    color: 'rgba(239, 68, 68, 1)',
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    font: { weight: 'bold', size: 9 },
                    formatter: (value) => '₹' + (value/1000).toFixed(0) + 'K'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Cost (₹)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8', callback: value => '₹' + (value/1000).toFixed(0) + 'K' }
                },
                x: {
                    title: { display: true, text: 'Month', color: '#94a3b8' },
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function initCostDistributionChart() {
    const ctx = document.getElementById('costDistributionChart');
    if (!ctx) {
        console.log('costDistributionChart canvas not found');
        return;
    }
    
    // Destroy existing chart if any
    if (window.costDistributionChart) {
        window.costDistributionChart.destroy();
        window.costDistributionChart = null;
    }
    
    // Check if data is available
    if (typeof driversData === 'undefined' || !driversData || driversData.length === 0) {
        console.log('driversData not available for cost distribution chart');
        return;
    }
    
    const vehicleCosts = driversData.map(d => ({
        label: d.car_number,
        value: (d.maintenance_cost_monthly || []).reduce((a, b) => a + b, 0)
    }));
    
    console.log('Creating costDistributionChart with data:', vehicleCosts);
    
    window.costDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: vehicleCosts.map(v => v.label),
            datasets: [{
                data: vehicleCosts.map(v => v.value),
                backgroundColor: driverColors,
                borderWidth: 2,
                borderColor: '#1e293b',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#e2e8f0',
                        font: { size: 11 }
                    }
                },
                title: { display: false },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(value, ctx) {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = ((value / total) * 100).toFixed(0);
                        return pct > 5 ? pct + '%' : '';
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ₹' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Make init functions globally accessible
window.initCostTrendChart = initCostTrendChart;
window.initCostDistributionChart = initCostDistributionChart;

// Switch cost type (maintenance/charging/combined)
function switchCostType(type) {
    console.log('switchCostType called with type:', type);
    window.currentCostType = type;
    
    // Update button visuals immediately
    var maintenanceBtn = document.getElementById('maintenanceBtn');
    var chargingBtn = document.getElementById('chargingBtn');
    var combinedBtn = document.getElementById('combinedBtn');
    
    // Reset all buttons
    [maintenanceBtn, chargingBtn, combinedBtn].forEach(function(btn) {
        if (btn) {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = '#94a3b8';
            btn.classList.remove('active');
        }
    });
    
    // Style active button based on type
    if (type === 'maintenance' && maintenanceBtn) {
        maintenanceBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        maintenanceBtn.style.color = 'white';
        maintenanceBtn.classList.add('active');
    } else if (type === 'charging' && chargingBtn) {
        chargingBtn.style.background = 'linear-gradient(135deg, #00d9ff, #0ea5e9)';
        chargingBtn.style.color = 'white';
        chargingBtn.classList.add('active');
    } else if (type === 'combined' && combinedBtn) {
        combinedBtn.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
        combinedBtn.style.color = 'white';
        combinedBtn.classList.add('active');
    }
    
    // Update chart titles immediately
    var trendTitle = document.getElementById('costTrendTitle');
    var distTitle = document.getElementById('costDistTitle');
    
    if (type === 'maintenance') {
        if (trendTitle) trendTitle.innerHTML = '<i class="fas fa-chart-line"></i> Maintenance Cost Trend - Monthly';
        if (distTitle) distTitle.innerHTML = '<i class="fas fa-chart-pie"></i> Maintenance Cost Distribution by Vehicle';
    } else if (type === 'charging') {
        if (trendTitle) trendTitle.innerHTML = '<i class="fas fa-chart-line"></i> Charging Cost Trend - Monthly';
        if (distTitle) distTitle.innerHTML = '<i class="fas fa-chart-pie"></i> Charging Cost Distribution by Vehicle';
    } else {
        if (trendTitle) trendTitle.innerHTML = '<i class="fas fa-chart-line"></i> Combined Cost Trend - Monthly';
        if (distTitle) distTitle.innerHTML = '<i class="fas fa-chart-pie"></i> Combined Cost Distribution by Vehicle';
    }
    
    if (typeof driversData === 'undefined' || !driversData || driversData.length === 0) {
        console.log('driversData not available for switchCostType');
        return;
    }
    
    // Calculate data based on type
    var totalCosts = 0;
    var monthlyData = [];
    var vehicleCosts = [];
    var vehicleLabels = [];
    var chartLabel = '';
    var chartColor = '';
    var chartBgColor = '';
    
    if (type === 'maintenance') {
        driversData.forEach(function(d) {
            var sum = 0;
            var arr = d.maintenance_cost_monthly || [];
            for (var i = 0; i < arr.length; i++) {
                sum += arr[i] || 0;
            }
            totalCosts += sum;
            vehicleCosts.push(sum);
        });
        for (var i = 0; i < 12; i++) {
            var monthSum = 0;
            driversData.forEach(function(d) {
                var arr = d.maintenance_cost_monthly || [];
                monthSum += arr[i] || 0;
            });
            monthlyData.push(monthSum);
        }
        vehicleLabels = driversData.map(function(d) { return d.car_number; });
        chartLabel = 'Maintenance Cost';
        chartColor = 'rgba(239, 68, 68, 1)';
        chartBgColor = 'rgba(239, 68, 68, 0.3)';
    } else if (type === 'charging') {
        // Exclude vehicles with 'garage' status from charging calculations
        driversData.forEach(function(d) {
            if (d.status === 'garage') return; // Skip garage vehicles
            var sum = 0;
            var arr = d.charging_cost_monthly || [];
            for (var i = 0; i < arr.length; i++) {
                sum += arr[i] || 0;
            }
            totalCosts += sum;
            vehicleCosts.push(sum);
        });
        for (var i = 0; i < 12; i++) {
            var monthSum = 0;
            driversData.forEach(function(d) {
                if (d.status === 'garage') return; // Skip garage vehicles
                var arr = d.charging_cost_monthly || [];
                monthSum += arr[i] || 0;
            });
            monthlyData.push(monthSum);
        }
        // Filter vehicle labels for charging (exclude garage)
        vehicleLabels = driversData.filter(function(d) { return d.status !== 'garage'; }).map(function(d) { return d.car_number; });
        chartLabel = 'Charging Cost';
        chartColor = 'rgba(0, 217, 255, 1)';
        chartBgColor = 'rgba(0, 217, 255, 0.3)';
    } else {
        driversData.forEach(function(d) {
            var maintSum = 0;
            var chargeSum = 0;
            var maintArr = d.maintenance_cost_monthly || [];
            var chargeArr = d.charging_cost_monthly || [];
            for (var i = 0; i < maintArr.length; i++) {
                maintSum += maintArr[i] || 0;
            }
            for (var i = 0; i < chargeArr.length; i++) {
                chargeSum += chargeArr[i] || 0;
            }
            totalCosts += maintSum + chargeSum;
            vehicleCosts.push(maintSum + chargeSum);
        });
        for (var i = 0; i < 12; i++) {
            var monthSum = 0;
            driversData.forEach(function(d) {
                var maintArr = d.maintenance_cost_monthly || [];
                var chargeArr = d.charging_cost_monthly || [];
                monthSum += (maintArr[i] || 0) + (chargeArr[i] || 0);
            });
            monthlyData.push(monthSum);
        }
        vehicleLabels = driversData.map(function(d) { return d.car_number; });
        chartLabel = 'Combined Cost';
        chartColor = 'rgba(99, 102, 241, 1)';
        chartBgColor = 'rgba(99, 102, 241, 0.3)';
    }
    
    // Update summary cards immediately
    var dailyCostEl = document.getElementById('dailyCost');
    var monthlyCostEl = document.getElementById('monthlyCost');
    var yearlyCostEl = document.getElementById('yearlyCost');
    
    if (dailyCostEl) dailyCostEl.textContent = '₹' + Math.round(totalCosts / 365).toLocaleString();
    if (monthlyCostEl) monthlyCostEl.textContent = '₹' + Math.round(totalCosts / 12).toLocaleString();
    if (yearlyCostEl) yearlyCostEl.textContent = '₹' + totalCosts.toLocaleString();
    
    // Destroy existing charts and recreate with new data
    var trendCtx = document.getElementById('costTrendChart');
    var distCtx = document.getElementById('costDistributionChart');
    
    // Recreate Cost Trend Chart
    if (trendCtx) {
        if (window.costTrendChart) {
            window.costTrendChart.destroy();
            window.costTrendChart = null;
        }
        
        window.costTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: chartLabel,
                    data: monthlyData,
                    backgroundColor: chartBgColor,
                    borderColor: chartColor,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: chartColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                layout: { padding: { top: 20 } },
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    datalabels: { color: chartColor, anchor: 'end', align: 'top', offset: 4, font: { weight: 'bold', size: 9 }, formatter: function(v) { return '₹' + (v/1000).toFixed(0) + 'K'; } },
                    tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ₹' + ctx.parsed.y.toLocaleString(); } } }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Cost (₹)', color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', callback: function(v) { return '₹' + (v/1000).toFixed(0) + 'K'; } } },
                    x: { title: { display: true, text: 'Month', color: '#94a3b8' }, grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
    
    // Recreate Cost Distribution Chart
    if (distCtx) {
        if (window.costDistributionChart) {
            window.costDistributionChart.destroy();
            window.costDistributionChart = null;
        }
        
        window.costDistributionChart = new Chart(distCtx, {
            type: 'pie',
            data: {
                labels: vehicleLabels,
                datasets: [{
                    data: vehicleCosts,
                    backgroundColor: driverColors.slice(0, vehicleCosts.length),
                    borderWidth: 2,
                    borderColor: '#1e293b',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { position: 'right', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', color: '#e2e8f0', font: { size: 11 } } },
                    title: { display: false },
                    datalabels: { color: '#fff', font: { weight: 'bold', size: 10 }, formatter: function(value, ctx) { var total = ctx.dataset.data.reduce(function(a,b){return a+b;}, 0); var pct = ((value / total) * 100).toFixed(0); return pct > 5 ? pct + '%' : ''; } },
                    tooltip: { callbacks: { label: function(ctx) { var total = ctx.dataset.data.reduce(function(a,b){return a+b;}, 0); var pct = ((ctx.parsed / total) * 100).toFixed(1); return ctx.label + ': ₹' + ctx.parsed.toLocaleString() + ' (' + pct + '%)'; } } }
                }
            }
        });
    }
    
    // Sync the bottom chart (chargingCanvas) - update the type and refresh immediately
    if (typeof window.currentChargingType !== 'undefined') {
        window.currentChargingType = type;
    }
    if (typeof window.updateChargingAnalysisChart === 'function') {
        window.updateChargingAnalysisChart();
    }
    
    // Update the Cost Analysis section title
    var costAnalysisTitle = document.getElementById('costAnalysisTitle');
    if (costAnalysisTitle) {
        var icon = type === 'maintenance' ? 'fa-tools' : (type === 'charging' ? 'fa-bolt' : 'fa-layer-group');
        var label = type.charAt(0).toUpperCase() + type.slice(1);
        costAnalysisTitle.innerHTML = '<i class="fas ' + icon + '"></i> Fleet ' + label + ' Cost Analysis';
    }
    
    console.log('Cost type switched to:', type, '| Total:', totalCosts, '| Monthly data:', monthlyData);
}

// Make switchCostType globally available
window.switchCostType = switchCostType;

// Speed Chart - Horizontal bar
function initSpeedChart() {
    const ctx = document.getElementById('speedChart');
    if (!ctx) return;
    
    const sortedDrivers = [...driversData].sort((a, b) => b.current_speed - a.current_speed);
    const labels = sortedDrivers.map(d => d.car_number + ' - ' + d.name + ' (' + d.unique_id + ')');
    const data = sortedDrivers.map(d => d.current_speed);
    const colors = data.map(speed => {
        if (speed > speedLimit + 15) return chartColors.danger;
        if (speed > speedLimit) return chartColors.warning;
        return chartColors.success;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Speed (km/h)',
                data: data,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'start',
                    offset: 4,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => value > 0 ? value + ' km/h' : ''
                },
                annotation: {
                    annotations: {
                        speedLimit: {
                            type: 'line',
                            xMin: speedLimit,
                            xMax: speedLimit,
                            borderColor: 'rgba(239, 68, 68, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                enabled: true,
                                content: 'Speed Limit: ' + speedLimit + ' km/h',
                                position: 'start'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const speed = context.parsed.x;
                            let status = speed > speedLimit ? ' (OVER LIMIT!)' : ' (OK)';
                            return 'Speed: ' + speed + ' km/h' + status;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: Math.max(...data) + 20,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        callback: value => value + ' km/h'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        },
        plugins: [{
            id: 'speedLimitLine',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                const xAxis = chart.scales.x;
                const yAxis = chart.scales.y;
                
                const x = xAxis.getPixelForValue(speedLimit);
                
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, yAxis.top);
                ctx.lineTo(x, yAxis.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                
                // Draw rotated text along the speed limit line
                ctx.fillStyle = 'rgba(239, 68, 68, 1)';
                ctx.font = 'bold 11px Inter';
                const text = 'Speed Limit: ' + speedLimit + ' km/h';
                
                // Rotate and draw text vertically along the line
                ctx.translate(x + 15, yAxis.top + (yAxis.bottom - yAxis.top) / 2);
                ctx.rotate(Math.PI / 2);
                ctx.textAlign = 'center';
                ctx.fillText(text, 0, 0);
                ctx.restore();
            }
        }]
    });
}
// Energy Consumption Chart - Area chart showing monthly kWh consumption
function initEnergyConsumptionChart() {
    const ctx = document.getElementById('energyConsumptionChart');
    if (!ctx) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sum energy consumption for all drivers per month
    const monthlyEnergy = [];
    for (let i = 0; i < 12; i++) {
        let total = 0;
        driversData.forEach(d => {
            if (d.energy_consumed_monthly && d.energy_consumed_monthly[i]) {
                total += d.energy_consumed_monthly[i];
            } else {
                total += Math.round(200 + Math.random() * 200);
            }
        });
        monthlyEnergy.push(total);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Energy Consumed (kWh)',
                data: monthlyEnergy,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 25 }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#22c55e',
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => value.toLocaleString()
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' kWh';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy (kWh)',
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => value.toLocaleString() + ' kWh'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Charging Sessions Chart - Bar chart showing monthly charging sessions
function initChargingSessionsChart() {
    const ctx = document.getElementById('chargingSessionsChart');
    if (!ctx) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sum charging sessions for all drivers per month
    const monthlySessions = [];
    for (let i = 0; i < 12; i++) {
        let total = 0;
        driversData.forEach(d => {
            if (d.charging_sessions_monthly && d.charging_sessions_monthly[i]) {
                total += d.charging_sessions_monthly[i];
            } else {
                total += Math.round(15 + Math.random() * 15);
            }
        });
        monthlySessions.push(total);
    }
    
    const barColors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(192, 132, 252, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(244, 114, 182, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(250, 176, 5, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(59, 130, 246, 0.8)'
    ];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Charging Sessions',
                data: monthlySessions,
                backgroundColor: barColors,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'start',
                    offset: 4,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => value
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' sessions';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sessions',
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Make chart functions globally available for section switching
window.initEnergyConsumptionChart = initEnergyConsumptionChart;
window.initChargingSessionsChart = initChargingSessionsChart;

// Maintenance Trend Chart - Line chart showing monthly maintenance costs
function initMaintenanceTrendChart() {
    const ctx = document.getElementById('maintenanceTrendChart');
    if (!ctx) return;
    
    // Destroy existing chart if exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sum maintenance costs for all drivers per month
    const monthlyMaintenance = [];
    for (let i = 0; i < 12; i++) {
        let total = 0;
        driversData.forEach(d => {
            if (d.maintenance_cost_monthly && d.maintenance_cost_monthly[i]) {
                total += d.maintenance_cost_monthly[i];
            } else {
                total += Math.round(150 + Math.random() * 200);
            }
        });
        monthlyMaintenance.push(total);
    }
    
    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Maintenance Cost (₹)',
                data: monthlyMaintenance,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 25 }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#ef4444',
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => '₹' + value.toLocaleString()
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cost (₹)',
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => '₹' + value.toLocaleString()
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Maintenance Distribution Chart - Doughnut chart showing cost by vehicle
function initMaintenanceDistChart() {
    const ctx = document.getElementById('maintenanceDistChart');
    if (!ctx) return;
    
    // Destroy existing chart if exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Get maintenance costs per vehicle
    const vehicleLabels = [];
    const vehicleCosts = [];
    
    driversData.forEach(d => {
        vehicleLabels.push(d.car_number);
        let total = 0;
        if (d.maintenance_cost_monthly) {
            total = d.maintenance_cost_monthly.reduce((sum, val) => sum + val, 0);
        } else {
            total = Math.round(1800 + Math.random() * 1200);
        }
        vehicleCosts.push(total);
    });
    
    const colors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(132, 204, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)'
    ];
    
    ctx.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: vehicleLabels,
            datasets: [{
                data: vehicleCosts,
                backgroundColor: colors,
                borderColor: 'rgba(13, 19, 33, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#e2e8f0',
                        font: { size: 11 },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(0);
                        return percentage + '%';
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return context.label + ': ₹' + value.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Make maintenance chart functions globally available
window.initMaintenanceTrendChart = initMaintenanceTrendChart;
window.initMaintenanceDistChart = initMaintenanceDistChart;

// Maintenance Sessions Chart - Bar chart showing monthly maintenance sessions
function initMaintenanceSessionsChart() {
    const ctx = document.getElementById('maintenanceSessionsChart');
    if (!ctx) return;
    
    // Destroy existing chart if exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate maintenance sessions for all drivers per month
    const monthlySessions = [];
    for (let i = 0; i < 12; i++) {
        let total = 0;
        driversData.forEach(d => {
            // Each vehicle has 1-3 maintenance sessions per month
            total += Math.round(1 + Math.random() * 2);
        });
        monthlySessions.push(total);
    }
    
    const barColors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(132, 204, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
    ];
    
    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Maintenance Sessions',
                data: monthlySessions,
                backgroundColor: barColors,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'start',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' sessions';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sessions',
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 5
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Make maintenance sessions chart globally available
window.initMaintenanceSessionsChart = initMaintenanceSessionsChart;