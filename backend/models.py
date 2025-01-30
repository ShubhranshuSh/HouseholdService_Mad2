from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin


db = SQLAlchemy()


# User table to store the user details
class User(db.Model , UserMixin):
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
    accepted = db.Column(db.String(10), default='Pending', nullable=False)  # 'Yes', 'No', 'Pending'

#Role table to define the roles of the user
class Role(db.Model , RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)



# association table for Many-to-Many relationship between User and Role
class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

