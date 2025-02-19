from flask import current_app as app
from backend.models import db, User, Role
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name='admin', description='Admin')
    userdatastore.find_or_create_role(name='service_professional', description='Service professional')
    userdatastore.find_or_create_role(name='customer', description='Customer')

    if not userdatastore.find_user(email='admin@example.com'):
        userdatastore.create_user(
            email='admin@example.com',
            password=hash_password('123'),
            name='Admin',
            roles=['admin'],
            accepted=None  # No accepted status for admin
        )

    if not userdatastore.find_user(email='customer@example.com'):
        userdatastore.create_user(
            email='customer@example.com',
            password=hash_password('12345'),
            name='Customer',
            roles=['customer'],
            accepted=None  # No accepted status for customer
        )

    db.session.commit()
