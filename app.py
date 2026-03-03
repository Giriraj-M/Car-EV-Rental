from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from functools import wraps
import json
from datetime import datetime, timedelta
import random

app = Flask(__name__)
app.secret_key = 'ev_car_taxi_secret_key_2024'

# ============== DATABASE / DATASET ==============

# EV Car Models with their specifications (5 brands with different models)
EV_CAR_SPECS = {
    # Tata Models
    "Tata Nexon EV Max": {"battery_capacity": 40, "range_per_kwh": 7.5, "image": "tata_nexon_ev.png", "brand": "Tata", "seats": 5},
    "Tata Nexon EV Prime": {"battery_capacity": 30, "range_per_kwh": 8.0, "image": "tata_nexon_ev.png", "brand": "Tata", "seats": 5},
    "Tata Tigor EV": {"battery_capacity": 26, "range_per_kwh": 11.5, "image": "tata_tigor_ev.png", "brand": "Tata", "seats": 5},
    "Tata Punch EV": {"battery_capacity": 35, "range_per_kwh": 8.5, "image": "tata_punch_ev.png", "brand": "Tata", "seats": 5},
    # MG Models
    "MG ZS EV": {"battery_capacity": 51, "range_per_kwh": 8.0, "image": "mg_zs_ev.png", "brand": "MG", "seats": 5},
    "MG Comet EV": {"battery_capacity": 17, "range_per_kwh": 13.0, "image": "mg_comet_ev.png", "brand": "MG", "seats": 4},
    "MG ZS EV Exclusive": {"battery_capacity": 51, "range_per_kwh": 8.2, "image": "mg_zs_ev.png", "brand": "MG", "seats": 5},
    # Hyundai Models
    "Hyundai Kona Electric": {"battery_capacity": 39, "range_per_kwh": 7.2, "image": "hyundai_kona.png", "brand": "Hyundai", "seats": 5},
    "Hyundai Ioniq 5": {"battery_capacity": 72, "range_per_kwh": 6.5, "image": "hyundai_ioniq5.png", "brand": "Hyundai", "seats": 5},
    "Hyundai Kona Electric Premium": {"battery_capacity": 39, "range_per_kwh": 7.5, "image": "hyundai_kona.png", "brand": "Hyundai", "seats": 5},
    # Mahindra Models
    "Mahindra XUV400": {"battery_capacity": 40, "range_per_kwh": 7.0, "image": "mahindra_xuv400.png", "brand": "Mahindra", "seats": 5},
    "Mahindra XUV400 Pro": {"battery_capacity": 40, "range_per_kwh": 7.2, "image": "mahindra_xuv400.png", "brand": "Mahindra", "seats": 5},
    "Mahindra e2o Plus": {"battery_capacity": 16, "range_per_kwh": 8.8, "image": "mahindra_e2o.png", "brand": "Mahindra", "seats": 4},
    # BYD Models
    "BYD Atto 3": {"battery_capacity": 60, "range_per_kwh": 8.5, "image": "byd_atto3.png", "brand": "BYD", "seats": 5},
    "BYD e6": {"battery_capacity": 71, "range_per_kwh": 7.3, "image": "byd_e6.png", "brand": "BYD", "seats": 7},
    "BYD Seal": {"battery_capacity": 82, "range_per_kwh": 6.8, "image": "byd_seal.png", "brand": "BYD", "seats": 5},
}

# 10 Admin credentials - each admin manages 10 drivers
ADMINS = {
    "admin1": {
        "id": 1,
        "unique_id": "ADM-001",
        "username": "admin1",
        "password": "admin123",
        "name": "Murugan Selvam",
        "age": 35,
        "email": "admin1@evtaxi.com",
        "phone": "+91-9876543001",
        "designation": "Fleet Manager - Zone 1",
        "office": "EV Taxi Office, T. Nagar, Chennai"
    },
    "admin2": {
        "id": 2,
        "unique_id": "ADM-002",
        "username": "admin2",
        "password": "admin123",
        "name": "Lakshmi Sundaram",
        "age": 38,
        "email": "admin2@evtaxi.com",
        "phone": "+91-9876543002",
        "designation": "Fleet Manager - Zone 2",
        "office": "EV Taxi Office, RS Puram, Coimbatore"
    },
    "admin3": {
        "id": 3,
        "unique_id": "ADM-003",
        "username": "admin3",
        "password": "admin123",
        "name": "Karthik Rajan",
        "age": 32,
        "email": "admin3@evtaxi.com",
        "phone": "+91-9876543003",
        "designation": "Fleet Manager - Zone 3",
        "office": "EV Taxi Office, Anna Nagar, Madurai"
    },
    "admin4": {
        "id": 4,
        "unique_id": "ADM-004",
        "username": "admin4",
        "password": "admin123",
        "name": "Priya Venkatesh",
        "age": 36,
        "email": "admin4@evtaxi.com",
        "phone": "+91-9876543004",
        "designation": "Fleet Manager - Zone 4",
        "office": "EV Taxi Office, Cantonment, Trichy"
    },
    "admin5": {
        "id": 5,
        "unique_id": "ADM-005",
        "username": "admin5",
        "password": "admin123",
        "name": "Senthil Kumar",
        "age": 39,
        "email": "admin5@evtaxi.com",
        "phone": "+91-9876543005",
        "designation": "Fleet Manager - Zone 5",
        "office": "EV Taxi Office, Five Roads, Salem"
    },
    "admin6": {
        "id": 6,
        "unique_id": "ADM-006",
        "username": "admin6",
        "password": "admin123",
        "name": "Meenakshi Narayanan",
        "age": 34,
        "email": "admin6@evtaxi.com",
        "phone": "+91-9876543006",
        "designation": "Fleet Manager - Zone 6",
        "office": "EV Taxi Office, Palayamkottai, Tirunelveli"
    },
    "admin7": {
        "id": 7,
        "unique_id": "ADM-007",
        "username": "admin7",
        "password": "admin123",
        "name": "Arun Krishnamurthy",
        "age": 37,
        "email": "admin7@evtaxi.com",
        "phone": "+91-9876543007",
        "designation": "Fleet Manager - Zone 7",
        "office": "EV Taxi Office, Sathy Road, Erode"
    },
    "admin8": {
        "id": 8,
        "unique_id": "ADM-008",
        "username": "admin8",
        "password": "admin123",
        "name": "Kavitha Subramanian",
        "age": 33,
        "email": "admin8@evtaxi.com",
        "phone": "+91-9876543008",
        "designation": "Fleet Manager - Zone 8",
        "office": "EV Taxi Office, Katpadi, Vellore"
    },
    "admin9": {
        "id": 9,
        "unique_id": "ADM-009",
        "username": "admin9",
        "password": "admin123",
        "name": "Ramesh Balakrishnan",
        "age": 31,
        "email": "admin9@evtaxi.com",
        "phone": "+91-9876543009",
        "designation": "Fleet Manager - Zone 9",
        "office": "EV Taxi Office, Avinashi Road, Tiruppur"
    },
    "admin10": {
        "id": 10,
        "unique_id": "ADM-010",
        "username": "admin10",
        "password": "admin123",
        "name": "Deepa Thirumalai",
        "age": 36,
        "email": "admin10@evtaxi.com",
        "phone": "+91-9876543010",
        "designation": "Fleet Manager - Zone 10",
        "office": "EV Taxi Office, South Main Street, Thanjavur"
    }
}

# Driver names pool for generating 100 drivers
DRIVER_NAMES = [
    # Admin 1 drivers (1-10) - Chennai
    "Rajesh Mani", "Kavitha Devi", "Suresh Babu", "Anitha Lakshmi", "Manikandan S",
    "Revathi Kumar", "Balasubramanian R", "Saranya Priya", "Vignesh Raja", "Deepika M",
    # Admin 2 drivers (11-20) - Coimbatore
    "Karthikeyan P", "Gomathi Devi", "Saravanan K", "Sangeetha R", "Prashanth M",
    "Divya Bharathi", "Muthu Kumar", "Jayanthi S", "Aravind Kumar", "Nithya Sri",
    # Admin 3 drivers (21-30) - Madurai
    "Selvam Raja", "Malathi Devi", "Pandian M", "Kiruthika S", "Ganesh Kumar",
    "Suganya Priya", "Rajan Pillai", "Thenmozhi M", "Dinesh Babu", "Bharathi Devi",
    # Admin 4 drivers (31-40) - Trichy
    "Shanmugam K", "Vasantha Kumari", "Mohan Raj", "Saraswathi P", "Kuppusamy R",
    "Janaki Devi", "Palani Samy", "Chitra Lakshmi", "Nagaraj M", "Sumathi S",
    # Admin 5 drivers (41-50) - Salem
    "Perumal Swamy", "Valarmathi K", "Govindaraj S", "Vijayalakshmi R", "Arumugam P",
    "Kanimozhi M", "Dhanasekar R", "Hemalatha S", "Srinivasan K", "Padma Priya",
    # Admin 6 drivers (51-60) - Tirunelveli
    "Thirunavukkarasu S", "Meenakshi Ammal", "Velmurugan K", "Parvathi Devi", "Chelladurai M",
    "Lakshmi Priya", "Ramasamy P", "Selvi Kumari", "Karuppasamy R", "Geetha Lakshmi",
    # Admin 7 drivers (61-70) - Erode
    "Duraisamy K", "Muthulakshmi S", "Senthilkumar R", "Eswari Devi", "Velusamy M",
    "Renuga Devi", "Mayilsamy P", "Bhuvaneswari S", "Chinnaswamy R", "Durgadevi M",
    # Admin 8 drivers (71-80) - Vellore
    "Ramamurthy K", "Kamatchi Ammal", "Ponnusamy S", "Ambika Devi", "Loganathan R",
    "Tamilselvi M", "Manickam P", "Sundari S", "Nallasamy K", "Pushpalatha R",
    # Admin 9 drivers (81-90) - Tiruppur
    "Ganesan M", "Radha Krishnan", "Subramani K", "Poongodi S", "Rajagopal P",
    "Maheshwari R", "Elango Kumar", "Shanthi Devi", "Thangavel M", "Usha Rani",
    # Admin 10 drivers (91-100) - Thanjavur
    "Sundaram Pillai", "Kamalam Devi", "Natarajan S", "Banumathi R", "Veerappan M",
    "Sarojini Devi", "Chidambaram K", "Alamelu S", "Krishnamurthy P", "Rukmini Devi"
]

LOCATIONS = [
    "Marina Beach", "Chennai Airport", "Charging Station A", "ECR Highway", "Charging Station B",
    "Express Avenue Mall", "OMR Expressway", "Charging Station C", "Tidel Park", "Mount Road",
    "Chennai Central", "SIPCOT IT Park", "Anna University", "Apollo Hospital", "Chepauk Stadium"
]

ADDRESSES = [
    "Lakshmi Nagar, T. Nagar, Chennai", "Gandhi Road, RS Puram, Coimbatore",
    "Anna Nagar Main Road, Madurai", "Cantonment Area, Trichy", "Five Roads Junction, Salem",
    "Palayamkottai Main Road, Tirunelveli", "Sathy Road, Erode", "Katpadi Town, Vellore",
    "Avinashi Road, Tiruppur", "South Main Street, Thanjavur"
]

CAR_MODELS = list(EV_CAR_SPECS.keys())

def generate_drivers():
    """Generate 100 drivers - 10 per admin"""
    drivers = {}
    
    # Pre-generate which positions are running for each admin (6-7 running, mixed order)
    admin_running_positions = {}
    for admin_id in range(1, 11):
        running_count = 7 if (admin_id % 2 == 1) else 6  # 7 or 6 running per admin
        all_positions = list(range(10))
        random.shuffle(all_positions)
        admin_running_positions[admin_id] = set(all_positions[:running_count])
    
    for i in range(1, 101):
        admin_id = ((i - 1) // 10) + 1  # Admin 1 for drivers 1-10, Admin 2 for 11-20, etc.
        driver_index = i - 1
        position_in_admin_group = (i - 1) % 10  # 0-9 position within admin's 10 drivers
        
        # Generate varied data
        battery = random.randint(15, 95)
        
        # Determine status based on randomly pre-selected running positions (mixed order)
        if position_in_admin_group in admin_running_positions[admin_id]:
            # This driver should be running
            is_charging = False
            is_running = True
            battery = random.randint(35, 95)  # Running cars have higher battery
        else:
            # This driver is in garage (either charging or idle)
            is_charging = random.random() > 0.4  # 60% chance of charging
            is_running = False
            battery = random.randint(15, 60) if is_charging else random.randint(40, 80)
        
        current_speed = random.randint(40, 115) if is_running else 0
        
        # Generate charging-related data
        charging_sessions_monthly = [random.randint(15, 30) for _ in range(12)]
        energy_consumed_monthly = [random.randint(200, 400) for _ in range(12)]  # kWh per month
        
        drivers[f"driver{i}"] = {
            "id": i,
            "unique_id": f"DRV-{str(i).zfill(3)}",
            "admin_id": admin_id,
            "username": f"driver{i}",
            "password": "pass123",
            "name": DRIVER_NAMES[driver_index],
            "age": random.randint(23, 54),
            "gender": "Male" if driver_index % 2 == 0 else "Female",
            "address": f"{random.randint(1, 999)}, {ADDRESSES[driver_index % 10]} - {600001 + driver_index % 50}",
            "email": f"driver{i}@evtaxi.com",
            "phone": f"+91-98123{str(i).zfill(5)}",
            "license_number": f"TN01-{2016 + (i % 8)}-{str(i).zfill(7)}",
            "joining_date": f"{2020 + (i % 4)}-{str((i % 12) + 1).zfill(2)}-{str((i % 28) + 1).zfill(2)}",
            "emergency_contact": f"+91-98124{str(i).zfill(5)}",
            "blood_group": ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"][i % 8],
            "car_model": CAR_MODELS[i % len(CAR_MODELS)],
            "car_number": f"EV-{str(i).zfill(3)}",
            "battery_percentage": battery,
            "battery_health": random.randint(85, 100),  # Battery health percentage
            "status": "garage" if is_charging else ("running" if is_running else "garage"),
            "charging_status": "charging" if is_charging else "not_charging",
            "current_speed": current_speed,
            "location": f"Charging Station {chr(65 + i % 5)}" if is_charging else LOCATIONS[i % 15],
            "trips_today": random.randint(3, 18),
            "monthly_revenue": [random.randint(12000, 22000) for _ in range(12)],
            "charging_cost_monthly": [random.randint(250, 450) for _ in range(12)],
            "maintenance_cost_monthly": [random.randint(120, 320) for _ in range(12)],
            "charging_sessions_monthly": charging_sessions_monthly,
            "energy_consumed_monthly": energy_consumed_monthly,
            "last_charged": f"2026-02-{str(random.randint(20, 26)).zfill(2)} {random.randint(8, 22)}:{str(random.randint(0, 59)).zfill(2)}",
            "avg_charging_time": random.randint(35, 75)  # minutes
        }
    
    return drivers

# Generate all 100 drivers
DRIVERS = generate_drivers()

SPEED_LIMIT = 100
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# ============== HELPER FUNCTIONS ==============

def get_admin_drivers(admin_id):
    """Get all drivers belonging to a specific admin"""
    return {k: v for k, v in DRIVERS.items() if v['admin_id'] == admin_id}

def calculate_range(car_model, battery_percentage):
    """Calculate estimated range based on car model and battery percentage"""
    if car_model in EV_CAR_SPECS:
        specs = EV_CAR_SPECS[car_model]
        current_kwh = specs["battery_capacity"] * (battery_percentage / 100)
        estimated_range = current_kwh * specs["range_per_kwh"]
        return round(estimated_range, 1)
    return 0

def calculate_charging_time(battery_percentage):
    """Estimate time to full charge (assuming 50kW fast charger)"""
    remaining = 100 - battery_percentage
    minutes = (remaining / 100) * 60  # Simplified calculation
    return round(minutes)

def get_fleet_statistics(admin_id=None):
    """Get fleet statistics - filtered by admin_id if provided"""
    if admin_id:
        drivers = get_admin_drivers(admin_id)
    else:
        drivers = DRIVERS
    
    if not drivers:
        return {
            "running_count": 0, "garage_count": 0, "charging_count": 0,
            "total_cars": 0, "overspeed_drivers": [], "total_revenue": 0,
            "total_charging_cost": 0, "total_maintenance_cost": 0, "avg_battery": 0,
            "total_energy_consumed": 0, "total_charging_sessions": 0, "avg_battery_health": 0,
            "low_battery_count": 0, "avg_charging_time": 0
        }
    
    running_count = sum(1 for d in drivers.values() if d["status"] == "running")
    garage_count = sum(1 for d in drivers.values() if d["status"] == "garage")
    charging_count = sum(1 for d in drivers.values() if d["charging_status"] == "charging")
    
    overspeed_drivers = [d for d in drivers.values() if d["current_speed"] > SPEED_LIMIT]
    
    total_revenue = sum(sum(d["monthly_revenue"]) for d in drivers.values())
    total_charging_cost = sum(sum(d["charging_cost_monthly"]) for d in drivers.values())
    total_maintenance_cost = sum(sum(d["maintenance_cost_monthly"]) for d in drivers.values())
    
    avg_battery = sum(d["battery_percentage"] for d in drivers.values()) / len(drivers)
    
    # Charging analytics
    total_energy_consumed = sum(sum(d.get("energy_consumed_monthly", [0])) for d in drivers.values())
    total_charging_sessions = sum(sum(d.get("charging_sessions_monthly", [0])) for d in drivers.values())
    avg_battery_health = sum(d.get("battery_health", 90) for d in drivers.values()) / len(drivers)
    low_battery_count = sum(1 for d in drivers.values() if d["battery_percentage"] < 25)
    avg_charging_time = sum(d.get("avg_charging_time", 45) for d in drivers.values()) / len(drivers)
    
    # Vehicle model segregation by brand
    vehicle_by_brand = {}
    vehicle_by_model = {}
    for d in drivers.values():
        model = d["car_model"]
        brand = EV_CAR_SPECS.get(model, {}).get("brand", "Unknown")
        
        # Count by brand
        if brand not in vehicle_by_brand:
            vehicle_by_brand[brand] = {"total": 0, "running": 0, "garage": 0, "charging": 0, "models": {}}
        vehicle_by_brand[brand]["total"] += 1
        if d["status"] == "running":
            vehicle_by_brand[brand]["running"] += 1
        else:
            vehicle_by_brand[brand]["garage"] += 1
        if d["charging_status"] == "charging":
            vehicle_by_brand[brand]["charging"] += 1
        
        # Count by model within brand
        if model not in vehicle_by_brand[brand]["models"]:
            vehicle_by_brand[brand]["models"][model] = {"total": 0, "running": 0, "garage": 0, "charging": 0}
        vehicle_by_brand[brand]["models"][model]["total"] += 1
        if d["status"] == "running":
            vehicle_by_brand[brand]["models"][model]["running"] += 1
        else:
            vehicle_by_brand[brand]["models"][model]["garage"] += 1
        if d["charging_status"] == "charging":
            vehicle_by_brand[brand]["models"][model]["charging"] += 1
        
        # Count by model (flat)
        if model not in vehicle_by_model:
            vehicle_by_model[model] = {"total": 0, "running": 0, "garage": 0, "charging": 0}
        vehicle_by_model[model]["total"] += 1
        if d["status"] == "running":
            vehicle_by_model[model]["running"] += 1
        else:
            vehicle_by_model[model]["garage"] += 1
        if d["charging_status"] == "charging":
            vehicle_by_model[model]["charging"] += 1
    
    return {
        "running_count": running_count,
        "garage_count": garage_count,
        "charging_count": charging_count,
        "total_cars": len(drivers),
        "overspeed_drivers": overspeed_drivers,
        "total_revenue": total_revenue,
        "total_charging_cost": total_charging_cost,
        "total_maintenance_cost": total_maintenance_cost,
        "avg_battery": round(avg_battery, 1),
        "total_energy_consumed": total_energy_consumed,
        "total_charging_sessions": total_charging_sessions,
        "avg_battery_health": round(avg_battery_health, 1),
        "low_battery_count": low_battery_count,
        "avg_charging_time": round(avg_charging_time, 0),
        "vehicle_by_brand": vehicle_by_brand,
        "vehicle_by_model": vehicle_by_model
    }

# ============== DECORATORS ==============

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or session.get('user_type') != 'admin':
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ============== ROUTES ==============

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_type = request.form.get('user_type')
        
        if user_type == 'admin':
            # Check against all admins
            if username in ADMINS and ADMINS[username]['password'] == password:
                admin = ADMINS[username]
                session['logged_in'] = True
                session['user_type'] = 'admin'
                session['username'] = username
                session['admin_id'] = admin['id']
                session['name'] = admin['name']
                return redirect(url_for('admin_dashboard'))
            else:
                flash('Invalid admin credentials!', 'error')
        else:
            if username in DRIVERS and DRIVERS[username]['password'] == password:
                session['logged_in'] = True
                session['user_type'] = 'driver'
                session['username'] = username
                session['name'] = DRIVERS[username]['name']
                session['admin_id'] = DRIVERS[username]['admin_id']
                return redirect(url_for('driver_dashboard'))
            else:
                flash('Invalid driver credentials!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    admin_id = session.get('admin_id')
    admin = ADMINS.get(session.get('username'))
    
    # Get only this admin's drivers
    stats = get_fleet_statistics(admin_id)
    admin_drivers = get_admin_drivers(admin_id)
    drivers_list = list(admin_drivers.values())
    
    # Calculate range for each driver
    for driver in drivers_list:
        driver['estimated_range'] = calculate_range(driver['car_model'], driver['battery_percentage'])
        driver['charging_time'] = calculate_charging_time(driver['battery_percentage'])
    
    return render_template('admin_dashboard.html', 
                         stats=stats, 
                         drivers=drivers_list,
                         admin=admin,
                         speed_limit=SPEED_LIMIT,
                         months=MONTHS,
                         car_specs=EV_CAR_SPECS)

@app.route('/driver/dashboard')
@login_required
def driver_dashboard():
    if session.get('user_type') != 'driver':
        return redirect(url_for('admin_dashboard'))
    
    username = session.get('username')
    driver = DRIVERS.get(username)
    car_specs = {}
    charging_costs = {'daily': 0, 'monthly_avg': 0, 'yearly': 0}
    admin_info = {}
    
    if driver:
        driver['estimated_range'] = calculate_range(driver['car_model'], driver['battery_percentage'])
        driver['charging_time'] = calculate_charging_time(driver['battery_percentage'])
        car_specs = EV_CAR_SPECS.get(driver['car_model'], {})
        
        # Add car specs to driver for range calculation display
        driver['battery_capacity'] = car_specs.get('battery_capacity', 0)
        driver['range_per_kwh'] = car_specs.get('range_per_kwh', 0)
        
        # Calculate charging costs
        charging_yearly = sum(driver['charging_cost_monthly'])
        charging_monthly_avg = charging_yearly / 12
        charging_daily_avg = charging_yearly / 365
        
        charging_costs = {
            'daily': round(charging_daily_avg, 2),
            'monthly_avg': round(charging_monthly_avg, 2),
            'yearly': charging_yearly
        }
        
        # Get the correct admin info for this driver
        driver_admin_id = driver.get('admin_id')
        for admin_username, admin in ADMINS.items():
            if admin['id'] == driver_admin_id:
                admin_info = {
                    'name': admin['name'],
                    'phone': admin.get('phone', '+91-9876543000'),
                    'email': admin.get('email', 'admin@evtaxi.com'),
                    'designation': admin.get('designation', 'Fleet Manager'),
                    'office': admin.get('office', 'Main Office, Mumbai')
                }
                break
    
    return render_template('driver_dashboard.html', 
                         driver=driver,
                         car_specs=car_specs,
                         admin_info=admin_info,
                         charging_costs=charging_costs,
                         speed_limit=SPEED_LIMIT,
                         months=MONTHS)

# ============== API ENDPOINTS ==============

@app.route('/api/fleet-stats')
@admin_required
def api_fleet_stats():
    admin_id = session.get('admin_id')
    return jsonify(get_fleet_statistics(admin_id))

@app.route('/api/drivers')
@admin_required
def api_drivers():
    admin_id = session.get('admin_id')
    admin_drivers = get_admin_drivers(admin_id)
    drivers_list = []
    for driver in admin_drivers.values():
        driver_data = dict(driver)
        driver_data['estimated_range'] = calculate_range(driver['car_model'], driver['battery_percentage'])
        driver_data['charging_time'] = calculate_charging_time(driver['battery_percentage'])
        drivers_list.append(driver_data)
    return jsonify(drivers_list)

@app.route('/api/revenue-data')
@admin_required
def api_revenue_data():
    admin_id = session.get('admin_id')
    admin_drivers = get_admin_drivers(admin_id)
    revenue_data = {}
    for driver in admin_drivers.values():
        revenue_data[driver['name']] = {
            'car_model': driver['car_model'],
            'car_number': driver['car_number'],
            'monthly_revenue': driver['monthly_revenue'],
            'total_revenue': sum(driver['monthly_revenue'])
        }
    return jsonify({'months': MONTHS, 'data': revenue_data})

@app.route('/api/charging-costs')
@admin_required
def api_charging_costs():
    """Get charging costs for all time periods"""
    admin_id = session.get('admin_id')
    admin_drivers = get_admin_drivers(admin_id)
    costs_data = {}
    for driver in admin_drivers.values():
        monthly = driver['charging_cost_monthly']
        costs_data[driver['name']] = {
            'car_number': driver['car_number'],
            'daily': round(sum(monthly) / 365, 2),
            'monthly': monthly,
            'two_months': [monthly[i] + monthly[i+1] for i in range(0, 12, 2)],
            'yearly': sum(monthly)
        }
    return jsonify({'months': MONTHS, 'data': costs_data})

@app.route('/api/maintenance-costs')
@admin_required
def api_maintenance_costs():
    """Get maintenance costs for all time periods"""
    admin_id = session.get('admin_id')
    admin_drivers = get_admin_drivers(admin_id)
    costs_data = {}
    for driver in admin_drivers.values():
        monthly = driver['maintenance_cost_monthly']
        costs_data[driver['name']] = {
            'car_number': driver['car_number'],
            'daily': round(sum(monthly) / 365, 2),
            'monthly': monthly,
            'two_months': [monthly[i] + monthly[i+1] for i in range(0, 12, 2)],
            'yearly': sum(monthly)
        }
    return jsonify({'months': MONTHS, 'data': costs_data})

@app.route('/api/speed-alerts')
@admin_required
def api_speed_alerts():
    """Get overspeed alerts"""
    admin_id = session.get('admin_id')
    admin_drivers = get_admin_drivers(admin_id)
    alerts = []
    for driver in admin_drivers.values():
        if driver['current_speed'] > SPEED_LIMIT:
            alerts.append({
                'driver_name': driver['name'],
                'car_number': driver['car_number'],
                'current_speed': driver['current_speed'],
                'location': driver['location'],
                'over_by': driver['current_speed'] - SPEED_LIMIT,
                'danger_level': 'critical' if driver['current_speed'] > SPEED_LIMIT + 15 else 'warning'
            })
    return jsonify(alerts)

@app.route('/api/battery-data')
@admin_required
def api_battery_data():
    """Get battery percentage data for all cars"""
    admin_id = session.get('admin_id')
    admin_drivers = get_admin_drivers(admin_id)
    battery_data = []
    for driver in admin_drivers.values():
        battery_data.append({
            'name': driver['name'],
            'car_number': driver['car_number'],
            'car_model': driver['car_model'],
            'battery_percentage': driver['battery_percentage'],
            'estimated_range': calculate_range(driver['car_model'], driver['battery_percentage']),
            'charging_status': driver['charging_status']
        })
    return jsonify(battery_data)

@app.route('/api/driver/<username>')
@login_required
def api_driver_data(username):
    """Get specific driver data"""
    # Drivers can only access their own data
    if session.get('user_type') == 'driver' and session.get('username') != username:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Admins can only access their own drivers
    if session.get('user_type') == 'admin':
        admin_id = session.get('admin_id')
        driver = DRIVERS.get(username)
        if driver and driver.get('admin_id') != admin_id:
            return jsonify({'error': 'Unauthorized - Driver belongs to another admin'}), 403
    
    driver = DRIVERS.get(username)
    if driver:
        driver_data = dict(driver)
        driver_data['estimated_range'] = calculate_range(driver['car_model'], driver['battery_percentage'])
        driver_data['charging_time'] = calculate_charging_time(driver['battery_percentage'])
        return jsonify(driver_data)
    return jsonify({'error': 'Driver not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
