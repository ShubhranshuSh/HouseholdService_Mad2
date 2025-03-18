from functools import wraps
import os
from flask_login import current_user
from flask_restful import Api, Resource, fields, marshal_with, reqparse
from flask_security import auth_required
from backend.models import User, Role, db, Service , ServiceRequest
from datetime import datetime
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

api.add_resource(ServiceProfessionalAPI, '/admin/application/<int:service_professional_id>')
api.add_resource(ServiceProfessionalStatusAPI, '/admin/application/<int:service_professional_id>/status')
api.add_resource(ServiceProfessionalResumeAPI, '/admin/application/<int:service_professional_id>/resume')
    
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




# ----------------- Service Request API -----------------

service_request_fields = {
    'id': fields.Integer,
    'service_id': fields.Integer,
    'customer_id': fields.Integer,
    'professional_id': fields.Integer,
    'date_of_request': fields.DateTime,
    'service_status': fields.String,
    'remarks': fields.String,
    'time': fields.String,
    'rating': fields.Integer,
    'feedback': fields.String
}

class ServiceRequestAPI(Resource):
    @marshal_with(service_request_fields)
    @auth_required('token')
    def post(self, service_id):
        """Create a service request for a specific service"""
        parser = reqparse.RequestParser()
        parser.add_argument('date_of_request', type=str, required=True, help='Date of request is required')
        parser.add_argument('time', type=str, required=True, help='Time is required')
        parser.add_argument('remarks', type=str, required=False)

        args = parser.parse_args()

        # Validate customer role
        if not current_user.has_role('customer'):
            return {'message': 'Only customers can create service requests'}, 403

        # Validate the service existence
        service = Service.query.get(service_id)
        if not service:
            return {'message': 'Service not found'}, 404

        # Validate date format
        try:
            date_of_request = datetime.strptime(args['date_of_request'], '%Y-%m-%d')
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

        # Create new service request
        new_request = ServiceRequest(
            service_id=service_id,
            customer_id=current_user.id,
            professional_id=service.user_id,
            date_of_request=date_of_request,
            time=args['time'],
            service_status='requested',
            remarks=args.get('remarks', None)
        )

        db.session.add(new_request)
        db.session.commit()

        return new_request, 201


# ✅ Register the new Service Request API route
api.add_resource(ServiceRequestAPI, '/customer/service/request/<int:service_id>')