from functools import wraps
import os
from flask import current_app as app, jsonify, request, render_template , abort, send_file
from flask_security import auth_required, verify_password, hash_password, login_required, current_user, logout_user, login_user
from backend.models import Service, db, User, Role , ServiceRequest , Service

datastore = app.security.datastore

# Role-based access control
def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('admin'):
            return jsonify({'message': 'Access Denied: Admin only'}), 403
        return func(*args, **kwargs)
    return wrapper

def service_professional_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('service_professional'):
            return jsonify({'message': 'Access Denied: Service Professional only'}), 403
        return func(*args, **kwargs)
    return wrapper

def customer_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('customer'):
            return jsonify({'message': 'Access Denied: Customer only'}), 403
        return func(*args, **kwargs)
    return wrapper




# Home route
@app.route("/")
def home():
    return render_template('index.html')


@app.route('/protected')
@auth_required('token')
def protected():
    return "This is an authenticated user."



# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not user.active:
        return jsonify({'message': 'Your Account Has Been Suspended from Admin side.'}), 403

    # Service Professional validation
    if "service_professional" in [role.name for role in user.roles]:
        if user.accepted == "Pending":
            return jsonify({'message': 'Your Application Status is Under Process'}), 403
        elif user.accepted == "No":
            return jsonify({'message': 'Your Application got Rejected'}), 403
        elif user.accepted == "Yes" and not user.active:
            return jsonify({'message': 'Your Account Has Been Suspended from Admin side.'}), 403
        elif user.accepted == "Yes":
            redirect_path = '/service_professional/profile'  # Redirecting to profile page

    if verify_password(password, user.password):
        login_user(user)

        role = user.roles[0].name if user.roles else None  # Fix: Return single role as string

        if role == 'admin':
            redirect_path = '/admin/dashboard'
        elif role == 'service_professional' and user.accepted == "Yes":
            redirect_path = f'/service_professional/dashboard/{user.id}'  # Ensure profile redirection
        elif role == 'customer':
            redirect_path = f'/customer/dashboard/{user.id}'  # Ensure profile redirection
        else:
            redirect_path = '/'

        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': role,  # Now a string, not a list
            'id': user.id,
            'redirect_url': redirect_path
        }), 200

    return jsonify({'message': 'Incorrect password'}), 400




# Register routes
@app.route('/register/customer', methods=['POST'])
def register_customer():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    pincode = data.get('pincode')

    if not all([email, password, confirm_password, name, phone, address, pincode]):
        return jsonify({'message': 'All fields are required'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    user = app.security.datastore.find_user(email=email)
    if user:
        return jsonify({'message': 'User already exists'}), 409

    # Assign customer role
    role = app.security.datastore.find_role('customer')
    if not role:
        return jsonify({'message': 'Customer role is invalid. Please contact admin.'}), 400

    try:
        user = app.security.datastore.create_user(
            email=email,
            password=hash_password(password),
            roles=[role],
            name=name,
            phone=phone,
            address=address,
            pincode=pincode,
            active=True  # Set active status to True
        )
        db.session.commit()
        return jsonify({'message': 'Customer registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating customer user: {e}")
        return jsonify({'message': 'Error creating customer user'}), 500

@app.route('/register/service_professional', methods=['POST'])
def register_service_professional():
    # Ensure upload folder exists
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads/resumes')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Extract fields from the form data
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')
    name = request.form.get('name')
    phone = request.form.get('phone')
    address = request.form.get('address')
    pincode = request.form.get('pincode')
    experience = request.form.get('experience')
    service_category = request.form.get('service_category')

    resume = request.files.get('resume')

    # Validate file format (only PDF allowed)
    if resume:
        if not resume.filename.endswith('.pdf'):
            return jsonify({'message': 'Only PDF files are allowed for resume'}), 400
        # Save the resume file
        resume_path = os.path.join(UPLOAD_FOLDER, resume.filename)
        resume.save(resume_path)

    # Input validation: Check required fields
    if not all([email, password, confirm_password, name, phone, address, pincode, experience, service_category]):
        return jsonify({'message': 'All fields are required'}), 400

    # Validate password confirmation
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    # Check if user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({'message': 'User already exists'}), 409

    # Create a new service professional
    try:
        user = datastore.create_user(
            email=email,
            password=hash_password(password),
            roles=['service_professional'],
            name=name,
            phone=phone,
            address=address,
            pincode=pincode,
            experience=experience,
            resume=resume_path,  # Save resume path
            service_category=service_category,
            accepted='Pending',  # Set accepted status to Pending
            active=True
        )
        db.session.commit()
        return jsonify({'message': 'Service professional registered successfully', 'redirect_url': '/login'}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating service professional user: {e}")
        return jsonify({'message': 'Error creating service professional user'}), 500
    

# -------------------------------------------------------------------------------------------------------------------------------------------------



# Admin Routes
    
@app.route('/admin/applications', methods=['GET'])
@admin_required
@auth_required('token')
def get_pending_applications():
    # Debugging: Check received auth token
    print(f"Auth Header Received: {request.headers.get('Authentication-Token')}")

    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401

    if 'admin' not in [role.name for role in current_user.roles]:
        return jsonify({'message': 'Forbidden: Not an admin'}), 403

    pending_professionals = User.query.join(User.roles).filter(
        Role.name == 'service_professional',
        User.accepted == "Pending"
    ).all()

    applications = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "pincode": user.pincode,
            "experience": user.experience,
            "service_category": user.service_category,
            "resume": user.resume,
            "date_applied": user.fs_uniquifier  # Using this as a proxy for application date
        }
        for user in pending_professionals
    ]

    return jsonify(applications), 200



@app.route('/admin/application/<int:service_professional_id>/resume', methods=['GET'])
@auth_required('token')
@admin_required
def get_resume(service_professional_id):
    service_professional = User.query.join(User.roles).filter(
        Role.name == 'service_professional',
        User.id == service_professional_id
    ).first()

    if not service_professional or not service_professional.resume:
        abort(404)

    resume_path = service_professional.resume
    if not os.path.exists(resume_path):
        abort(404)

    try:
        return send_file(resume_path, mimetype='application/pdf')
    except Exception as e:
        app.logger.error(f"Error sending resume file: {e}")
        abort(500)



@app.route('/admin/dashboard', methods=['GET'])
@admin_required
@auth_required('token')
def admin_dashboard():
    """Fetch admin details for the dashboard"""
    admin = User.query.filter(User.roles.any(name="admin")).first()
    
    if not admin:
        return jsonify({"message": "Admin not found"}), 404

    return jsonify({
        "id": admin.id,
        "email": admin.email,
        "name": admin.name,
        "phone": admin.phone,
        "address": admin.address,
        "pincode": admin.pincode
    }), 200


@app.route('/admin/service-professionals', methods=['GET'])
@admin_required
@auth_required('token')
def get_service_professionals():
    
    """Fetch only active service professionals (Accepted = 'Yes' and Active = True)."""
    
    professionals = User.query.filter(
        User.roles.any(name="service_professional"),
        User.accepted == "Yes",
        User.active == True  # Fetch only active professionals
    ).all()

    if not professionals:
        return jsonify({"message": "No active service professionals found"}), 404

    professionals_list = [
        {
            "id": pro.id,
            "name": pro.name,
            "email": pro.email,
            "phone": pro.phone,
            "address": pro.address,
            "pincode": pro.pincode,
            "experience": pro.experience,
            "resume": pro.resume,
            "service_category": pro.service_category
        }
        for pro in professionals
    ]

    return jsonify(professionals_list), 200


@app.route('/admin/unflag-professional/<int:user_id>', methods=['POST'])
@admin_required
@auth_required('token')
def unflag_service_professional(user_id):
    """Admin can unflag (reactivate) a flagged service professional (Active = False → True)."""
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Ensure the user is a flagged service professional
    if "service_professional" not in [role.name for role in user.roles] or user.accepted != "Yes":
        return jsonify({"message": "User is not an approved service professional"}), 400

    if user.active:  # If already active, prevent unflagging
        return jsonify({"message": "User is already active"}), 400

    # Unflag the user (Reactivate)
    user.active = True
    db.session.commit()

    return jsonify({"message": f"Service Professional {user.name} has been unflagged (reactivated)."}), 200



@app.route('/admin/flag-professional/<int:user_id>', methods=['POST'])
@admin_required
@auth_required('token')
def flag_service_professional(user_id):
    """Admin can flag (suspend) a service professional by setting active=False"""
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Check if the user is a service professional and is accepted
    if "service_professional" not in [role.name for role in user.roles] or user.accepted != "Yes":
        return jsonify({"message": "User is not an approved service professional"}), 400

    # Flag the user (Suspend)
    user.active = False
    db.session.commit()

    return jsonify({"message": f"Service Professional {user.name} has been flagged (suspended)."}), 200

@app.route('/admin/flagged-service-professionals', methods=['GET'])
@admin_required
@auth_required('token')
def get_flagged_service_professionals():
    """Fetch all flagged (inactive) service professionals (Accepted = 'Yes' and Active = False)."""

    professionals = User.query.filter(
        User.roles.any(name="service_professional"),
        User.accepted == "Yes",
        User.active == False  # Fetch only flagged (inactive) professionals
    ).all()

    if not professionals:
        return jsonify({"message": "No flagged service professionals found"}), 404

    professionals_list = [
        {
            "id": pro.id,
            "name": pro.name,
            "email": pro.email,
            "phone": pro.phone,
            "address": pro.address,
            "pincode": pro.pincode,
            "experience": pro.experience,
            "resume": pro.resume,
            "service_category": pro.service_category
        }
        for pro in professionals
    ]

    return jsonify(professionals_list), 200





@app.route('/admin/customers', methods=['GET'])
@admin_required
@auth_required('token')
def get_customers():
    """Fetch only active customers (Active = True)."""
    
    customers = User.query.filter(
        User.roles.any(name="customer"),
        User.active == True  # Fetch only active customers
    ).all()

    if not customers:
        return jsonify({"message": "No active customers found"}), 404

    customers_list = [
        {
            "id": cust.id,
            "name": cust.name,
            "email": cust.email,
            "phone": cust.phone,
            "address": cust.address,
            "pincode": cust.pincode
        }
        for cust in customers
    ]

    return jsonify(customers_list), 200


@app.route('/admin/unflag-customer/<int:user_id>', methods=['POST'])
@admin_required
@auth_required('token')
def unflag_customer(user_id):
    """Admin can unflag (reactivate) a flagged customer (Active = False → True)."""
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Ensure the user is a flagged customer
    if "customer" not in [role.name for role in user.roles]:
        return jsonify({"message": "User is not a customer"}), 400

    if user.active:  # If already active, prevent unflagging
        return jsonify({"message": "User is already active"}), 400

    # Unflag the user (Reactivate)
    user.active = True
    db.session.commit()

    return jsonify({"message": f"Customer {user.name} has been unflagged (reactivated)."}), 200


@app.route('/admin/flag-customer/<int:user_id>', methods=['POST'])
@admin_required
@auth_required('token')
def flag_customer(user_id):
    """Admin can flag (suspend) a customer by setting active=False."""
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Check if the user is a customer
    if "customer" not in [role.name for role in user.roles]:
        return jsonify({"message": "User is not a registered customer"}), 400

    # Flag the user (Suspend)
    user.active = False
    db.session.commit()

    return jsonify({"message": f"Customer {user.name} has been flagged (suspended)."}), 200

@app.route('/admin/flagged-customers', methods=['GET'])
@admin_required
@auth_required('token')
def get_flagged_customers():
    """Fetch all flagged (inactive) customers (Active = False)."""

    customers = User.query.filter(
        User.roles.any(name="customer"),
        User.active == False  # Fetch only flagged customers
    ).all()

    if not customers:
        return jsonify({"message": "No flagged customers found"}), 404

    customers_list = [
        {
            "id": cust.id,
            "name": cust.name,
            "email": cust.email,
            "phone": cust.phone,
            "address": cust.address,
            "pincode": cust.pincode
        }
        for cust in customers
    ]

    return jsonify(customers_list), 200


@app.route('/admin/services', methods=['GET'])
@admin_required
@auth_required('token')
def get_admin_services():
    """Fetch only services created by admin users."""

    # Fetch only services where the user (creator) has an "admin" role
    services = Service.query.join(User).filter(User.roles.any(name="admin")).all()

    if not services:
        return jsonify({"message": "No services found"}), 404

    services_list = [
        {
            "id": service.id,
            "name": service.name,
            "price": service.price,
            "timing": service.timing,
            "description": service.description,
            "service_category": service.service_category,
            "user_id": service.user_id
        }
        for service in services
    ]

    return jsonify(services_list), 200



@app.route('/admin/request', methods=['GET'])
@auth_required('token')               # Ensures the user is authenticated
@admin_required                       # Ensures only admin can access
def get_admin_requests():
    """
    Route to fetch all service requests for the services created by the admin,
    grouped by their respective status.
    """
    
    admin_id = current_user.id

    # ✅ Fetch all services created by the admin
    services = Service.query.filter_by(user_id=admin_id).all()
    
    # ✅ Extract the service IDs
    service_ids = [service.id for service in services]

    if not service_ids:
        return jsonify({'message': 'No services found for this admin'}), 404

    # ✅ Fetch all service requests related to the admin's services
    requests = ServiceRequest.query.filter(ServiceRequest.service_id.in_(service_ids)).all()

    # ✅ Grouping requests by status
    pending = []
    active = []
    completed = []
    rejected = []

    for req in requests:
        service = Service.query.get(req.service_id)
        customer = User.query.get(req.customer_id)

        request_info = {
            'id': req.id,
            'service_name': service.name if service else 'Unknown Service',
            'customer_name': customer.name if customer else 'Unknown Customer',
            'date': req.date_of_request.strftime('%Y-%m-%d'),
            'time': req.time,
            'remarks': req.remarks,
            'status': req.service_status
        }

        # ✅ Categorizing requests
        if req.service_status in ['requested', 'pending']:
            pending.append(request_info)
        elif req.service_status in ['accepted', 'active']:
            active.append(request_info)
        elif req.service_status in ['completed', 'closed']:
            completed.append(request_info)
        elif req.service_status in ['rejected', 'cancelled']:
            rejected.append(request_info)

    # ✅ Response with categorized requests
    return jsonify({
        'pending': pending,
        'active': active,
        'completed': completed,
        'rejected': rejected
    }), 200










# -------------------------------------------------------------------------------------------------------------------------------------------------

# Service Professional Routes

@app.route('/service_professional/dashboard/<int:user_id>', methods=['GET'])
@auth_required('token')  # Ensures the user is logged in
@service_professional_required  # Ensures only service professionals can access
def service_professional_dashboard(user_id):
    if not current_user.is_authenticated:
        return jsonify({'message': 'Login required', 'redirect_url': '/login'}), 401  # Redirect info

    # Check if the logged-in user is accessing their own profile
    if current_user.id != user_id:
        return jsonify({'message': 'Access Denied: You can only access your own profile'}), 403

    return jsonify({
        'message': 'Welcome to your profile',
        'id': current_user.id,  # Adding ID
        'name': current_user.name,
        'email': current_user.email,
        'phone': current_user.phone,
        'service_category': current_user.service_category,
        'experience': current_user.experience
    }), 200



@app.route('/service-professional/requests', methods=['GET'])
@auth_required('token')                     # Ensures the user is authenticated
@service_professional_required              # Ensures only service professionals can access
def get_service_professional_requests():
    """
    Route to fetch all service requests assigned to the service professional,
    grouped by their respective status.
    """

    professional_id = current_user.id

    # ✅ Fetch all service requests assigned to the current service professional
    requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()

    # ✅ Grouping requests by status
    pending = []
    active = []
    completed = []
    rejected = []

    for req in requests:
        service = Service.query.get(req.service_id)
        customer = User.query.get(req.customer_id)

        request_info = {
            'id': req.id,
            'service_name': service.name if service else 'Unknown Service',
            'customer_name': customer.name if customer else 'Unknown Customer',
            'date': req.date_of_request.strftime('%Y-%m-%d'),
            'time': req.time,
            'remarks': req.remarks,
            'status': req.service_status
        }

        # ✅ Categorizing requests
        if req.service_status in ['requested', 'pending']:
            pending.append(request_info)
        elif req.service_status in ['accepted', 'active']:
            active.append(request_info)
        elif req.service_status in ['completed', 'closed']:
            completed.append(request_info)
        elif req.service_status in ['rejected', 'cancelled']:
            rejected.append(request_info)

    # ✅ Response with categorized requests
    return jsonify({
        'pending': pending,
        'active': active,
        'completed': completed,
        'rejected': rejected
    }), 200






# -------------------------------------------------------------------------------------------------------------------------------------------------

# Customer Routes


@app.route('/customer/dashboard/<int:user_id>', methods=['GET'])
@auth_required('token')  # Ensures the user is logged in
@customer_required  # Ensures only customers can access
def customer_dashboard(user_id):
    return jsonify({
        'message': 'Welcome to your profile',
        'id': current_user.id,  # Adding ID
        'name': current_user.name,
        'email': current_user.email,
        'phone': current_user.phone,
        'address': current_user.address,
        'pincode': current_user.pincode  # Added pincode field
    }), 200


@app.route('/customer/home', methods=['GET'])
@auth_required('token')  # Ensures the user is logged in
@customer_required  # Ensures only customers can access
def customer_home():
    try:
        # Fetch services along with provider details using JOIN
        services = db.session.query(
            Service.id,
            Service.name.label('service_name'),
            Service.price,
            Service.timing,
            Service.service_category,
            User.name.label('service_provider')
        ).join(User, Service.user_id == User.id).all()

        # Check if services exist
        if not services:
            return jsonify({'message': 'No services available'}), 404

        # Convert the query result into a list of dictionaries
        service_list = [
            {
                'id': service.id,
                'service_name': service.service_name,
                'price': service.price,
                'timing': service.timing,
                'service_category': service.service_category,
                'service_provider': service.service_provider
            }
            for service in services
        ]

        # Return the service details as JSON
        return jsonify({'services': service_list}), 200

    except Exception as e:
        print(f"Error fetching services: {str(e)}")
        return jsonify({'message': 'Failed to fetch services', 'error': str(e)}), 500

@app.route('/customer/service/<int:service_id>', methods=['GET'])
@auth_required('token')  # Ensures the user is logged in
@customer_required  # Ensures only customers can access
def get_service_details(service_id):
    """
    Route to fetch the detailed information of a specific service.
    """
    service = Service.query.get(service_id)
    
    if not service:
        return jsonify({'message': 'Service not found'}), 404

    # Fetching the provider details
    provider = User.query.get(service.user_id)
    
    # Constructing the detailed response
    service_details = {
        'id': service.id,
        'name': service.name,
        'price': service.price,
        'timing': service.timing,
        'description': service.description,
        'service_category': service.service_category,
        'service_provider': provider.name if provider else 'Unknown'
    }

    return jsonify(service_details), 200


@app.route('/customer/requests', methods=['GET'])
@auth_required('token')           # Ensures the user is authenticated
@customer_required                # Ensures only customers can access
def get_customer_requests():
    """
    Route to fetch all service requests for the current customer grouped by status,
    including both rejected by provider and cancelled by customer in the 'rejected' section.
    """
    customer_id = current_user.id

    # ✅ Fetch all service requests made by the current customer
    requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()

    # ✅ Grouping by status
    pending = []
    active = []
    completed = []
    rejected = []   # Includes both 'rejected' and 'cancelled' requests

    for req in requests:
        service = Service.query.get(req.service_id)

        request_info = {
            'id': req.id,
            'service_name': service.name if service else 'Unknown Service',
            'date': req.date_of_request.strftime('%Y-%m-%d'),
            'time': req.time,
            'remarks': req.remarks,
            'status': req.service_status
        }

        # ✅ Categorizing requests
        if req.service_status in ['requested', 'pending']:
            pending.append(request_info)
        elif req.service_status in ['accepted', 'active']:
            active.append(request_info)
        elif req.service_status in ['completed', 'closed']:
            completed.append(request_info)
        elif req.service_status in ['rejected', 'cancelled']:
            rejected.append(request_info)   # ✅ Combine 'rejected' & 'cancelled'

    # ✅ Response with categorized requests
    return jsonify({
        'pending': pending,
        'active': active,
        'completed': completed,
        'rejected': rejected   # Contains both rejected and cancelled requests
    }), 200
