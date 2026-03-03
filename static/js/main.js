// ===== Main JavaScript Functions =====

// Update current date/time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Initialize date/time update
setInterval(updateDateTime, 1000);
updateDateTime();

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Navigation between sections
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.dataset.section;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
});

// Scroll to section
function scrollToSection(sectionId) {
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) {
        navItem.click();
    }
}

// Filter fleet by status
function filterFleet() {
    const filter = document.getElementById('statusFilter').value;
    const cards = document.querySelectorAll('.vehicle-card');
    
    cards.forEach(card => {
        const status = card.dataset.status;
        if (filter === 'all' || status === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show alerts modal
function showAlerts() {
    const modal = document.getElementById('alertModal');
    const modalBody = document.getElementById('alertModalBody');
    
    // Get overspeed drivers
    const overSpeedDrivers = driversData.filter(d => d.current_speed > speedLimit);
    
    if (overSpeedDrivers.length > 0) {
        let content = '<div class="alert-list">';
        overSpeedDrivers.forEach(driver => {
            const dangerLevel = driver.current_speed > speedLimit + 15 ? 'critical' : 'warning';
            content += `
                <div class="alert-item ${dangerLevel}">
                    <div class="alert-item-header">
                        <strong>${driver.car_number}</strong>
                        <span class="speed-badge">${driver.current_speed} km/h</span>
                    </div>
                    <div class="alert-item-body">
                        <p><strong>Driver:</strong> ${driver.name} <span style="font-size: 10px; color: #6366f1; background: rgba(99, 102, 241, 0.2); padding: 1px 5px; border-radius: 3px;">${driver.unique_id}</span></p>
                        <p><strong>Location:</strong> ${driver.location}</p>
                        <p class="over-by"><strong>Over limit by:</strong> ${driver.current_speed - speedLimit} km/h</p>
                    </div>
                </div>
            `;
        });
        content += '</div>';
        modalBody.innerHTML = content;
    } else {
        modalBody.innerHTML = '<p style="text-align: center; color: var(--success-color);"><i class="fas fa-check-circle" style="font-size: 40px; margin-bottom: 15px;"></i><br>No speed violations!</p>';
    }
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('alertModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// Generate random colors for charts
function generateColors(count) {
    const colors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(168, 85, 247, 0.8)'
    ];
    return colors.slice(0, count);
}

// Add custom styles for alert modal items
const style = document.createElement('style');
style.textContent = `
    .alert-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .alert-item {
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid;
    }
    
    .alert-item.warning {
        background: rgba(245, 158, 11, 0.1);
        border-color: var(--warning-color);
    }
    
    .alert-item.critical {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--danger-color);
    }
    
    .alert-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .speed-badge {
        padding: 4px 10px;
        background: var(--danger-color);
        color: white;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    .alert-item-body p {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 5px;
    }
    
    .over-by {
        color: var(--danger-color) !important;
    }
`;
document.head.appendChild(style);
