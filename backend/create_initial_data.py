from flask import current_app as app
from backend.models import db, User, Role
from flask_security import SQLAlchemyUserDatastore , hash_password

with app.app_context():
    db.create_all()


    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name='admin', description='Admin')
    userdatastore.find_or_create_role(name='service_professional', description='Service professional')
    userdatastore.find_or_create_role(name='customer', description='Customer')


    if not userdatastore.find_user(email = 'admin@example.com'):
        userdatastore.create_user(
            email='admin@example.com',
            password= hash_password('123'),  # Ensure to hash passwords in production
            name='Admin',
            phone=None,
            address=None,
            pincode=None,
            experience=None,
            resume=None,
            service_category=None,
            roles=['admin'],
            accepted=None
        )

    if not userdatastore.find_user(email = 'pro@example.com'):
        userdatastore.create_user(
            email='pro@example.com',
            password= hash_password('1234'),  # Ensure to hash passwords in production
            name='Service Pro',
            phone='9876543210',
            address='123 Service Street, Cityville',
            pincode=123456,
            experience=5,
            resume=None,  # Replace with file path if available
            service_category='Plumber',
            roles=['service_professional'],
            accepted='Yes'
        )

    if not userdatastore.find_user(email = 'customer@example.com'):
        userdatastore.create_user(
            email='customer@example.com',
            password= hash_password('12345'),  # Ensure to hash passwords in production
            name='Customer',
            phone='9876501234',
            address='456 Customer Lane, Townsville',
            pincode=654321,
            experience=None,
            resume=None,
            service_category=None,
            roles=['customer']
        )


    db.session.commit()
    