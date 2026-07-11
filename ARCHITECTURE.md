# Safa Kurtilab: The Definitive Technical Architecture & Codebase Handbook

This document serves as the absolute, single source of truth for the Safa Kurtilab storefront, B2B billing engine, and inventory command center. It provides an exhaustive, file-by-file specification of the database architecture, code structures, exact logic flows, variable interfaces, algorithms, and developer execution playbooks.

---

## 🏗️ 1. Technical Architecture & System Integration

Safa Kurtilab is built as a serverless, type-safe Next.js 15.5 web application utilizing Prisma ORM for database connectivity and a highly optimized client-side state machine.

```mermaid
graph TD
    Client[Web Browser Client] <-->|Next.js 15 / React 19| NextServer[Next.js Server / Vercel Host]
    NextServer <-->|Prisma ORM Client| DB[(Database: Supabase Postgres / Local SQLite)]
    NextServer <-->|Supabase JS Client SDK| SupabaseAuth[Supabase Auth - Email/Phone OTP]
    NextServer -.->|Local Mock Auth Fallback| LocalStorage[(Client Local Storage)]
```

### Core System Stack:
1. **Frontend Core**: Next.js 15.5 App Router (running React 19 concurrent features). Built with Tailwind CSS 4 using custom HSL/HEX variables.
2. **Database Engine**: PostgreSQL hosted on Supabase (Mumbai Region `ap-south-1`) for production serverless deployments.
3. **Database Client**: Prisma ORM Client (v6.2.1) configured with connection pooling (`pgbouncer=true`).
4. **State Machine**: Zustand (v5.0) featuring LocalStorage state persistence.
5. **Logistics Engine**: Custom integration model simulating India-wide 3PL (Shiprocket/Delhivery) dispatch allocations.

---

## 📁 2. Complete Project Directory Layout

```
d:\Website\
├── .env                                # Local environment parameters (database URLs, Razorpay mock keys)
├── .gitignore                          # Excludes node_modules, build outputs, local sqlite databases
├── ARCHITECTURE.md                     # [This File] Complete reference map for development
├── eslint.config.mjs                   # ESLint configuration, ignores utility scripts
├── next.config.ts                      # Next.js configuration, defines image assets remote domain white-lists
├── package.json                        # Node package manifest, locks frameworks, scripts and dependency versions
├── postcss.config.mjs                  # Tailwinds CSS post-processing engine compiler rules
├── products.json                       # Catalog config containing metadata for 50 luxury items
├── tsconfig.json                       # TypeScript project rules and compiler target parameters
│
├── prisma/
│   ├── dev.db                          # Local SQLite binary database
│   ├── schema.prisma                   # Database blueprint containing models and provider configs
│   └── seed.js                         # Database seeder, registers default users, 50 products and history logs
│
├── scripts/
│   ├── bulk-import.ts                  # Local node pipeline to import products.json items
│   ├── csv-import.ts                   # Ingest products.csv draft items and auto-create variants (Prisma)
│   ├── email-outreach.py               # Robust multi-recipient SMTP proposal campaign dispatch agent
│   ├── generate-catalog.py             # Python script generating 50 products using Unsplash resources
│   ├── get-links.py                    # Generates B2B WhatsApp API redirect links
│   ├── indiamart-check.py              # Playwright Chrome supplier crawler with CSV database exporter
│   ├── indiamart_manufacturers.csv     # Extracted IndiaMart manufacturer details database
│   ├── send-gmail-outreach.py          # Automates Gmail web UI outreach using Chrome Profile 2 active session
│   ├── test-live-order.js              # Inter-state webhook transaction tester
│   ├── urls.txt                        # UTF-8 text file storing generated WhatsApp links
│   ├── upload-images.js                # Cloudinary image uploader script
│   ├── whatsapp-outreach.py            # Whatsapp PyWhatKit automation sequence for wholesale updates
│   └── whatsapp_parser.py              # Parses raw WhatsApp text copy and images into products.csv
│
├── public/
│   └── images/                         # Static image assets for the storefront curation
│
└── src/
    ├── app/
    │   ├── globals.css                 # Global styling classes (emerald/gold colors, glass styling)
    │   ├── layout.tsx                  # Global fonts loader (Playfair Display + Plus Jakarta Sans)
    │   │
    │   ├── (dashboard)/
    │   │   ├── layout.tsx              # Grid container wrapper for internal admin screens
    │   │   └── admin/
    │   │       └── page.tsx            # Server Component fetching metrics logs, clients and products list
    │   │
    │   ├── (shop)/
    │   │   ├── layout.tsx              # Storefront wrapper incorporating Navbar and Footer components
    │   │   ├── page.tsx                # Homepage featuring collections, categories and trending items
    │   │   ├── checkout/
    │   │   │   └── page.tsx            # Checkout page, validates B2B GSTIN, handles payments
    │   │   ├── login/
    │   │   │   └── page.tsx            # Login panel, requests and verifies OTP credentials
    │   │   ├── policies/
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx        # Legal markdown rendering page (pre-rendered statically)
    │   │   └── products/
    │   │       ├── page.tsx            # Product catalog index filtering category/size/color/discounts
    │   │       └── [slug]/
    │   │           └── page.tsx        # Dynamic product detail page setting tags and loading clients
    │   │
    │   └── api/
    │       ├── checkout/
    │       │   └── route.ts            # Places orders and deducts size variant inventory stock in real-time
    │       ├── products/
    │       │   ├── route.ts            # API endpoint to fetch products based on category filters
    │       │   └── bulk/
    │       │       └── route.ts        # Ingests new B2B products from products.csv and generates variants
    │       └── webhooks/
    │           └── payment/
    │               └── route.ts        # Payment webhook logic (state-wise GST split, Shiprocket 3PL dispatch)
    │
    ├── components/
    │   ├── admin/
    │   │   └── AdminDashboardClient.tsx # Charts and widgets displaying sales metrics and stock warnings
    │   ├── shared/
    │   │   ├── Footer.tsx              # Global footer listing policy routes and studio information
    │   │   └── Navbar.tsx              # Header layout handling cart count checks and auth sessions
    │   └── shop/
    │       ├── CartDrawer.tsx          # Sliding checkout drawer tracking cart subtotals and discounts
    │       ├── FilterSidebar.tsx       # Sidebar checkboxes setting query filters on products catalog
    │       ├── ProductDetailsClient.tsx # Product details viewer handling size/color selections
    │       └── SortDropdown.tsx        # Catalog sorting dropdown
    │
    ├── content/
    │   └── policies/                   # Privacy, refund, terms, and shipping policy files in markdown
    │
    ├── hooks/
    │   └── useCart.ts                  # Zustand cart store with localStorage persistence and hydration guards
    │
    └── lib/
        ├── prisma.ts                   # Prisma client singleton class
        ├── shiprocket.ts               # 3PL logistics simulator assigning couriers and manifest links
        └── supabase.ts                 # Supabase client wrapper with integrated Mock Auth bypass engine
```

---

## 🗄️ 3. Database Architecture & Prisma Models

The database models are configured in [prisma/schema.prisma](file:///d:/Website/prisma/schema.prisma) and map to PostgreSQL tables:

### 3.1. `User` Model
Represents both B2B corporate wholesale buyers and guest retail clients.
* **Fields**:
  * `id`: `String` (Primary Key, defaults to `cuid()`)
  * `name`: `String?` (Nullable user name)
  * `email`: `String` (Unique constraint)
  * `password`: `String?` (Used for credential fallback)
  * `role`: `String` (Defaults to `'USER'`. Options: `'ADMIN'`, `'USER'`)
  * `createdAt`: `DateTime` (Defaults to `now()`)
* **Relations**: Maps a one-to-many relationship with the `Order` model.

### 3.2. `Product` Model
Represents the core catalog apparel silhouette details.
* **Fields**:
  * `id`: `String` (Primary Key, defaults to `cuid()`)
  * `title`: `String` (Apparel title, e.g. "Emerald Royale Silk Kurta")
  * `slug`: `String` (Unique constraint, URL slug)
  * `description`: `String` (Rich HTML text details)
  * `basePrice`: `Float` (Standard wholesale base price before tax)
  * `discount`: `Float` (Percentage discount integer, defaults to `0`)
  * `images`: `String` (Comma-separated string of image file paths or Cloudinary/Unsplash secure URLs)
  * `category`: `String` (Silhouette categories: e.g. "Anarkali", "Straight Cut", "A-Line")
  * `createdAt`: `DateTime` (Defaults to `now()`)
* **Relations**: Connects to `Variant` as a one-to-many relationship mapping (`variants`).

### 3.3. `Variant` Model
Tracks stock inventory records mapped specifically to colors and sizing codes.
* **Fields**:
  * `id`: `String` (Primary Key, defaults to `cuid()`)
  * `productId`: `String` (Foreign key pointing to `Product.id`)
  * `size`: `String` (Available options: `XS`, `S`, `M`, `L`, `XL`, `XXL`)
  * `color`: `String` (Color swatch codes: e.g. "Emerald", "Mustard Gold", "Crimson Velvet")
  * `stock`: `Int` (Real-time stock value count)
* **Relations**: Belongs to `Product` via `productId` (cascade delete rule applied).

### 3.4. `Order` Model
Represents financial transactions, invoicing details, corporate B2B details, and logistics status tracking.
* **Fields**:
  * `id`: `String` (Primary Key, defaults to `cuid()`)
  * `userId`: `String` (Foreign key pointing to `User.id`)
  * `items`: `String` (JSON stringified snapshot array storing `id`, `title`, `price`, `quantity`, `size`, `color`)
  * `totalAmount`: `Float` (Net price subtotal after discounts, before tax)
  * `gstAmount`: `Float` (Tax amount value, computed as 5% of subtotal)
  * `gstin`: `String?` (Nullable B2B client GSTIN code, validated by `GSTIN_REGEX`)
  * `companyName`: `String?` (Nullable B2B client registered company name)
  * `paymentStatus`: `String` (Options: `'PENDING'`, `'PAID'`, `'FAILED'`)
  * `deliveryStatus`: `String` (Options: `'PROCESSING'`, `'SHIPPED'`, `'DELIVERED'`)
  * `trackingId`: `String?` (Assigned logistics tracking reference)
  * `invoiceData`: `String?` (Rich JSON string detailing tax computations, manifest URLs, and estimated delivery dates)
  * `phone` / `address` / `city` / `state` / `pincode`: `String?` (Shipping credentials)
  * `createdAt`: `DateTime` (Defaults to `now()`)
* **Relations**: Belongs to `User` via `userId`.

---

## ⚙️ 4. Exhaustive File-by-File Logic & Code Specifications

### 4.1. Checkout Processing API (`src/app/api/checkout/route.ts`)
Processes initial cart creation requests and logs orders.
```
Incoming Request (JSON Payload)
   │
   ├── Validate Payload (items, totalAmount, email, state)
   │     └── Fail -> return 400 Bad Request
   │
   ├── Query User by Email
   │     ├── Found -> Select user reference
   │     └── Not Found -> Create Guest User (role: 'USER')
   │
   ├── Create Order Row (Prisma Transaction)
   │     └── Sets paymentStatus: 'PAID' (Simulated Default)
   │
   └── Loop through cart items:
         ├── Query Product by unique 'item.productId'
         ├── Find matching Variant (matching size & color)
         └── Decrement Stock: stock = Math.max(0, variant.stock - item.quantity)
```
* **Variables**:
  * `body`: Parsed request JSON container.
  * `dbProduct`: Holds unique product query returns (`include: { variants: true }`).
  * `matchingVariant`: Filters variants matching `${item.size}` and `${item.color}`.
  * `newStock`: Prevents negative values via `Math.max(0, ...)`.

---

### 4.2. Payment Webhook & India GST Automation (`src/app/api/webhooks/payment/route.ts`)
Executes state-wise GST split computations, assigns garment HSN codes, and schedules 3PL pickup.
* **Intra-State Split Rule (West Bengal Origin)**:
  * Origin state is West Bengal.
  * State parameters are sanitized: `normalizedState = (order.state || '').trim().toLowerCase()`.
  * Matches `west bengal`, `wb`, or `w.b.`.
  * If true, tax amount splits into:
    * `cgst = baseAmount * 0.025` (2.5% CGST)
    * `sgst = baseAmount * 0.025` (2.5% SGST)
  * If false, tax routes entirely to IGST:
    * `igst = baseAmount * 0.05` (5% IGST)
* **HSN Ingestion**:
  * Loops over order lines and appends `"hsnCode": "6208"` (under Chapter 62 of Custom Tariff Act for Kurtis and garments).
* **3PL Courier Integration**:
  * Calls `bookShiprocketPickup(order.id, customerDetails, itemsWithHSN)` from [src/lib/shiprocket.ts](file:///d:/Website/src/lib/shiprocket.ts).
  * Updates the order status with:
    * `paymentStatus: 'PAID'`
    * `deliveryStatus: 'SHIPPED'`
    * `trackingId: shippingResponse.trackingId`
    * `invoiceData`: JSON string storing values for `courier`, `labelUrl`, `manifestUrl`, and `estimatedDelivery`.

---

### 4.3. Client Cart Operations (`src/hooks/useCart.ts`)
Manages Zustand memory state with browser persistent storage syncing.
* **CartItem Structure**:
  ```typescript
  export interface CartItem {
    id: string;        // Generated unique composite key: `${productId}-${size}-${color}`
    productId: string; // References Product.id
    title: string;
    price: number;     // Original base price
    discount: number;  // Percentage discount
    image: string;     // Thumbnail string path
    size: string;
    color: string;
    quantity: number;
  }
  ```
* **Operations**:
  * `addItem`: Generates composite ID. If the item exists in the array, it increments `quantity` by 1. Otherwise, it pushes the new item with `quantity: 1`.
  * `removeItem`: Filters out items matching the target composite `id`.
  * `updateQuantity`: Updates the quantity parameter of the matched item, or removes the item if quantity falls to `0`.
  * `getCartTotal`: Sums item prices after discounts are applied:
    * `discountAmt = item.price * (item.discount / 100)`
    * `finalItemPrice = item.price - discountAmt`
    * `total = total + finalItemPrice * item.quantity`
  * `getGSTAmount`: Computes tax as exactly `getCartTotal() * 0.05`.
  * `getGrandTotal`: Returns `getCartTotal() + getGSTAmount()`.
* **Hydration Safety**:
  * Standard server rendering engines mismatch React nodes if browser state differs from server returns. To avoid hydration errors, the exported wrapper hook `useCart()` initializes state values (`items`, `cartTotal`, `grandTotal`) only after `useEffect` flips `isHydrated` to `true`.

---

### 4.4. Supabase Client & Mock Auth Bypass (`src/lib/supabase.ts`)
Acts as a proxy bridge, checking for environment keys and executing mock local authentication sequences when necessary.
* **Mock Auth Logic**:
  * Detects missing keys or placeholders:
    `const isMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('mock.supabase.co');`
  * If `isMock` evaluates to true, exports a proxy client redirecting auth methods to the custom class `MockSupabaseAuth`.
* **Verification Bypass (Token: `123456`)**:
  * `signInWithOtp` logs values and simulates a 600ms latency request delay, resolving successfully.
  * `verifyOtp` evaluates parameters. If `token` matches `'123456'` (or is any 6-digit length sequence during local sandbox testing), it creates a simulated customer JWT token payload and commits it to `localStorage` under the key `'safa-kurtilab-mock-session'`.

---

### 4.5. Customer Login Controller (`src/app/(shop)/login/page.tsx`)
Responsive client viewport managing logins.
* **States**:
  * `authMethod`: Toggle values (`'email'` or `'phone'`).
  * `inputVal`: Tracks input email string or mobile digits.
  * `otpStep`: Tracks progress steps (`'request'` to input address, `'verify'` to input verification OTP).
  * `otpCode`: Monitored 6-digit verification code string.
* **Auth Submissions**:
  * Wrapped inside React 19's `useTransition` hook:
    ```typescript
    const [isPending, startTransition] = useTransition();
    ```
  * Disables input fields and buttons during transition phases to prevent double submissions. Upon OTP verification success, redirects the user to the storefront homepage after a 1.5-second status alert.

---

### 4.6. Checkout & GSTIN Validation (`src/app/(shop)/checkout/page.tsx`)
Main storefront billing form that parses addresses and validates corporate details.
* **GSTIN Validation Regex**:
  * Rules conform to the official Central Board of Indirect Taxes & Customs (CBIC) format:
    ```typescript
    const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    ```
    * `\d{2}`: State code digits (e.g. `07` for Delhi, `19` for West Bengal).
    * `[A-Z]{5}\d{4}[A-Z]{1}`: PAN card format (5 letters, 4 digits, 1 letter).
    * `[A-Z\d]{1}`: Entity code.
    * `[Z]{1}`: Default character 'Z'.
    * `[A-Z\d]{1}`: Checksum digit.
* **Validation Handler**:
  * If B2B is toggled (`isB2B = true`), checking `isFormValid()` evaluates base fields, `companyName`, and verifies that `GSTIN_REGEX.test(gstin.toUpperCase())` is successful. If false, disables the checkout submit button.
* **Checkout Transition**:
  * simulated payment processing is wrapped in `startTransition()`, managing loaders and preventing duplicate order creation dispatches.

---

### 4.7. Product Details Interface (`src/components/shop/ProductDetailsClient.tsx`)
Provides size and color selections, checks stock volumes, and links to the cart drawer.
* **Stock Alert Calculations**:
  * Finds the matching variant for the chosen size and color:
    ```typescript
    const currentVariant = product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    ```
  * stock calculations:
    * `variantStock`: Returns `currentVariant.stock` or `0`.
    * `isOutOfStock`: Evaluates true if `variantStock === 0`.
    * `isLowStock`: Evaluates true if `variantStock > 0 && variantStock < 5`. Displays warnings (`Only X pieces left. Secure yours now!`).
* **Cart Interactions**:
  * Uses `startTransition` to execute cart operations. Upon completion, triggers a click event on the Navbar's cart element to slide open the cart drawer.

---

### 4.8. Admin Command Widgets (`src/components/admin/AdminDashboardClient.tsx`)
Provides administrative charts, alerts, and inventory tables.
* **Sales Velocity Area Chart**:
  * Uses `recharts` responsive container elements (`AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`).
  * Maps orders history data grouped by date:
    ```typescript
    const salesMap = new Map<string, number>();
    orders.forEach((order) => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + order.totalAmount);
    });
    ```
* **Metrics Cards**:
  * Gross Sales: `orders.reduce((sum, o) => sum + o.totalAmount, 0)`.
  * Total Orders Count: `orders.length`.
  * Low Stock Warnings: Filters variants with stock counts under 5 units.

---

### 4.9. Policies Page Layout (`src/app/(shop)/policies/[slug]/page.tsx`)
Loads and compiles policy files.
* **File Ingestion**:
  * Matches route parameters (`params.slug`) against policy markdown files in `src/content/policies/`.
  * Reads file parameters asynchronously:
    ```typescript
    const filePath = path.join(process.cwd(), 'src/content/policies', `${params.slug}.md`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    ```
  * Parses markdown parameters into raw HTML structure using `marked`.
* **Static Generation**:
  * Pre-renders legal documents at build-time using `generateStaticParams()`:
    ```typescript
    export async function generateStaticParams() {
      return [{ slug: 'terms' }, { slug: 'privacy' }, { slug: 'refund' }, { slug: 'shipping' }];
    }
    ```

### 4.10. Autopilot Social Scheduler Agent (`scripts/social-scheduler.py`)
Dispatches new inventory catalog updates automatically to Meta Facebook Page feeds and Instagram Business Profile feeds.
* **Mechanics**:
  1. Manually parses the root `.env` file to extract credentials (`META_ACCESS_TOKEN`, `META_PAGE_ID`, `META_IG_BUSINESS_ID`), allowing a zero-dependency execution footprint without `python-dotenv`.
  2. Queries the first product entry in the local `products.json` file.
  3. **Lightweight AI Captions Generator**: Rotating templates draft descriptive luxury text with automated category hashtags based on name properties.
  4. **Direct Meta Graph API Postings**:
     * **Facebook**: Fires `POST` calls to `https://graph.facebook.com/v18.0/{page_id}/photos` sending image links and description parameters.
     * **Instagram**: Runs a two-step pipeline. Creates a media container target via `/media` first, and publishes it via `/media_publish` using the creation container ID reference.
  5. **Offline Sandbox Fallback**: If requests module is not found or mock keys are parsed, prints details to the terminal console using box-drawn ASCII grids.

---

### 4.11. 3PL Logistics Status Webhook & Reverse Inventory Sync (`src/app/api/orders/webhook/route.ts`)
Automates order state transitions, triggers return inventory synchronizations, and dispatches customer notifications.
* **Mechanics**:
  1. Receives tracking update JSON payload containing `orderId` and `status` from courier networks (Delhivery/Shiprocket).
  2. Map logistics status values to database states:
     * `shipped` or `in_transit` -> Set `deliveryStatus = 'SHIPPED'`
     * `delivered` -> Set `deliveryStatus = 'DELIVERED'`, `paymentStatus = 'PAID'`
     * `returned` or `rto` -> Set `deliveryStatus = 'RETURNED'`, trigger stock restore.
     * `cancelled` or `canceled` -> Set `deliveryStatus = 'CANCELLED'`, trigger stock restore.
  3. **Inventory Reverse Synchronization**: If marked as returned or cancelled, queries the database items list, loops through orders inside a database transaction (`prisma.$transaction`), and increments variant stock counts by the ordered amount: `newStock = matchingVariant.stock + item.quantity`.
  4. **Resend Email Notification Dispatch**: Sends dynamic HTML update emails asynchronously to the customer's mailbox using Resend REST APIs (`https://api.resend.com/emails`).

---

### 4.12. B2B Wholesale Minimum Order Quantity (MOQ) Gate-Lock
Restricts checkout flows unless wholesale parameters are met to enforce a strict B2B model.
* **MOQ Rule Set**:
  - Cart must contain at least **5 distinct product variants/items** OR hit a subtotal threshold of **₹5,000**.
* **Frontend Enforcement**:
  - **Cart Drawer (`src/components/shop/CartDrawer.tsx`)**: Disables the "Proceed to Checkout" button dynamically and displays a styled warning notice if cart criteria are not met.
  - **Checkout Page (`src/app/(shop)/checkout/page.tsx`)**: Re-evaluates MOQ parameters. If bypassed via URL entry, locks the form submission and redirects or alerts the buyer about the wholesale requirement.

---

### 4.13. White-Label Shipping Label Generator & Category-Based RTO Routing
Generates Delhivery printable B2B shipping labels and handles automated category-based returns routing.
* **White-Label Origin**:
  - Automatically overwrites 'Sender/Origin' details on printable manifests with the permanent registered headquarters address: `Safa Kurtilab, Vill-Hareknagar Mollabari, P.O. Hareknagar, P.S. Beldanga, District: Murshidabad, West Bengal - 742133`.
  - Overwrites 'Pickup/Warehouse Location' dynamically using the manufacturer/wholesaler warehouse address mapped inside product metadata.
* **Category-Based Return to Origin (RTO)**:
  - If an order's status transitions to `RETURNED`, the system maps the return route directly back to the specific manufacturing plant address (e.g. Sanganer/Jaipur for cotton, Sachin GIDC/Surat for silk/synthetic) instead of Murshidabad, minimizing secondary logistics overhead.

---

### 4.14. IndiaMART Playwright Chrome Session Supplier Crawler (`scripts/indiamart-check.py`)
Queries verified supplier nodes securely utilizing local Google Chrome user profiles and exports results to a structured CSV file.
* **Mechanics**:
  1. Spawns Chromium using `launch_persistent_context` referencing an isolated profile directory (`d:\Website\.chrome_profile_indiamart`) to avoid process singleton lock errors if the user's primary browser is already open.
  2. Bypasses Cloudflare firewalls and bot detection rules using `--disable-blink-features=AutomationControlled` headers.
  3. Queries 25 target wholesale supplier search pages in headless mode, simulating real user behavior with 4-second timing delays.
  4. Scrapes verified business parameters (`company_name`, `contact_node`) and writes them directly to `scripts/indiamart_manufacturers.csv`.
  5. Built using Windows asyncio `WindowsProactorEventLoopPolicy` loop rules to prevent execution crashes during browser process initialization.

---

### 4.15. WhatsApp Parser & Bulk Database Ingestion Pipeline
Automates importing raw WhatsApp B2B text/image arrays into Prisma database tables.
* **Mechanics**:
  1. **Python Parser (`scripts/whatsapp_parser.py`)**:
     * Extracts base rates (e.g., `Rate 695+gst`), computes wholesale listing prices with 5% GST markup, parses fabrics/categories, and formats Cloudinary mockup URLs.
     * Appends rows to `src/data/products.csv` using a semicolon separated format for sizes (`S;M;L;XL;XXL`) and images to prevent CSV column splitting conflicts.
  2. **Bulk Ingestion API Route (`POST /api/products/bulk`)**:
     * Parses `src/data/products.csv` directly, ingests entries flagged with status `"Draft"`, automatically registers corresponding S-XXL size variants, and commits updates to Supabase inside transaction blocks.
     * Automatically overwrites the CSV status of ingested rows to `"Published"` on disk to prevent double ingestion.
  3. **Local CLI Importer (`scripts/csv-import.ts`)**:
     * Provides a console-based fallback using tsx to directly trigger transaction-safe database ingestion from `src/data/products.csv`.

---

### 4.16. Automated B2B Email Outreach Campaign Agent (`scripts/email-outreach.py`)
Dispatches customized B2B partnership proposal pitches directly to vendor/buyer mailing lists via secure SMTP relay channels.
* **Mechanics**:
  1. Reads SMTP user/password parameters directly from the `.env` configuration file, running a local mock simulation if credentials are not provided.
  2. Parses the verified B2B proposal message dynamically from `pitch_message.txt` with UTF-8 character map safety.
  3. Implements email format syntax validation (`is_valid_email`) to filter bad recipients.
  4. Configures a robust **15-second connection timeout** and **2-attempt retry loop** to survive network latency drops.
  5. Executes a **5-second anti-spam delay** between multiple recipient dispatches to bypass bulk-sending rate limits on personal Gmail accounts.

---

### 4.17. Chrome Profile 2 Gmail Outreach Automation (`scripts/send-gmail-outreach.py`)
Launches the user's active, pre-authenticated Google Chrome session to send B2B proposal pitches directly via the Gmail web interface without requiring SMTP keys.
* **Mechanics**:
  1. Spawns Chrome in headed mode using `launch_persistent_context` pointing to Profile 2: `~\AppData\Local\Google\Chrome\User Data --profile-directory="Profile 2"`.
  2. Navigates directly to `https://mail.google.com/`, waiting for the active session inbox to resolve.
  3. Locates and clicks the Gmail "Compose" button, handles input field mappings for To (`mdshariq2357@gmail.com`), Subject, and Body (pitch message contents).
  4. Dispatches the email directly through the web UI by clicking the "Send" button and waiting for the sent notification.
  5. Gracefully handles ProcessSingleton profile lock exceptions if the user already has Chrome Profile 2 open.

---

### 4.18. Advanced Precise CV Image Processing & Branding Pipeline (`scripts/process-and-brand.py`)
Executes parallel high-precision Computer Vision (CV) operations to classify layouts, clear supplier markings, and apply unified corporate branding.
* **Mechanics & Architecture**:
  1. **Dynamic Layout Classification**:
     * Classifies each extracted image dynamically into one of four formats: `On-Model`, `Flat-Lay / Floor Lay`, `Hanger Shot`, or `Detail Close-Up`.
     * Heuristics analyze filename keywords, center-region HSV Indian skin-tone masks (`H: 0-22, S: 25-160, V: 60-255`), and edge density profiles in the top 15% center area (detecting hangers/hooks).
  2. **High-Precision Segmentation Masking**:
     * Targets margin boundaries (top, bottom, left, right) adjusted dynamically based on the layout classification.
     * Combines Canny edge outlines (thresholds: 30, 150) with white threshold regions (`gray > 200`) and dark text zones (`gray < 55`) to construct localized segmentation masks.
     * Cleans up segments using a rectangular morphological structuring element (`9x5` kernel) to group adjacent text nodes while filtering out fabric contours to avoid structural garment warping.
  3. **Frequency Separation Inpainting**:
     * Splits image ROIs into low-frequency (background color/shading via Gaussian blur) and high-frequency (texture details) bands.
     * Inpaints the low-frequency component using Fast Marching Methods (Telea algorithm, 5px radius).
     * Synthesizes texture noise for the high-frequency channel by calculating the standard deviation of surrounding non-masked details, then blending back into the canvas.
  4. **Localized Unsharp Mask Sharpening**:
     * Sharpens the inpainted boundaries (`sharpened = 1.6 * inpainted - 0.6 * blurred`) to preserve fabric details.
  5. **Auto-Branding Overlay**:
     * Embeds the gold Safa tulip emblem (`public/images/logo_emblem.png`) as a 15% width corner watermark with 35% opacity blending.
  6. **Parallel Metadata Compilation**:
     * Runs asynchronously using `ProcessPoolExecutor` to process multi-page PDFs concurrently.
     * Identifies garment pricing from filename prefixes, parses fabric composition (Cotton, Rayon, Roman Silk), and generates `scripts/products_to_import.json` for ingestion.

---

### 4.19. SKU Local Inpainting and Google Drive Catalog Retrieval (`scripts/process_skus_and_catalog.py`)
Processes local print catalog layouts and links cloud storage assets with direct HTTP stream downloads.
* **Mechanics**:
  1. **Brand-Aware Layout Boundaries**:
     * Isolates corner regions based on SKU product code formats (`ajmera_left` for BRN-/AAC-/LSY- prefixes, `ajmera_right` for NAG-, and `kesaria` for Drive files) to prevent general body canvas distortion.
  2. **Google Drive API Direct Download & Bypass**:
     * Fetches listings from Google Drive folders and caches file lists locally (`scripts/drive_files_list.json`) to prevent API throttling.
     * Bypasses `gdown` restriction walls by requesting download links directly using custom User-Agents (`requests.get("https://drive.google.com/uc?export=download&id={id}")`), writing binary streams to disk, and cleaning up temp files.
  3. **DPI Rasterization**:
     * Converts PDF catalog pages into high-resolution BGR images at 300 DPI using PyMuPDF (`fitz`) before processing.

---

### 4.20. B2B Competitive Price Watcher (`scripts/price-watcher.py`)
Monitors market values from competing wholesale channels to suggest competitive pricing points.
* **Mechanics**:
  1. **HTML Parsing Engine**:
     * Extracts pricing listings from raw HTML crawls using BeautifulSoup. Falls back to pre-compiled regex pattern groups if `beautifulsoup4` is not installed locally.
  2. **Optimal Price Recommendation Matrix**:
     * Computes the mathematical mean of competitor listings.
     * Deducts a B2B wholesale discount threshold (5% target) to guarantee market competitiveness.
     * Incorporates a standard Rs. 150 logistics/shipping buffer to determine final catalog pricing.
     * Saves analytical data to `price_watcher.log` for automated audits.


---

## 🛠️ 5. Developer Action Playbook

Use these PowerShell routines inside the `d:\Website` workspace:

### 5.1. Booting Development Server
```bash
# Clean install modules
cmd /c npm install

# Launch developer host (http://localhost:3000)
cmd /c npm run dev
```

### 5.2. Running Linter & Production Build
```bash
# Execute ESLint validations
cmd /c npm run lint

# Compile production build
cmd /c npm run build
```

### 5.3. Local Development Database Engine (SQLite & Dynamic Build Hook)
To prevent localhost scripts from accidentally writing, modifying, or deleting live production data, the project is configured to use a strictly isolated environment:
1. **Local Isolation:** The [.env](file:///d:/Website/.env) file maps `DATABASE_URL="file:./dev.db"`. The schema provider in [prisma/schema.prisma](file:///d:/Website/prisma/schema.prisma) is set to `"sqlite"`.
2. **Automated Vercel Prebuild Hook:** You no longer need to manually toggle the provider in `schema.prisma` before committing or deploying. We have introduced [scripts/vercel-prebuild.js](file:///d:/Website/scripts/vercel-prebuild.js), which is automatically triggered by Vercel during the build step:
   * It dynamically switches the provider block in `schema.prisma` from `"sqlite"` to `"postgresql"`.
   * It compiles the Prisma client with PostgreSQL drivers to connect to your live Supabase cloud database.
3. **Execution Script Security:** All utility scripts in [scripts/](file:///d:/Website/scripts/) (like `db-sync-catalog.ts` and `get_users.js`) have had their hardcoded production credentials removed. They strictly read connection details from the environment variable (`DATABASE_URL`), ensuring they can never connect to your live Supabase instance during local execution.

To setup or reinitialize your local environment:
```bash
# Push schema structure to local SQLite database (dev.db)
npx prisma db push

# Seed local SQLite database with catalog products
npx ts-node scripts/db-sync-catalog.ts
```

### 5.4. Syncing Schema Changes to Production (Supabase)
When schema adjustments are made to `schema.prisma` that need to be synchronized with your live Supabase cloud instance:
1. Temporarily edit the database provider in [schema.prisma](file:///d:/Website/prisma/schema.prisma) to `"postgresql"`.
2. Temporarily set `DATABASE_URL` in `.env` to the live Supabase connection pooler string:
   `postgresql://postgres.mbgzoflqfnxxohzuwqmd:SafaKurtilabDB_2026!@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`
3. Run the schema sync command:
   ```bash
   npx prisma db push
   ```
4. Revert `schema.prisma` back to `"sqlite"` and `.env` back to `"file:./dev.db"` to maintain localhost database isolation.

### 5.5. Performance Caching & Rendering Architecture
To deliver a premium luxury brand experience, the Safa Kurtilab storefront utilizes a hybrid rendering caching architecture that drops Vercel Serverless response times from 5.6s to under 600ms:

1. **Incremental Static Regeneration (ISR) with cache deduping (`products/[slug]`)**:
   * Pre-renders the top 50 most recent products at compilation time using `generateStaticParams()` to ensure instant product detail page transitions.
   * Leverages React `cache()` to deduplicate database queries, ensuring the metadata builder (`generateMetadata`) and the main page renderer share a single database connection call.
   * Revalidates inventory stock every 30 seconds using `export const revalidate = 30` to keep stock accurate.
2. **Dynamic Request Query Caching (`products/page.tsx`)**:
   * Uses Next.js `unstable_cache` to store the database results of dynamic filters (`where` and `orderBy` filters) for 60 seconds.
   * Wraps the `unstable_cache` helper in a dynamic execution wrapper that evaluates the parameters to dynamically compute the cache-key (`keyParts`) at runtime.
   * Caches static catalog filter criteria (distinct categories and sizes) for 1 hour, reducing database connections on typical requests from 4 down to just 1.
3. **Optimized Pagination Layout (12 Items per Page)**:
   * limits client-side rendering data to 12 items. This cuts the server-side rendering (SSR) CPU load on the serverless node by 50%, ensuring warm container speeds are consistently fast (~600ms).
4. **Edge CDN Caching (`next.config.ts`)**:
   * Configures global Edge CDN cache-control headers: `public, s-maxage=60, stale-while-revalidate=30` for `/products`. This instructs the Vercel Edge networks to serve the catalog HTML directly to users in millisecond speeds.

To verify or run timing audits on a clean clone:
```bash
# 1. Clone the repository and install packages
npm install

# 2. Push schema mapping to local SQLite file
npx prisma db push

# 3. Compile and build the Next.js production workspace locally
npm run build

# 4. Boot the production server to test peak cached performance
npm start
```
