from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

# User table to store the user details
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(32), nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=True)
    address = db.Column(db.String(512), nullable=True)
    pincode = db.Column(db.Integer, nullable=True)
    experience = db.Column(db.Integer, nullable=True)
    resume = db.Column(db.String(512), nullable=True)
    service_category = db.Column(db.String(32), nullable=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', backref='bearers', secondary='user_roles')
    accepted = db.Column(db.String(10), nullable=True)  # 'Pending' for service professional, null for others

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    timing = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    service_category = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, nullable=False)
    service_status = db.Column(db.String(50), nullable=False)  # e.g., requested, assigned, closed, flagged, rejected
    remarks = db.Column(db.String(255), nullable=True)
    time = db.Column(db.String(5), nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # Rating from customer (1-5)
    feedback = db.Column(db.Text, nullable=True)  # Feedback from customer

    # Relationships
    service = db.relationship('Service', backref='requests')
    customer = db.relationship('User', foreign_keys=[customer_id], backref='service_requests')
    professional = db.relationship('User', foreign_keys=[professional_id], backref='assigned_requests')
