# Placement Mailer

Small web app to send emails (placement notices, updates) to a list of faculty/students from an Excel file.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure email credentials:
- Recommended: set environment variables `EMAIL_USER` and `EMAIL_PASS`. For Gmail, generate an *App Password* and set `EMAIL_PASS` to that value.
- Example (Linux/macOS):
```bash
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASS="your-app-password"
npm start
```
- Or create a `.env` (NOT included) and use a library like `dotenv` (not in this demo) — do NOT commit credentials.

3. Run:
```bash
npm start
```
Open http://localhost:3000

## Excel file format (first sheet)
The first sheet should contain at least two columns:
- `Name` (or `name`)
- `Email` (or `email`, `EmailAddress`)

Example (CSV shown):
```
Name,Email
Ram,ram@example.com
Sita,sita@example.com
```

## How it works
- Frontend (browser) parses the uploaded Excel `.xlsx` file using the `xlsx` library.
- Frontend sends `{ subject, body, data }` to POST `/send-mails`.
- Backend (nodemailer) sends emails one-by-one and returns a result array.

## Notes & Security
- Do not store plain text passwords in code or git. Use environment variables.
- If you want faculty members to send from *their own* email accounts, they need to provide their own SMTP credentials (NOT recommended to share plaintext). Alternatively, run this service centrally with a department email and App Password.
- This project is for demonstration/educational use. For production, add rate-limiting, logging, better error handling, and use a transactional email provider (SendGrid, Mailgun, Amazon SES).



## Personalization & HTML templates

You can use template tokens in the email **body** such as `{{Name}}` and `{{Department}}`.  
Example body:
```
Hello {{Name}} from {{Department}},

We are pleased to invite you...
```
The server will replace tokens per row. Newlines in the body will also be converted to basic HTML in the email.

## Docker & deploy

- Build and run with Docker:
```
docker build -t placement-mailer .
docker run -e EMAIL_USER=... -e EMAIL_PASS=... -p 3000:3000 placement-mailer
```

- Or use docker-compose (ensure you have a `.env` with the required env vars):
```
cp .env.example .env
# edit .env and add EMAIL_USER and EMAIL_PASS
./deploy.sh
```
