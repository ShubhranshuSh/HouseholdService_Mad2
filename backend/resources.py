from functools import wraps
from flask_login import current_user
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required
from backend.models import User, Role
from flask import abort

api = Api(prefix='/api')

service_professional_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'email': fields.String,
    'phone': fields.String,
    'address': fields.String,
    'pincode': fields.Integer,
    'experience': fields.Integer,
    'service_category': fields.String,
}

def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('admin'):
            return {'message': 'Access Denied: Admin only'}, 403
        return func(*args, **kwargs)
    return wrapper

class ServiceProfessionalAPI(Resource):
    @marshal_with(service_professional_fields)
    @auth_required('token')
    @admin_required  # Ensure only admins can access this endpoint
    def get(self, service_professional_id):
        service_professional = User.query.join(User.roles).filter(
            Role.name == 'service_professional',
            User.id == service_professional_id
        ).first()

        if not service_professional:
            abort(404, description="Service professional not found")

        return service_professional

api.add_resource(ServiceProfessionalAPI, '/admin/application/<int:service_professional_id>')
