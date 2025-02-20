from functools import wraps
import os
from flask_login import current_user
from flask_restful import Api, Resource, fields, marshal_with, reqparse
from flask_security import auth_required
from backend.models import User, Role, db
from flask import abort, send_file

api = Api(prefix='/api')

# Restul fields for Admin Accept , Reject Application

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
    @admin_required
    def get(self, service_professional_id):
        service_professional = User.query.join(User.roles).filter(
            Role.name == 'service_professional',
            User.id == service_professional_id
        ).first()

        if not service_professional:
            abort(404, description="Service professional not found")

        return service_professional

class ServiceProfessionalStatusAPI(Resource):
    @auth_required('token')
    @admin_required
    def put(self, service_professional_id):
        parser = reqparse.RequestParser()
        parser.add_argument('status', type=str, required=True, help='Status is required')
        args = parser.parse_args()

        status = args['status']

        if status not in ['Yes', 'No']:
            return {'message': 'Invalid status provided'}, 400

        service_professional = User.query.join(User.roles).filter(
            Role.name == 'service_professional',
            User.id == service_professional_id
        ).first()

        if not service_professional:
            return {'message': 'Service professional not found'}, 404

        service_professional.accepted = status
        db.session.commit()

        return {'message': f'Application status updated to {status}'}, 200
    
class ServiceProfessionalResumeAPI(Resource):
    @auth_required('token')
    @admin_required
    def get(self, service_professional_id):
        service_professional = User.query.join(User.roles).filter(
            Role.name == 'service_professional',
            User.id == service_professional_id
        ).first()

        if not service_professional or not service_professional.resume:
            abort(404, description="Resume not found")

        resume_path = service_professional.resume
        if not os.path.exists(resume_path):
            abort(404, description="Resume file not found")

        try:
            return send_file(resume_path, mimetype='application/pdf')
        except Exception as e:
            abort(500, description=f"Error sending resume file: {str(e)}")

api.add_resource(ServiceProfessionalAPI, '/admin/application/<int:service_professional_id>')
api.add_resource(ServiceProfessionalStatusAPI, '/admin/application/<int:service_professional_id>/status')
api.add_resource(ServiceProfessionalResumeAPI, '/admin/application/<int:service_professional_id>/resume')


