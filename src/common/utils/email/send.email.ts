import nodemailer from "nodemailer";
import { verifyEmailTemplate } from "./templates/verify.email.template";
import { orderPlacedTemplate } from "./templates/notification.templates";
import { lowStockEmailTemplate } from "./templates/low-stock.template";
import { announcementEmailTemplate } from "./templates/annoucment.tempelate";
import { newUserEmailTemplate } from "./templates/new-user.template";

export async function sendConfirmEmail(
  to: string,
  otp: string,
  subject: string,
  title: string,
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Your OTP code is: ${otp}`,
    html: verifyEmailTemplate(otp, title),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

export async function sendOrderNotification({
  to,
  subject,
  customerName,
  orderId,
  totalAmount,
  items,
}: {
  to: string;
  subject: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  items: any[];
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    logger: true, // Add this
    debug: true, // Add this
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: orderPlacedTemplate({ customerName, orderId, totalAmount, items }),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

export async function sendLowStockEmail(
  to: string | string[],
  items: any[],
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject: "⚠️ Alert: Low Stock Items Detected",
    html: lowStockEmailTemplate(items),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Low stock email sent to: ${mailOptions.to}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending low stock email:", error);
    return false;
  }
}

export async function sendAnnouncementEmail({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

   const mailOptions = {
    from: process.env.EMAIL_USER,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject: subject,
    html: announcementEmailTemplate(message, subject),
  };

   try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Low stock email sent to: ${mailOptions.to}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending low stock email:", error);
    return false;
  }

}

export async function sendNewUserEmail(
  to: string,
  subject: string,
  password?: string,
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: newUserEmailTemplate(to, password, subject),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}
