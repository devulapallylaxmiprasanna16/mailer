// server.js — Placement Mailer using Resend API

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// ✅ Route to send emails
app.post("/send-mails", async (req, res) => {
  const { subject, body, data } = req.body;

  if (!data || data.length === 0) {
    return res.status(400).json({ message: "No email data provided" });
  }

  let results = [];

  for (const row of data) {
    const { Name, Email } = row;

    // Replace {{Name}} with actual name
    const personalizedBody = body.replace(/{{Name}}/g, Name || "");

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Placement Mailer <onboarding@resend.dev>",
          to: Email,
          subject: subject,
          html: `<p>${personalizedBody}</p>`,
        }),
      });

      if (response.ok) {
        console.log(`✅ Sent to ${Email}`);
        results.push({ Email, status: "sent" });
      } else {
        console.error(`❌ Failed to send to ${Email}`);
        results.push({ Email, status: "failed" });
      }
    } catch (err) {
      console.error(`❌ Error sending to ${Email}: ${err.message}`);
      results.push({ Email, status: "failed" });
    }
  }

  res.json({ message: "Emails processed", results });
});

app.listen(PORT, () =>
  console.log(`🚀 Placement Mailer running at http://localhost:${PORT}`)
);
