from functools import wraps
import os
from flask_login import current_user
from flask_restful import Api, Resource, fields, marshal_with, reqparse
from flask_security import auth_required
from backend.models import User, Role, db, Service
from flask import abort, send_file, request

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

        if args['status'] not in ['Yes', 'No']:
            return {'message': 'Invalid status provided'}, 400

        service_professional = User.query.get(service_professional_id)
        if not service_professional:
            return {'message': 'Service professional not found'}, 404

        service_professional.accepted = args['status']
        db.session.commit()
        return {'message': f'Application status updated to {args["status"]}'}, 200

class ServiceProfessionalResumeAPI(Resource):
    @auth_required('token')
    @admin_required
    def get(self, service_professional_id):
        service_professional = User.query.get(service_professional_id)
        if not service_professional or not service_professional.resume:
            abort(404, description="Resume not found")

        if not os.path.exists(service_professional.resume):
            abort(404, description="Resume file not found")

        return send_file(service_professional.resume, mimetype='application/pdf')
    
# ----------------- Service API -----------------

service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Integer,
    'timing': fields.String,
    'description': fields.String,
    'service_category': fields.String,
    'user_id': fields.Integer
}

class ServiceAPI(Resource):
    @marshal_with(service_fields)
    @auth_required('token')
    def get(self, service_id):
        """Fetch details of a specific service by ID."""
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404
        return service, 200

    @auth_required('token')
    def put(self, service_id):
        service = Service.query.get(service_id)
        if not service or service.user_id != current_user.id:
            return {"message": "Not authorized or service not found"}, 403

        data = request.get_json()
        for key, value in data.items():
            setattr(service, key, value)
        
        db.session.commit()
        return {"message": "Service updated successfully"}, 200

    @auth_required('token')
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service or service.user_id != current_user.id:
            return {"message": "Not authorized or service not found"}, 403

        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted successfully"}, 200

class ServiceListAPI(Resource):
    @auth_required('token')
    def post(self):
        data = request.get_json()
        if not all(k in data for k in ["name", "price", "timing", "description", "service_category"]):
            return {"message": "Missing required fields"}, 400

        new_service = Service(user_id=current_user.id, **data)
        db.session.add(new_service)
        db.session.commit()
        return {"message": "Service created successfully"}, 201


# Register API routes
api.add_resource(ServiceAPI, '/services/<int:service_id>')  # Fetch specific service
api.add_resource(ServiceListAPI, '/services')  # Handle service creation only

api.add_resource(ServiceProfessionalAPI, '/admin/application/<int:service_professional_id>')
api.add_resource(ServiceProfessionalStatusAPI, '/admin/application/<int:service_professional_id>/status')
api.add_resource(ServiceProfessionalResumeAPI, '/admin/application/<int:service_professional_id>/resume')

