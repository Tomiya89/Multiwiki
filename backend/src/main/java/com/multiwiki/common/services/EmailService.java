package com.multiwiki.common.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmailChangeCode(String to, String code) throws MessagingException{
        String subject = "Email change confirmation code";
        String content = String.format(
        "<p>Hello!</p>" +
        "<p>To confirm your email change, please enter the following code:</p>" +
        "<h2>%s</h2>" +
        "<p>The code is valid for 10 minutes.</p>" +
        "<p>If you did not request an email change, please ignore this message.</p>",
        code);
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        mailSender.send(message);
    }

  public void sendRegistrationCode(String to, String code) throws MessagingException {
        String subject = "Multiwiki registration confirmation code";
        String content = String.format(
            "<p>Hello!</p>" +
            "<p>Thank you for joining Multiwiki! To complete your registration, please enter the following code:</p>" +
            "<h2>%s</h2>" +
            "<p>The code is valid for 10 minutes.</p>" +
            "<p>If you did not create an account, please ignore this message.</p>",
            code);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }
}
