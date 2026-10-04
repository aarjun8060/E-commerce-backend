# School News & Admissions API

Express + MongoDB API for the MERN school website task.

## Scope

This `/api` contains only the backend functionality required by the assignment:

- Admin login with bcrypt-hashed password and JWT
- Public published News & Events listing with pagination
- Public News & Event detail by slug
- Admin News & Events CRUD
- JPG/PNG/WebP image upload, max 2 MB
- Public admission enquiry creation and server-side validation
- Duplicate enquiry protection for the same mobile + class within 24 hours
- CRM webhook delivery with a 5-second timeout
- Admin enquiry listing, pagination, status filtering and status updates
- CRM delivery result visible to administrators
- Optional category filtering for public News & Events

The old e-commerce products, carts, orders and user-app authentication code has been removed because it is outside the assignment scope.

## Requirements

- Node.js 18+
- MongoDB Atlas or MongoDB
- npm

## Setup

```bash
npm install
cp .env.sample .env
```

Fill `.env` with real values. **Never commit `.env` or production credentials.**

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port; defaults to `5000` |
| `CORS_ORIGIN` | No | Next.js origin, e.g. `http://localhost:3000` |
| `MONGODB_URL` | Yes | MongoDB connection string |
| `ADMIN_JWT_SECRET` | Yes | Long random JWT secret |
| `ADMIN_JWT_EXPIRES_IN` | No | JWT lifetime, e.g. `1d` |
| `ADMIN_EMAIL` | For seed | Initial admin email |
| `ADMIN_PASSWORD` | For seed | Initial admin password; minimum 12 characters |
| `ADMIN_NAME` | No | Initial admin display name |
| `CRM_WEBHOOK_URL` | Yes for CRM delivery | webhook.site URL or school CRM webhook |
| `COMPANY_EMAIL` | No | Recipient address for optional admissions email alerts |
| `RESEND_API_KEY` | No | Resend API key for optional admissions email alerts |
| `ADMISSIONS_EMAIL_FROM` | No | Verified sender address for Resend, e.g. `Admissions <admissions@example.org>` |

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Create the initial admin:

```bash
npm run seed:admin
```

The seed script reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `.env`, hashes the password with bcrypt, and creates the admin if it does not already exist.

## API

Base URL:

```text
http://localhost:5000/api/v1
```

### Public

#### List published News & Events

```http
GET /news-events?page=1&limit=10
```

Optional category:

```http
GET /news-events?page=1&limit=10&category=News
```

Categories:

- `News`
- `Event`
- `Achievement`

Results are newest first.

#### Get a published item

```http
GET /news-events/:slug
```

#### Create admission enquiry

```http
POST /enquiries
Content-Type: application/json
```

Example:

```json
{
  "parentName": "Rahul Sharma",
  "studentName": "Aarav Sharma",
  "classApplying": "Grade 1",
  "mobile": "9876543210",
  "email": "parent@example.com",
  "message": "Interested in admission."
}
```

Mobile must be a 10-digit Indian number beginning with `6`, `7`, `8`, or `9`.

If the same mobile number submits an enquiry for the same class within 24 hours, the API returns HTTP `409` with:

```text
We have already received your enquiry.
```

After an enquiry is saved, the API posts it to `CRM_WEBHOOK_URL`. CRM failures/timeouts do not fail the enquiry submission. The enquiry stores `crmStatus` as `Sent` or `Failed` and the response note.

Set `CRM_WEBHOOK_URL` in the API process environment (not the Next.js environment), then restart/redeploy the API. To check a webhook.site endpoint, submit one test enquiry and inspect the captured JSON request. The payload includes the parent's and student's names, phone number, optional email, class, and message, so use a private school CRM endpoint for real enquiries. An admin can retry failed deliveries from the Enquiries screen.

The public enquiry endpoint accepts at most five requests per minute per IP, and admin login accepts at most ten attempts per minute per IP. These limits are in-memory and reset when the API process restarts. An optional email notification is sent through Resend when `RESEND_API_KEY`, `COMPANY_EMAIL`, and `ADMISSIONS_EMAIL_FROM` are configured. Email delivery is best-effort and does not block enquiry creation.

### Admin

First login:

```http
POST /admin/auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "your-admin-password"
}
```

Use the returned JWT on protected endpoints:

```http
Authorization: Bearer <token>
```

#### News & Events

```http
GET    /admin/news-events?page=1&limit=10
POST   /admin/news-events
GET    /admin/news-events/:id
PUT    /admin/news-events/:id
DELETE /admin/news-events/:id
```

Create/update uses `multipart/form-data`.

Fields:

- `title`
- `category`: `News`, `Event`, `Achievement`
- `date`
- `image`: JPG, PNG or WebP, maximum 2 MB
- `shortDescription`
- `content`
- `published`: `true` or `false`

The API generates a unique slug from the title.

#### Enquiries

```http
GET   /admin/enquiries?page=1&limit=10&status=New
PATCH /admin/enquiries/:id/status
POST  /admin/enquiries/:id/retry-crm
```

Status values:

- `New`
- `Contacted`
- `Closed`

The enquiry list includes CRM delivery status and response information.

## Postman

Import:

- `School-News-Admissions.postman_collection.json`
- `School-News-Admissions.postman_environment.json`

The collection has been retained under the existing filename for compatibility with the supplied project, but its contents now cover only the school API.

After running **Admin → Login**, the collection automatically stores the JWT in `adminToken`.

For the multipart News & Event requests, select a local JPG/PNG/WebP file in the `image` field.

## Error handling

Validation errors use HTTP `422` and return field-level errors where applicable.

Common statuses:

- `200` successful read/update
- `201` resource created
- `400` malformed/invalid request
- `401` missing/invalid admin authentication
- `404` resource not found
- `409` duplicate enquiry or slug conflict
- `422` validation failure
- `500` unexpected server error

## Security notes

- Admin passwords are hashed with bcrypt.
- Admin endpoints require a signed JWT.
- Secrets are loaded from environment variables.
- `.env` is ignored by Git.
- Uploaded images are checked by MIME type, file signature and size.
- Public News & Events endpoints expose only published items.
