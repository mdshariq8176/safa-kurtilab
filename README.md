# Safa Kurtilab - Luxury E-Commerce Engine

This repository hosts the luxury e-commerce engine and B2B corporate billing platform for **Safa Kurtilab** (Shahpur Jat, New Delhi). The application is built using a modern, premium design system and is optimized for high-performance serverless deployments.

* **Live Storefront Website**: [https://safa-kurtilab-bivv.vercel.app/](https://safa-kurtilab-bivv.vercel.app/)
* **Admin Command Center**: [https://safa-kurtilab-bivv.vercel.app/admin](https://safa-kurtilab-bivv.vercel.app/admin)
* **GitHub Repository**: [github.com/mdshariq8176/safa-kurtilab](https://github.com/mdshariq8176/safa-kurtilab)

---

## 🛠️ Technology Stack
1. **Core Framework**: Next.js 15.5 (App Router & React 19 Server Components)
2. **Styling**: Tailwind CSS 4 with custom variables (Emerald & Gold themes) and Framer Motion for premium micro-animations
3. **Database Client**: Prisma ORM (Object-Relational Mapping)
4. **Cloud Database**: Supabase (PostgreSQL server instance hosted in Mumbai `ap-south-1`)
5. **State Management**: Zustand with `localStorage` persistence and Next.js hydration safety filters
6. **Hosting**: Vercel Serverless (Hobby Tier)

---

## 💾 Database Architecture & Models
The data layer is configured inside [prisma/schema.prisma](file:///d:/Website/prisma/schema.prisma). It maps to our PostgreSQL cloud database:

### 1. `User` Model
Represents B2B corporate buyers and retail guests.
* **Fields**: `id`, `name`, `email`, `password`, `role` (ADMIN, USER)
* **Relationships**: Has a one-to-many relationship with the `Order` model.

### 2. `Product` Model
Represents clothing silhouettes (Anarkalis, Straight Cut, A-Line).
* **Fields**: `id`, `title`, `slug` (unique), `description`, `basePrice`, `discount` (percentage), `images` (string path), `category`.
* **Relationships**: Has a one-to-many relationship with the `Variant` model.

### 3. `Variant` Model
Manages precise size and color inventory levels.
* **Fields**: `id`, `productId`, `size` (S, M, L, XL, XXL), `color`, `stock` (real-time count).

### 4. `Order` Model
Handles invoices, tax computations, and B2B billing details.
* **Fields**: `id`, `userId`, `items` (JSON-stringified snapshot of cart items), `totalAmount`, `gstAmount` (5% computed CGST+SGST), `gstin` (optional B2B details), `companyName`, `paymentStatus` (PAID, PENDING, FAILED), `deliveryStatus` (PROCESSING, SHIPPED, DELIVERED), `trackingId` (3PL Tracking ID), `invoiceData` (JSON snapshot of CGST/SGST/IGST breakdown and HSN), `phone`, `address`, `city`, `state`, `pincode`.

---

## ⚙️ How the Backend Works

### 1. Checkout API Route (`/api/checkout`)
Located in [src/app/api/checkout/route.ts](file:///d:/Website/src/app/api/checkout/route.ts), this handles order completion transactions:
* **Account Auto-Creation**: Checks if the billing email exists in the database. If not, it automatically provisions a new `USER` guest account.
* **Invoice Generation**: Creates an `Order` entry, calculating a strict **5% GST** on the items. Logs the corporate `gstin` and `companyName` if B2B billing is toggled.
* **Inventory Control**: Loops through ordered item combinations and deducts the purchased quantity from the matching `Variant` row in real-time. If stock reaches zero, it flags the item as "Sold Out".

### 2. Products API Route (`/api/products`)
Located in [src/app/api/products/route.ts](file:///d:/Website/src/app/api/products/route.ts), this acts as a search index:
* Evaluates queries (e.g., category filters, specific sizes, colors, or minimum discount thresholds).
* Resolves text search input against product titles and descriptions.

### 3. Payment Webhook & Logistics API (`/api/webhooks/payment`)
Located in [src/app/api/webhooks/payment/route.ts](file:///d:/Website/src/app/api/webhooks/payment/route.ts), this handles automated post-payment processing:
* **State-Wise GST Routing**: Automatically splits tax calculations based on the destination address. If shipping to **West Bengal** (origin warehouse), it splits the 5% GST into **2.5% CGST** and **2.5% SGST**. If shipping to any other state, it applies **5% IGST**.
* **Garment HSN Ingestion**: Dynamically appends the standardized garment HSN code `6208` to every ordered product variant.
* **3PL Logistics Engine**: Integrates with [src/lib/shiprocket.ts](file:///d:/Website/src/lib/shiprocket.ts) to simulate Shiprocket pickup requests, courier assignment, and manifest PDF link generation.
* **Automatic Status Updates**: Sets the Order to `PAID`, schedules dispatch as `SHIPPED`, stores the 3PL tracking reference, and writes the complete invoice payload in the `invoiceData` field.

### 4. Client Cart Logic (`useCart`)
Located in [src/hooks/useCart.ts](file:///d:/Website/src/hooks/useCart.ts), it bridges Zustand state with Next.js rendering:
* Isolates items by combining `productId-size-color` as the cart item ID.
* Automatically stores the cart state inside the browser's `localStorage` so items persist on page reloads.
* Prevents Next.js "Hydration Errors" by checking `isHydrated` status before rendering cart layout numbers.

---

## 🚀 Live Cloud Deployment Setup

The codebase is linked to Vercel and Supabase. To sync updates or rebuild:

### 1. Database Connection Pooler (Supabase)
Serverless architectures open and close connections rapidly, which can crash standard databases. To solve this, we use Supabase connection poolers.
* **DDL / Migration String (Local Terminal)**:
  `postgresql://postgres.mbgzoflqfnxxohzuwqmd:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres` *(Session Mode - port 5432 - used for running `npx prisma db push`)*
* **Vercel Production String**:
  `postgresql://postgres.mbgzoflqfnxxohzuwqmd:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` *(Transaction Mode - port 6543 - configured in Vercel environment variables)*

### 2. Vercel Project Environment Variables
The following keys are configured in Vercel's project dashboard:
* `DATABASE_URL`: Transaction pooler string (listed above)
* `NEXTAUTH_SECRET`: Random hash key for session token encryption
* `NEXT_PUBLIC_APP_URL`: `https://safa-kurtilab-bivv.vercel.app`
* `RAZORPAY_KEY_ID`: Merchant test key ID
* `RAZORPAY_KEY_SECRET`: Merchant test key secret

### 3. Vercel Build Override Command
To prevent outdated Prisma queries in cached serverless environments, Vercel must compile the Prisma Client on every deploy.
* **Build Command**: Go to *Project Settings -> Build & Development Settings* on Vercel and override to:
  ```bash
  npx prisma generate && next build
  ```

---

## 💻 Developer Command Cheat Sheet

Run these commands inside your local terminal within the `d:\Website` workspace:

### Start Development Server
```bash
npm run dev
```

### Apply Schema Changes to Supabase Database
```bash
$env:DATABASE_URL="YOUR_SUPABASE_SESSION_POOLER_CONNECTION_STRING"
npx prisma db push
```

### Repopulate / Reseed Catalog Data
```bash
$env:DATABASE_URL="YOUR_SUPABASE_SESSION_POOLER_CONNECTION_STRING"
node prisma/seed.js
```

### Recompile Prisma Client
```bash
npx prisma generate
```

### Run Linter Checks
```bash
npm run lint
```

### Test Production Build Compilation Locally
```bash
npm run build
```

---

## 📦 Bulk Catalog Onboarding & Wholesale Automation

This repository provides three command-line scripts to automate image uploading, catalog data sync to Supabase, and wholesale vendor outreach.

### 1. WhatsApp Outreach Sequence (`scripts/whatsapp-outreach.py`)
Automatically schedules weekly requests to wholesalers (default targets pre-configured) for new drive catalogues.
* **Prerequisites**:
  - Install Python dependencies: `pip install pywhatkit`
  - Ensure you are logged into WhatsApp Web in your default system browser.
* **Execution**:
  ```bash
  python scripts/whatsapp-outreach.py
  ```

### 2. Bulk Image Cloudinary Uploader (`scripts/upload-images.js`)
Scans local image files and uploads them to the Cloudinary cloud storage instance.
* **Prerequisites**: Place all wholesale Kurti images inside the `raw-images/` folder in the root directory.
* **Execution**:
  ```bash
  node scripts/upload-images.js
  ```
  *Output: Live secured image URLs are mapped and saved in `cloudinary-urls.txt`.*

### 3. Bulk Database Catalog Importer (`scripts/bulk-import.ts`)
Parses product properties and inserts items + 5 automatic size variants (S to XXL) into the live Supabase PostgreSQL server.
* **Prerequisites**: Paste your image URLs inside `products.json` in the root directory.
* **Execution (PowerShell / Command Prompt)**:
  ```bash
  $env:DATABASE_URL="YOUR_SUPABASE_SESSION_POOLER_CONNECTION_STRING"
  npm run bulk-import
  ```

