from functools import wraps
from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, verify_password, hash_password, login_required , current_user , logout_user , login_user
from backend.models import db
import os

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
@auth_required()
def protected():
    return "This is an authenticated user."


# Login routes
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
        return jsonify({'message': 'Login failed , Contact Admin'}), 403

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
            'role': role,  # Return roles as a list
            'id': user.id,
            'redirect_url': redirect_path  # Add redirect URL
        }), 200


    return jsonify({'message': 'Incorrect password'}), 400


# Register routes

@app.route('/register/customer', methods=['POST'])
def register_customer():
    data = request.get_json()

    # Extract fields from the request data
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')  # Fixed field name to match Postman input
    name = data.get('name')  # Fixed field name to match Postman input
    phone = data.get('phone')
    address = data.get('address')
    pincode = data.get('pincode')
    exeprience = data.get('experience')  # Fixed field name to match Postman input
    resume = data.get('resume')  # Fixed field name to match Postman input
    service_category = data.get('service_category')  # Fixed field name to match Postman input


    # Input validation: Check required fields
    if not all([email, password, confirm_password, name, phone, address, pincode , exeprience, resume, service_category]):
        return jsonify({'message': 'All fields are required'}), 400

    # Validate password confirmation
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    # Check if user already exists
    user = app.security.datastore.find_user(email=email)
    if user:
        return jsonify({'message': 'User already exists'}), 409

    # Assign customer role
    role = app.security.datastore.find_role('service_professional')
    if not role:
        return jsonify({'message': 'Customer role is invalid. Please contact admin.'}), 400
    
    user = datastore.find_user(email=email)
    if user:
        return jsonify({'message': 'User already exists'}), 409

    # Create a new customer
    try:
        user = app.security.datastore.create_user(
            email=email,
            password=hash_password(password),
            roles=[role],
            name=name,  # Match the updated variable
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

    # Handle file upload
    resume = request.files.get('resume')

    # Input validation: Check required fields
    if not all([email, password, confirm_password, name, phone, address, pincode, experience, service_category, resume]):
        return jsonify({'message': 'All fields are required'}), 400

    # Validate password confirmation
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    # Validate resume file
    if not resume:
        return jsonify({'message': 'Resume file is required'}), 400
    if not resume.filename.endswith('.pdf'):
        return jsonify({'message': 'Invalid resume format. Only PDF files are allowed.'}), 400

    # Save the resume file
    resume_path = os.path.join(UPLOAD_FOLDER, resume.filename)
    resume.save(resume_path)

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
            resume=resume_path,
            service_category=service_category,
            active=True
        )
        db.session.commit()
        return jsonify({'message': 'Service professional registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating service professional user: {e}")
        return jsonify({'message': 'Error creating service professional user'}), 500

# @app.route('/logout', methods=['GET'])
# def logout():
#     logout_user()
#     return jsonify({"message": 'User logged out.'}), 200


# Admin Routes
@app.route('/admin/home', methods=['GET'])
@auth_required('token')  # Ensure only authenticated users can access this
@admin_required  # Ensure only admins can access this
def admin_home():
    try:
        # Just return a success response or minimal content
        return jsonify({"message": "Welcome to the Admin Dashboard"}), 200
    except Exception as e:
        app.logger.error(f"Error loading admin home: {e}")
        return jsonify({"message": "Failed to load admin home"}), 500

       



    

# Service Professional Routes



# Customer Routes