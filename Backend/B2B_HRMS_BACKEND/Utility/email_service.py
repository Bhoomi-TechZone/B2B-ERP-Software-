import smtplib
import ssl
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr
import base64
from typing import Optional, Tuple, Dict, Any, List
import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Global cache for dynamic email settings (updated at app startup and whenever settings are saved)
_cached_email_settings: Dict[str, Any] = {}

def set_cached_email_settings(settings: Any) -> None:
    """Update in-memory email settings cache"""
    global _cached_email_settings
    try:
        if hasattr(settings, "model_dump"):
            _cached_email_settings = settings.model_dump()
        elif hasattr(settings, "dict"):
            _cached_email_settings = settings.dict()
        elif isinstance(settings, dict):
            _cached_email_settings = dict(settings)
        logger.info(f"Updated dynamic email settings cache (provider={_cached_email_settings.get('email_provider')})")
    except Exception as e:
        logger.error(f"Failed to update email settings cache: {e}")

def get_current_email_config() -> Dict[str, Any]:
    """
    Resolve email configuration dynamically:
    1. Check dynamic _cached_email_settings
    2. Fallback to .env environment variables
    """
    try:
        load_dotenv(override=True)
    except Exception:
        pass

    host = _cached_email_settings.get("smtp_host") or os.getenv("EMAIL_HOST", "smtp.gmail.com")
    
    port_val = _cached_email_settings.get("smtp_port") or os.getenv("EMAIL_PORT", "587")
    try:
        port = int(port_val)
    except Exception:
        port = 587

    username = _cached_email_settings.get("smtp_username") or os.getenv("EMAIL_ADDRESS", "")
    raw_pwd = _cached_email_settings.get("smtp_password") or os.getenv("EMAIL_PASSWORD", "")
    password = raw_pwd.replace(" ", "") if raw_pwd else ""

    use_tls_val = _cached_email_settings.get("smtp_use_tls")
    if use_tls_val is None:
        use_tls = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
    else:
        use_tls = bool(use_tls_val)

    sender = (
        _cached_email_settings.get("email_sender")
        or username
        or os.getenv("EMAIL_ADDRESS")
        or "noreply@workmatrix.com"
    )

    frontend_url = (
        _cached_email_settings.get("frontend_url")
        or os.getenv("FRONTEND_URL")
        or "http://localhost:5679"
    ).strip().rstrip("/")

    return {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "use_tls": use_tls,
        "sender": sender,
        "frontend_url": frontend_url
    }

def get_email_config() -> Tuple[str, int, str, str, bool]:
    """Legacy helper maintained for backward compatibility"""
    cfg = get_current_email_config()
    return cfg["host"], cfg["port"], cfg["username"], cfg["password"], cfg["use_tls"]

# Legacy global fallbacks
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
try:
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
except Exception:
    EMAIL_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
pwd = os.getenv("EMAIL_PASSWORD")
EMAIL_PASSWORD = pwd.replace(" ", "") if pwd else ""
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"


def dispatch_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    custom_config: Optional[Dict[str, Any]] = None,
    reply_to: Optional[str] = None,
    sender_name: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None
) -> Tuple[bool, str]:
    """
    Central dynamic email dispatcher.
    Sends emails via dynamic SMTP Server (supporting TLS on 587 or SSL on 465).
    """
    cfg = get_current_email_config()
    if custom_config:
        for k, v in custom_config.items():
            if v is not None and v != "":
                cfg[k] = v

    sender = cfg.get("sender") or cfg.get("username") or "noreply@workmatrix.com"
    host = cfg.get("host", "smtp.gmail.com")
    try:
        port = int(cfg.get("port", 587))
    except Exception:
        port = 587
    username = cfg.get("username", "")
    password = (cfg.get("password") or "").replace(" ", "")
    use_tls = cfg.get("use_tls", True)

    if attachments:
        message = MIMEMultipart("mixed")
        body_part = MIMEMultipart("alternative")
        if text_content:
            body_part.attach(MIMEText(text_content, "plain"))
        body_part.attach(MIMEText(html_content, "html"))
        message.attach(body_part)

        for att in attachments:
            try:
                fname = att.get("filename", "attachment")
                content = att.get("content")
                if isinstance(content, str):
                    if "," in content:
                        content = content.split(",", 1)[1]
                    raw_bytes = base64.b64decode(content)
                elif isinstance(content, bytes):
                    raw_bytes = content
                else:
                    continue

                part = MIMEBase("application", "octet-stream")
                part.set_payload(raw_bytes)
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f'attachment; filename="{fname}"')
                message.attach(part)
            except Exception as att_err:
                logger.error(f"Failed to attach file {att.get('filename')}: {att_err}")
    else:
        message = MIMEMultipart("alternative")
        if text_content:
            message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))

    message["Subject"] = subject
    if sender_name:
        message["From"] = formataddr((sender_name, sender))
    else:
        message["From"] = sender

    message["To"] = to_email
    if reply_to:
        message["Reply-To"] = reply_to

    max_retries = 2
    for attempt in range(1, max_retries + 1):
        try:
            context = ssl.create_default_context()
            if port == 465:
                with smtplib.SMTP_SSL(host, port, context=context, timeout=25) as server:
                    server.ehlo()
                    if username and password:
                        server.login(username, password)
                    server.sendmail(sender, to_email, message.as_string())
            else:
                with smtplib.SMTP(host, port, timeout=25) as server:
                    server.ehlo()
                    if use_tls:
                        server.starttls(context=context)
                        server.ehlo()
                    if username and password:
                        server.login(username, password)
                    server.sendmail(sender, to_email, message.as_string())

            print(f"📧 [SMTP SUCCESS] Email successfully sent via SMTP ({host}:{port}) to {to_email}")
            logger.info(f"Email sent successfully via SMTP ({host}:{port}) to {to_email}")
            return True, f"Email sent successfully via SMTP ({host}:{port})"
        except smtplib.SMTPAuthenticationError as e:
            err = f"SMTP Authentication failed: {e.smtp_error.decode() if isinstance(e.smtp_error, bytes) else str(e)}"
            print(f"❌ [SMTP AUTH ERROR] {err}")
            logger.error(err)
            return False, err
        except Exception as e:
            err = f"SMTP error: {str(e)}"
            if attempt < max_retries:
                print(f"⚠️ [SMTP RETRY] Attempt {attempt} failed ({err}). Retrying in 1.5s...")
                time.sleep(1.5)
            else:
                print(f"❌ [SMTP GENERAL ERROR] {err}")
                logger.error(f"Failed to send email via SMTP to {to_email}: {err}", exc_info=True)
                return False, err


class EmailService:
    """Service for sending emails dynamically via SMTP Server"""
    
    @staticmethod
    def send_verification_email(
        to_email: str,
        verification_token: str,
        first_name: str = "User",
        company_name: str = "Your Company"
    ) -> bool:
        """
        Send email verification email
        
        Args:
            to_email: Recipient email address
            verification_token: Plain text verification token
            first_name: User's first name
            company_name: Company name
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            cfg = get_current_email_config()
            frontend_url = cfg.get("frontend_url", "http://localhost:5679")
            verification_url = f"{frontend_url}/verify-email?token={verification_token}"
            
            logger.info(f"Verification link generated for {to_email}: {verification_url}")
            print(f"🔗 [EMAIL VERIFICATION LINK] {to_email} -> {verification_url}")
            
            subject = "Verify Your Email - Complete Your Registration"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
                    .token-box {{ background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Our Platform!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi {first_name},</h2>
                        <p>Thank you for registering <strong>{company_name}</strong> with us! We're excited to have you on board.</p>
                        
                        <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="{verification_url}" class="button">Verify Email Address</a>
                        </div>
                        
                        <p><strong>Or copy and paste this link into your browser:</strong></p>
                        <div class="token-box">
                            {verification_url}
                        </div>
                        
                        <h3>What's Next?</h3>
                        <ol>
                            <li>Click the verification button above</li>
                            <li>Complete your onboarding process</li>
                            <li>Start using your 14-day free trial</li>
                        </ol>
                        
                        <p><strong>Note:</strong> This verification link will expire in 48 hours.</p>
                        
                        <p>If you didn't create this account, you can safely ignore this email.</p>
                        
                        <p>Best regards,<br>
                        <strong>The Platform Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; 2026 Your Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Welcome to Our Platform!
            
            Hi {first_name},
            
            Thank you for registering {company_name} with us! We're excited to have you on board.
            
            To complete your registration and activate your account, please verify your email address by clicking the link below:
            
            {verification_url}
            
            What's Next?
            1. Click the verification link above
            2. Complete your onboarding process
            3. Start using your 14-day free trial
            
            Note: This verification link will expire in 48 hours.
            
            If you didn't create this account, you can safely ignore this email.
            
            Best regards,
            The Platform Team
            
            ---
            This is an automated message, please do not reply to this email.
            © 2026 Your Platform. All rights reserved.
            """
            
            success, _ = dispatch_email(to_email, subject, html_content, text_content)
            return success
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_welcome_email(
        to_email: str,
        first_name: str = "User",
        company_name: str = "Your Company"
    ) -> bool:
        """
        Send welcome email after successful verification
        """
        try:
            subject = f"Welcome to the Platform, {first_name}!"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Welcome Aboard, {first_name}! 🎉</h2>
                <p>Your account for <strong>{company_name}</strong> has been successfully activated!</p>
                <p>You can now log in and start exploring all the features.</p>
                <p>Happy to have you with us!</p>
            </body>
            </html>
            """
            
            success, _ = dispatch_email(to_email, subject, html_content)
            return success
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_password_reset_email(
        to_email: str,
        token: str,
        first_name: str = "User"
    ) -> bool:
        """
        Send password reset email with secure token link
        """
        try:
            cfg = get_current_email_config()
            frontend_url = cfg.get("frontend_url", "http://localhost:5679")
            reset_url = f"{frontend_url.rstrip('/')}/reset-password?token={token}"
            print(f"🔗 [PASSWORD RESET LINK] {to_email} -> {reset_url}")

            subject = "Reset Your WorkMatrix Password"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }}
                    .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }}
                    .header {{ background: #0f172a; padding: 32px 24px; text-align: center; }}
                    .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
                    .content {{ padding: 36px 32px; }}
                    .btn {{ display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 24px 0; }}
                    .token-box {{ background-color: #f1f5f9; padding: 14px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px; color: #475569; }}
                    .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>WorkMatrix</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>Hi {first_name},</p>
                        <p>We received a request to reset your password. Click the button below to set a new password:</p>
                        <div style="text-align: center;">
                            <a href="{reset_url}" class="btn">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <div class="token-box">{reset_url}</div>
                        <p style="margin-top: 24px; font-size: 13px; color: #64748b;"><strong>Note:</strong> This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 WorkMatrix. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"Hi {first_name},\n\nReset your WorkMatrix password using this link:\n{reset_url}\n\nThis link expires in 1 hour."

            success, _ = dispatch_email(to_email, subject, html_content, text_content)
            return success
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_trial_reminder_email(
        to_email: str,
        first_name: str = "User",
        company_name: str = "Your Company",
        days_remaining: int = 7
    ) -> bool:
        """Send trial expiration reminder email"""
        try:
            cfg = get_current_email_config()
            frontend_url = cfg.get("frontend_url", "http://localhost:5679")
            billing_url = f"{frontend_url}/billing"

            subject = f"Your Free Trial for {company_name} is Ending in {days_remaining} Days!"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
                    <h2 style="color: #4f46e5; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Trial Period Ending Soon ⏳</h2>
                    <p>Hi {first_name},</p>
                    <p>We hope you are enjoying your free trial of B2B HRMS for <strong>{company_name}</strong>!</p>
                    <p>This is a quick reminder that your 14-day free trial will expire in <strong>{days_remaining} days</strong>.</p>
                    <p>To ensure uninterrupted access to all platform features, employee databases, attendance, and payroll modules, please configure your payment details and active subscription now.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{billing_url}" 
                           style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
                           Configure Payment & Subscribe
                        </a>
                    </div>
                    <p>If you have any questions or need an extension, please contact our support team.</p>
                    <p>Best regards,<br><strong>B2B HRMS Support Team</strong></p>
                </div>
            </body>
            </html>
            """
            
            success, _ = dispatch_email(to_email, subject, html_content)
            return success
        except Exception as e:
            logger.error(f"Failed to send trial reminder email to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_trial_expired_email(
        to_email: str,
        first_name: str = "User",
        company_name: str = "Your Company"
    ) -> bool:
        """Send trial expired email (Soft Lockout)"""
        try:
            cfg = get_current_email_config()
            frontend_url = cfg.get("frontend_url", "http://localhost:5679")
            billing_url = f"{frontend_url}/billing"

            subject = f"Your Free Trial for {company_name} Has Expired (Action Required)"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
                    <h2 style="color: #ea580c; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Your Trial Has Expired 🔒</h2>
                    <p>Hi {first_name},</p>
                    <p>The free trial period for <strong>{company_name}</strong> has officially ended.</p>
                    <p>To protect your configurations and business continuity, your tenant has been placed in a <strong>grace period soft-lockout</strong>. You will not be able to access main HR services or run payroll until an active payment is made.</p>
                    <p>Please enter your payment method today to reactivate your workspace and unlock all features immediately.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{billing_url}" 
                           style="background-color: #ea580c; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
                           Complete Payment
                        </a>
                    </div>
                    <p>If payment is not completed within 7 days, your account will be fully suspended.</p>
                    <p>Best regards,<br><strong>B2B HRMS Support Team</strong></p>
                </div>
            </body>
            </html>
            """
            
            success, _ = dispatch_email(to_email, subject, html_content)
            return success
        except Exception as e:
            logger.error(f"Failed to send trial expired email to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_trial_suspended_email(
        to_email: str,
        first_name: str = "User",
        company_name: str = "Your Company"
    ) -> bool:
        """Send trial suspended email (Day +7)"""
        try:
            cfg = get_current_email_config()
            frontend_url = cfg.get("frontend_url", "http://localhost:5679")
            billing_url = f"{frontend_url}/billing"

            subject = f"CRITICAL: Your B2B HRMS Workspace for {company_name} Has Been Suspended"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
                    <h2 style="color: #dc2626; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Workspace Suspended ⚠️</h2>
                    <p>Hi {first_name},</p>
                    <p>Your B2B HRMS tenant for <strong>{company_name}</strong> has been <strong>suspended</strong> because the 7-day grace period following trial expiration passed without payment.</p>
                    <p>All active sessions are terminated, and access to all administrative, employee, and payroll modules is completely blocked. Your configurations are saved, but must be unlocked by making a payment.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{billing_url}" 
                           style="background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
                           Pay Now & Reactivate Workspace
                        </a>
                    </div>
                    <p>Please log in to your billing dashboard or contact Superadmin to resolve this balance immediately.</p>
                    <p>Best regards,<br><strong>B2B HRMS Support Team</strong></p>
                </div>
            </body>
            </html>
            """
            
            success, _ = dispatch_email(to_email, subject, html_content)
            return success
        except Exception as e:
            logger.error(f"Failed to send trial suspended email to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_trial_converted_email(
        to_email: str,
        first_name: str = "User",
        company_name: str = "Your Company"
    ) -> bool:
        """Send trial converted to paid active email"""
        try:
            subject = f"Thank You! Your Subscription for {company_name} is Now Active 🎉"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
                    <h2 style="color: #16a34a; border-bottom: 2px solid #eef2f6; padding-bottom: 10px;">Welcome to Paid Plan! 🌟</h2>
                    <p>Hi {first_name},</p>
                    <p>Thank you for subscribing to B2B HRMS for <strong>{company_name}</strong>!</p>
                    <p>We are delighted to confirm that your payment/subscription was successfully processed. Your tenant status has been updated to <strong>Active</strong>, and your workspace is fully unlocked with no trial limitations.</p>
                    <p>Enjoy building a great workplace with our automated attendance, leaves, shift management, and payroll integrations!</p>
                    <p>Best regards,<br><strong>B2B HRMS Team</strong></p>
                </div>
            </body>
            </html>
            """
            
            success, _ = dispatch_email(to_email, subject, html_content)
            return success
        except Exception as e:
            logger.error(f"Failed to send trial converted email to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_custom_email(
        to_email: str,
        subject: str,
        body_text: str,
        reply_to: Optional[str] = None,
        sender_name: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[bool, str]:
        """Send custom HTML email to a lead with optional attachments and reply-to"""
        try:
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eef2f6; border-radius: 8px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h2 style="margin: 0; font-size: 20px;">Message from Sales Team</h2>
                    </div>
                    <div style="padding: 24px; background-color: #ffffff; white-space: pre-wrap;">{body_text}</div>
                    <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eef2f6; color: #888; font-size: 11px;">
                        This email was sent via the B2B HRMS Portal.
                    </div>
                </div>
            </body>
            </html>
            """
            
            success, msg = dispatch_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content,
                text_content=body_text,
                reply_to=reply_to,
                sender_name=sender_name,
                attachments=attachments
            )
            return success, msg
        except Exception as e:
            logger.error(f"Failed to send custom email to {to_email}: {str(e)}", exc_info=True)
            return False, str(e)

    @staticmethod
    def send_test_email(to_email: str, custom_config: Optional[Dict[str, Any]] = None) -> Tuple[bool, str]:
        """
        Send a test email to verify email server configuration
        """
        subject = "WorkMatrix HRMS - Test Email Verification"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8faff;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dce9ff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #1251C5 0%, #0d3d9e 100%); color: white; padding: 30px; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px;">Test Email Successful! ✉️</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">WorkMatrix Platform Email System</p>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px;">Hello,</p>
                    <p>This is a test message to confirm that your <strong>WorkMatrix Platform Email Settings</strong> are properly configured and operational.</p>
                    
                    <div style="background: #f0f5ff; border: 1px solid #dce9ff; border-left: 4px solid #1251C5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0 0 5px 0; font-weight: bold; color: #1251C5;">Connection Status: Online</p>
                        <p style="margin: 0; font-size: 13px; color: #475569;">Emails for account registration, invitations, and alerts will be sent using this configuration.</p>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">If you received this message, no further action is required for your email setup.</p>
                </div>
                <div style="background: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                    &copy; 2026 WorkMatrix HRMS. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """
        text_content = "WorkMatrix HRMS - Test Email Verification\n\nYour email server configuration is working properly!"
        return dispatch_email(to_email, subject, html_content, text_content, custom_config)


# Convenience functions maintaining exact backward compatibility
def send_verification_email(to_email: str, token: str, first_name: str = "User", company_name: str = "Company") -> bool:
    """Send verification email (convenience function)"""
    return EmailService.send_verification_email(to_email, token, first_name, company_name)


def send_welcome_email(to_email: str, first_name: str = "User", company_name: str = "Company") -> bool:
    """Send welcome email (convenience function)"""
    return EmailService.send_welcome_email(to_email, first_name, company_name)


def send_invitation_email(
    to_email: str,
    invitation_url: str,
    invited_by_name: str = "Team",
    role: str = "team member",
    company_name: str = "the platform"
) -> bool:
    """Send team invitation email (convenience function)"""
    try:
        print(f"🔗 [INVITATION LINK] {to_email} -> {invitation_url}")
        subject = f"You're invited to join {company_name}!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>You're Invited!</h1>
                </div>
                <div class="content">
                    <h2>Hello!</h2>
                    <p><strong>{invited_by_name}</strong> has invited you to join <strong>{company_name}</strong> on our platform.</p>
                    
                    <p>Your role will be: <strong>{role.replace('_', ' ').title()}</strong></p>
                    
                    <div style="text-align: center;">
                        <a href="{invitation_url}" class="button">Accept Invitation</a>
                    </div>
                    
                    <p><strong>Or copy and paste this link into your browser:</strong></p>
                    <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; font-size: 14px;">
                        {invitation_url}
                    </div>
                    
                    <p><strong>Note:</strong> This invitation link will expire in 7 days.</p>
                    
                    <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
                    
                    <p>Best regards,<br>
                    <strong>The {company_name} Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>&copy; 2026 {company_name}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        You're Invited!
        
        Hello!
        
        {invited_by_name} has invited you to join {company_name} on our platform.
        
        Your role will be: {role.replace('_', ' ').title()}
        
        Accept the invitation by clicking the link below:
        
        {invitation_url}
        
        Note: This invitation link will expire in 7 days.
        
        If you weren't expecting this invitation, you can safely ignore this email.
        
        Best regards,
        The {company_name} Team
        
        ---
        This is an automated message, please do not reply to this email.
        © 2026 {company_name}. All rights reserved.
        """
        
        success, _ = dispatch_email(to_email, subject, html_content, text_content)
        return success
        
    except Exception as e:
        logger.error(f"Failed to send invitation email to {to_email}: {str(e)}", exc_info=True)
        return False


def send_password_reset_email(to_email: str, token: str, first_name: str = "User") -> bool:
    return EmailService.send_password_reset_email(to_email, token, first_name)

