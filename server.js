// server.js — Placement Mailer using Gmail SMTP (App Password)

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ✅ Create transporter using Gmail SMTP + App Password
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL_FROM, // your Gmail address
    pass: process.env.EMAIL_PASS, // your 16-character App Password
  },
});

// ✅ Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ Gmail SMTP is ready to send emails");
  }
});

// ✅ Route to send emails
app.post("/send-mails", async (req, res) => {
  const { subject, body, data } = req.body;

  if (!data || data.length === 0) {
    return res.status(400).json({ message: "No email data provided" });
  }

  let results = [];

  for (const row of data) {
    const { Name, Email } = row;

    // Replace {{Name}} in body with actual name
    const personalizedBody = body.replace(/{{Name}}/g, Name || "");

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: Email,
        subject: subject,
        html: `<p>${personalizedBody}</p>`,
      });

      console.log(`✅ Sent to ${Email}`);
      results.push({ Email, status: "sent" });
    } catch (err) {
      console.error(`❌ Failed to send to ${Email}: ${err.message}`);
      results.push({ Email, status: "failed" });
    }
  }

  res.json({ message: "Emails processed", results });
});

// ✅ Start server
app.listen(PORT, () =>
  console.log(`🚀 Placement Mailer running at http://localhost:${PORT}`)
);
