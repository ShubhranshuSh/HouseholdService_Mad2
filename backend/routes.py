from functools import wraps
import os
from flask import current_app as app, jsonify, request, render_template
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
        return jsonify({'message': 'Login failed, Contact Admin'}), 403

    # Service Professional validation
    if "service_professional" in [role.name for role in user.roles]:
        if user.accepted == "Pending":
            return jsonify({'message': 'Your Application Status is Under Process'}), 403
        elif user.accepted == "No":
            return jsonify({'message': 'Your Application got Rejected'}), 403

    if verify_password(password, user.password):
        login_user(user)

        role = [role.name for role in user.roles]

        if 'admin' in role:
            redirect_path = '/admin/home'
        elif 'service_professional' in role:
            redirect_path = '/service_professional/home'
        elif 'customer' in role:
            redirect_path = '/customer/home'
        else:
            redirect_path = '/'

        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': role,
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