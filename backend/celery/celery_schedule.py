from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import send_daily_reminders, send_monthly_reports

celery_app = app.extensions["celery"]

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # ✅ Daily Reminder Task → Every day at 6:00 PM
    sender.add_periodic_task(
        crontab(minute='*/1'),   # Run every 1 minute
        send_daily_reminders.s(),
        name='daily_reminder_task'
    )

    # ✅ Monthly Report Task → 1st day of every month at 10:00 AM
    sender.add_periodic_task(
        crontab(minute='*/2'),   # Run every 2 minutes
        send_monthly_reports.s(),
        name='monthly_report_task'
    )
