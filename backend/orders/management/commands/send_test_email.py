from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Send a test email to verify SMTP settings."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            default=None,
            help="Recipient email. Defaults to EMAIL_HOST_USER.",
        )

    def handle(self, *args, **options):
        to_email = options.get("to") or settings.EMAIL_HOST_USER

        if not to_email:
            raise CommandError(
                "No recipient provided. Pass --to or set EMAIL_HOST_USER."
            )

        self.stdout.write("Current mail settings:")
        self.stdout.write("  EMAIL_BACKEND = %s" % settings.EMAIL_BACKEND)
        self.stdout.write("  EMAIL_HOST = %s" % settings.EMAIL_HOST)
        self.stdout.write("  EMAIL_PORT = %s" % settings.EMAIL_PORT)
        self.stdout.write("  EMAIL_USE_TLS = %s" % settings.EMAIL_USE_TLS)
        self.stdout.write("  EMAIL_HOST_USER = %s" % settings.EMAIL_HOST_USER)
        self.stdout.write("  DEFAULT_FROM_EMAIL = %s" % settings.DEFAULT_FROM_EMAIL)

        subject = "ProffMusic test email"
        message = (
            "This is a test email to verify SMTP configuration.\n\n"
            "If you received this message, email sending works correctly.\n"
            "Best regards, ProffMusic team."
        )

        try:
            sent = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [to_email],
                fail_silently=False,
            )
        except Exception as exc:
            self.stderr.write(self.style.ERROR("Error sending email: %s" % exc))
            raise CommandError("SMTP connection failed: %s" % exc)

        if sent:
            self.stdout.write(self.style.SUCCESS("Email sent to %s" % to_email))
        else:
            self.stdout.write(self.style.WARNING("Email NOT sent to %s" % to_email))