import csv
import os
from celery import shared_task
import time
import flask_excel
from backend.celery.mail_service import send_email
from backend.models import *
from sqlalchemy.orm import joinedload

@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)
    return x + y

@shared_task(ignore_result=False)
def create_csv():
    """
    Export service requests closed by professionals into a CSV file.
    """
    try:
        # ✅ Query all service requests
        requests = ServiceRequest.query.all()

        # ✅ Prepare CSV data
        output_path = './backend/celery/user-downloads/service_requests.csv'

        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # ✅ Write to CSV
        with open(output_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)

            # CSV Header
            writer.writerow([
                "Service ID", "Customer ID", "Professional ID",
                "Date of Request", "Status", "Remarks", "Time", "Rating", "Feedback"
            ])

            # Write rows
            for req in requests:
                writer.writerow([
                    req.service_id, 
                    req.customer_id, 
                    req.professional_id, 
                    req.date_of_request.strftime('%Y-%m-%d %H:%M:%S') if req.date_of_request else '',
                    req.service_status, 
                    req.remarks, 
                    req.time,
                    req.rating if req.rating is not None else '', 
                    req.feedback if req.feedback else ''
                ])

        return 'service_requests.csv'

    except Exception as e:
        print(f"Error exporting CSV: {str(e)}")
        return None
    
# ✅ Daily Reminder Task
@shared_task(ignore_result=True)
def send_daily_reminders():
    """
    Send daily reminders to service professionals with pending/unvisited service requests.
    """
    try:
        # ✅ Use eager loading to include professionals
        pending_requests = ServiceRequest.query.options(
            joinedload(ServiceRequest.professional)  # Eager load the relationship
        ).filter(
            ServiceRequest.service_status.in_(['requested', 'unvisited'])  # Use DB statuses
        ).all()

        if not pending_requests:
            print("⚠️ No requested/unvisited requests found.")
            return

        print(f"🔍 Found {len(pending_requests)} requested/unvisited requests.")

        # ✅ Collect unique professional emails
        professionals = {
            getattr(req.professional, 'email', None)
            for req in pending_requests if req.professional
        }

        if not professionals:
            print("⚠️ No professionals linked to requests.")
            return

        print(f"✅ Sending reminders to {len(professionals)} professionals.")

        # ✅ Send reminder emails
        for email in professionals:
            if email:
                subject = "🔔 Reminder: Pending Service Requests"
                content = """
                    <h1>Reminder</h1>
                    <p>You have pending/unvisited service requests. 
                    Please review and take appropriate action.</p>
                """
                send_email(email, subject, content)
                print(f"📧 Reminder sent to: {email}")

        print(f"✅ Reminders sent successfully to {len(professionals)} professionals.")

    except Exception as e:
        print(f"❌ Error sending reminders: {str(e)}")


# ✅ Monthly Report Task
@shared_task(ignore_result=True)
def send_monthly_reports():
    """
    Send monthly service reports to customers.
    """
    try:
        # ✅ Get all customers with service requests
        customers = User.query.join(ServiceRequest, User.id == ServiceRequest.customer_id).all()

        for customer in customers:
            # Generate the monthly report content
            report_content = f"""
                <h1>Monthly Service Report</h1>
                <p>Hello {customer.name},</p>
                <p>Here is your service activity report for the month:</p>
                <ul>
            """

            # Fetch customer requests
            requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
            
            if not requests:
                continue

            for req in requests:
                report_content += f"""
                    <li>
                        <strong>Service:</strong> {req.service.name} <br>
                        <strong>Status:</strong> {req.service_status} <br>
                        <strong>Date:</strong> {req.date_of_request.strftime('%Y-%m-%d')}
                    </li>
                """

            report_content += "</ul>"

            # Send the email
            send_email(customer.email, "📊 Monthly Service Report", report_content)

        print(f"✅ Sent monthly reports to {len(customers)} customers.")

    except Exception as e:
        print(f"Error sending monthly reports: {str(e)}")
