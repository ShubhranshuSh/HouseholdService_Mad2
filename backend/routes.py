from functools import wraps
import os
from flask import current_app as app, jsonify, request, render_template , abort, send_file
from flask_security import auth_required, verify_password, hash_password, login_required, current_user, logout_user, login_user
from backend.models import db, User, Role

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
            redirect_path = '/admin/home'
        elif role == 'service_professional' and user.accepted == "Yes":
            redirect_path = '/service_professional/profile'  # Ensure profile redirection
        elif role == 'customer':
            redirect_path = '/customer/home'
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
    """Fetch all approved service professionals (Accepted = 'Yes')"""
    professionals = User.query.filter(
        User.roles.any(name="service_professional"),
        User.accepted == "Yes"
    ).all()

    if not professionals:
        return jsonify({"message": "No approved service professionals found"}), 404

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






# -------------------------------------------------------------------------------------------------------------------------------------------------

# Service Professional Routes

@app.route('/service_professional/profile/<int:user_id>', methods=['GET'])
@auth_required('token')  # Ensures the user is logged in
@service_professional_required  # Ensures only service professionals can access
def service_professional_profile(user_id):
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
