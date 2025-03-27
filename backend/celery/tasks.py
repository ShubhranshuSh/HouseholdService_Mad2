import csv
import os
from celery import shared_task
import time

import flask_excel
from backend.models import *

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