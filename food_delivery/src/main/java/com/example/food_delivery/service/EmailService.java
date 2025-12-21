package com.example.food_delivery.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${email.from.address:no-reply@osahaneat.com}")
    private String fromAddress;
    
    @Value("${email.from.name:OSAHANEAT System}")
    private String fromName;
    
    // Also use spring.mail.username as fallback for fromAddress
    @Value("${spring.mail.username:}")
    private String mailUsername;
    
    /**
     * Gửi email thông báo mật khẩu mới
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String newPassword) {
        try {
            // Use mailUsername if fromAddress is not set or is placeholder
            String actualFromAddress = fromAddress;
            if (actualFromAddress == null || actualFromAddress.isEmpty() || 
                actualFromAddress.contains("your-email") || actualFromAddress.contains("no-reply")) {
                actualFromAddress = mailUsername != null && !mailUsername.isEmpty() ? mailUsername : fromAddress;
                log.info("Using mailUsername as fromAddress: {}", actualFromAddress);
            }
            
            log.info("=== Sending password reset email ===");
            log.info("From: {} ({})", actualFromAddress, fromName);
            log.info("To: {}", toEmail);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(actualFromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Mật khẩu mới của bạn - OSAHANEAT");
            
            String htmlContent = buildPasswordResetEmailHtml(userName, newPassword);
            helper.setText(htmlContent, true);
            
            log.info("Attempting to send email...");
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("❌ Error sending email to {}: {}", toEmail, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending email to {}: {}", toEmail, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi không mong muốn khi gửi email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Gửi email thông báo yêu cầu quên mật khẩu đã được duyệt
     */
    public void sendPasswordResetApprovedEmail(String toEmail, String userName, String newPassword) {
        try {
            log.info("=== Sending password reset approval email ===");
            // Use mailUsername if fromAddress is not set or is placeholder
            String actualFromAddress = fromAddress;
            if (actualFromAddress == null || actualFromAddress.isEmpty() || 
                actualFromAddress.contains("your-email") || actualFromAddress.contains("no-reply")) {
                actualFromAddress = mailUsername != null && !mailUsername.isEmpty() ? mailUsername : fromAddress;
                log.info("Using mailUsername as fromAddress: {}", actualFromAddress);
            }
            log.info("From: {} ({})", actualFromAddress, fromName);
            log.info("To: {}", toEmail);
            log.info("Subject: Yêu cầu đặt lại mật khẩu đã được duyệt - OSAHANEAT");
            log.info("Password length: {}", newPassword != null ? newPassword.length() : 0);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(actualFromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu đặt lại mật khẩu đã được duyệt - OSAHANEAT");
            
            String htmlContent = buildPasswordResetApprovedEmailHtml(userName, newPassword);
            helper.setText(htmlContent, true);
            
            log.info("Attempting to send email...");
            mailSender.send(message);
            log.info("✅ Password reset approval email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("❌ MessagingException when sending password reset approval email to {}: {}", toEmail, e.getMessage());
            log.error("❌ Exception class: {}", e.getClass().getName());
            if (e.getCause() != null) {
                log.error("❌ Cause: {}", e.getCause().getMessage());
            }
            log.error("❌ Full stack trace:");
            e.printStackTrace();
            
            // Provide more specific error message
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Authentication failed")) {
                errorMsg = "Lỗi xác thực email! Vui lòng kiểm tra App Password (phải là 16 ký tự). " + errorMsg;
            } else if (errorMsg != null && errorMsg.contains("535")) {
                errorMsg = "Lỗi xác thực email! App Password không đúng hoặc đã hết hạn. " + errorMsg;
            }
            
            throw new RuntimeException("Không thể gửi email: " + errorMsg, e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending password reset approval email to {}: {}", toEmail, e.getMessage());
            log.error("❌ Exception class: {}", e.getClass().getName());
            log.error("❌ Full stack trace:");
            e.printStackTrace();
            throw new RuntimeException("Lỗi không mong muốn khi gửi email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Build HTML email template cho password reset
     */
    private String buildPasswordResetEmailHtml(String userName, String newPassword) {
        // Escape special characters in password to avoid format string issues
        String escapedPassword = newPassword != null ? newPassword.replace("%", "%%").replace("$", "$$") : "";
        String escapedUserName = userName != null ? userName.replace("%", "%%").replace("$", "$$") : "";
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mật khẩu mới - OSAHANEAT</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">OSAHANEAT</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #667eea; margin-top: 0;">Mật khẩu mới của bạn</h2>
                    
                    <p>Xin chào <strong>%s</strong>,</p>
                    
                    <p>Admin đã cấp lại mật khẩu cho tài khoản của bạn. Dưới đây là thông tin đăng nhập mới:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Mật khẩu mới:</strong></p>
                        <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; letter-spacing: 2px;">%s</p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                        <p style="margin: 0;"><strong>⚠️ Lưu ý quan trọng:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Vui lòng đổi mật khẩu ngay sau khi đăng nhập</li>
                            <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ admin ngay lập tức</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:82/login.html" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Đăng nhập ngay</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        Email này được gửi tự động từ hệ thống OSAHANEAT.<br>
                        Vui lòng không trả lời email này.
                    </p>
                </div>
            </body>
            </html>
            """, escapedUserName, escapedPassword);
    }
    
    /**
     * Build HTML email template cho password reset approved
     */
    private String buildPasswordResetApprovedEmailHtml(String userName, String newPassword) {
        // Escape special characters in password to avoid format string issues
        String escapedPassword = newPassword.replace("%", "%%").replace("$", "$$");
        String escapedUserName = userName != null ? userName.replace("%", "%%").replace("$", "$$") : "";
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Yêu cầu đặt lại mật khẩu đã được duyệt - OSAHANEAT</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">OSAHANEAT</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #28a745; margin-top: 0;">✅ Yêu cầu đặt lại mật khẩu đã được duyệt</h2>
                    
                    <p>Xin chào <strong>%s</strong>,</p>
                    
                    <p>Yêu cầu đặt lại mật khẩu của bạn đã được admin duyệt. Dưới đây là mật khẩu mới của bạn:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Mật khẩu mới:</strong></p>
                        <p style="font-size: 24px; font-weight: bold; color: #28a745; margin: 10px 0; letter-spacing: 2px;">%s</p>
                    </div>
                    
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
                        <p style="margin: 0;"><strong>💡 Gợi ý:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản</li>
                            <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:82/login.html" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Đăng nhập ngay</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        Email này được gửi tự động từ hệ thống OSAHANEAT.<br>
                        Vui lòng không trả lời email này.
                    </p>
                </div>
            </body>
            </html>
            """, escapedUserName, escapedPassword);
    }
    
    /**
     * Gửi email xác nhận đăng ký
     */
    public void sendVerificationEmail(String toEmail, String userName, String verificationLink) {
        try {
            // Use mailUsername if fromAddress is not set or is placeholder
            String actualFromAddress = fromAddress;
            if (actualFromAddress == null || actualFromAddress.isEmpty() || 
                actualFromAddress.contains("your-email") || actualFromAddress.contains("no-reply")) {
                actualFromAddress = mailUsername != null && !mailUsername.isEmpty() ? mailUsername : fromAddress;
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(actualFromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đăng ký tài khoản - OSAHANEAT");
            
            String htmlContent = buildVerificationEmailHtml(userName, verificationLink);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Verification email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("❌ Error sending verification email to {}: {}", toEmail, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email xác nhận: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending verification email to {}: {}", toEmail, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi không mong muốn khi gửi email xác nhận: " + e.getMessage(), e);
        }
    }
    
    /**
     * Build HTML email template cho email verification
     */
    private String buildVerificationEmailHtml(String userName, String verificationLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đăng ký - OSAHANEAT</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">OSAHANEAT</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #667eea; margin-top: 0;">Xác nhận đăng ký tài khoản</h2>
                    
                    <p>Xin chào <strong>%s</strong>,</p>
                    
                    <p>Cảm ơn bạn đã đăng ký tài khoản OSAHANEAT! Để hoàn tất đăng ký, vui lòng xác nhận email của bạn bằng cách click vào nút bên dưới:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Xác nhận email</a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Hoặc copy và paste link sau vào trình duyệt:</p>
                    <p style="color: #667eea; word-break: break-all; font-size: 12px; background: #f0f0f0; padding: 10px; border-radius: 5px;">%s</p>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                        <p style="margin: 0;"><strong>⚠️ Lưu ý:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Link xác nhận có hiệu lực trong 24 giờ</li>
                            <li>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này</li>
                            <li>Sau khi xác nhận, bạn có thể đăng nhập và sử dụng tài khoản</li>
                        </ul>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        Email này được gửi tự động từ hệ thống OSAHANEAT.<br>
                        Vui lòng không trả lời email này.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(userName, verificationLink, verificationLink);
    }
}

