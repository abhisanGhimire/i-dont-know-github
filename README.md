# S.E.T. School (setschool) static site

A static **HTML, CSS, and JavaScript** website for S.E.T. School camp registration: program information, a browser **shopping cart**, **Stripe** payment handoff, **FormSubmit** for contact and vacation applications, and a **jsPDF**-based vacation application flow. There is **no build step** and no required server-side runtime for the main experience (hosting is “upload these files” or any static file host).

---

## What you need

- A modern web browser
- (Optional) A local static file server to test without browser file-URL restrictions
- (For real email) A [FormSubmit](https://formsubmit.co)–verified inbox
- (For real payments) A [Stripe](https://stripe.com) account, Payment Link, and Buy Button as configured in the project

---

## How to “install” and run locally

There is no `npm install` for the core site. You can open the site in any of these ways:

### 1. Open a page directly (quick check)

Double-click `index.html` or drag it into a browser. Some features (e.g. certain fetches) work best over `http://` instead of `file://`.

### 2. Local static server (recommended for development)

From the project root (this folder), use any of:

**Python 3**

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

**Node (npx)**

```bash
npx --yes serve -p 8080
```

**Visual Studio Code**  
Use the “Live Server” (or similar) extension and point it at the project folder.

### 3. Production hosting

Upload the whole repository (or a build archive) to any static host, for example:

- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://www.netlify.com/) / [Vercel](https://vercel.com/) (static)
- Your own web server (nginx, Apache, S3 + CloudFront, etc.)

Point the site’s document root at the folder that contains `index.html`. No server-side language is required for the static pages, cart, or FormSubmit.

---

## How to use the app (for families and staff)

1. **Home (`index.html`)**  
   Overview, schedule summary, “choose a season” links, contact form, and shared navigation (including cart badge).

2. **Programs & register (`programs.html`)**  
   April and summer week descriptions, prices, and **Add to cart** actions.  
   - **Full week** adds the week package.  
   - **Per day** and **half day** use **date buttons** so the cart line item includes a specific day.  
   Cart data is stored in the **browser** (see below).

3. **Cart (`cart.html`)**  
   Review line items, subtotal, and **course codes**.  
   - **Checkout** can open a flow that reminds users to complete the **vacation application** if required.  
   - **Pay with Stripe** uses Stripe’s **Buy Button**; families may need to **enter the same total** in Stripe as shown in the cart, because the static Buy Button is tied to a **fixed Payment Link** (see [How everything works](#how-everything-works)).

4. **Vacation application (`vacation-application.html`)**  
   - Download a blank PDF, or fill the online form.  
   - Submitting can generate a PDF and send via **FormSubmit**, or upload an existing PDF.  
   Email destination is configured in JavaScript (`assets/js/vacation-application.js`).

5. **Contact**  
   The home page and `contact-us.html` use **`assets/js/contact-form.js`** and FormSubmit to send messages to your configured email.

6. **Account (`account.html`)**  
   References `api-config.js` and `auth-session.js`. If those files are not present, login/registration features will not work until you add them or point them at a backend. The rest of the site does not depend on them for browsing programs and cart.

---

## Project layout (main pieces)

| Path | Role |
|------|------|
| `index.html` | Landing, schedule teaser, STEM section, testimonials, contact |
| `programs.html` | Camp weeks, descriptions, cart buttons |
| `cart.html` | Cart UI, Stripe checkout helpers |
| `vacation-application.html` | Forms, PDF download/upload |
| `assets/js/cart.js` | Cart in **localStorage**, badges, duplicate-by-code UX |
| `assets/js/contact-form.js` | Contact form → FormSubmit AJAX |
| `assets/js/vacation-application.js` | Vacation form, FormSubmit posts, uploads |
| `assets/js/vacation-packet-pdf.js` | Builds PDF text/layout with jsPDF |
| `assets/js/stripe-payment-link-config.js` | Stripe Payment Link URL, Buy Button IDs, **`client_reference_id`** builder |
| `assets/js/stripe-buy-button.js` | Injects Stripe Buy Button and syncs cart reference |
| `assets/files/vacation_packet.pdf` | Printable blank packet (linked from UI) |
| `vendor/` | jQuery, Bootstrap bundles used by pages |

Styles live under `assets/css/` (notably `templatemo-eduwell-style.css`). Images under `assets/images/`.

---

## How everything works

### Static pages and navigation

Pages are plain HTML linked by `<a href="...">`. The header repeats across files; edits are manual per page (no shared template compiler in-repo).

### Shopping cart (`cart.js`)

- Items are stored in **`localStorage`** under the key **`setschool_cart`**.
- Each row has at least **`name`**, **`price`**, **`code`** (unique key for “already added” on program buttons).
- **`SETSchoolCart`** exposes `getCart`, `addItem`, `clearCart`, `cartSubtotal`, etc., on `window`.
- Updating the cart dispatches **`setschool-cart-updated`** so badges and Stripe UI refresh.

Program buttons embed JSON in **`data-item`** (for example cart codes like `APR26-W`, `SUM26-1-D-TUE`). Same codes appear in Stripe’s **`client_reference_id`** for reconciliation.

### Stripe (`stripe-payment-link-config.js` + `stripe-buy-button.js`)

- The cart builds a **`client_reference_id`** string from the **`referencePrefix`** (e.g. `SET`) and cart **codes**, joined with **`|`** so Stripe Dashboard payments show what was ordered.
- The embedded **Stripe Buy Button** loads from Stripe’s script using **`publishableKey`** and **`buyButtonId`** from your Stripe Dashboard (**Payment Link → Buy button embed**).
- **`useDynamicCheckout`** is **`false`** in the static setup: checkout amounts come from Stripe’s Payment Link configuration, **not** automatic sum-of-cart API calls. Families should copy the cart **subtotal** into Stripe when instructed.  
  *(Optional)* The comments describe a Laravel API path for dynamic Checkout Sessions—only relevant if you run that backend.

### Forms: FormSubmit (`contact-form.js`, `vacation-application.js`)

- Forms submit to **`https://formsubmit.co/ajax/<your-email>`** or classic form POST URLs.
- You must **confirm the inbox** once at [FormSubmit](https://formsubmit.co/) for each destination address.

### Vacation PDF (`vacation-packet-pdf.js` + jsPDF CDN)

- The vacation page loads **jsPDF** from CDN and builds/fills PDF output in the browser.

### Privacy and limits

- Cart lives only on **that browser** unless you replicate it server-side (not implemented in static mode).
- No database is included in this static deployment.

---

## Configuration checklist (before going live)

1. **`assets/js/form-backend-config.js`** (recommended for reliable mail)  
   Sign up at [Web3Forms](https://web3forms.com) with your school inbox, paste the **Access Key** into **`web3formsAccessKey`**, and set **`useWeb3Forms: true`**. This bypasses FormSubmit activation and outages.

2. **`assets/js/contact-form.js`**  
   Uses Web3Forms when configured; otherwise FormSubmit (must **activate** the inbox: submit once, then click the link FormSubmit emails to you).

3. **`assets/js/vacation-application.js`**  
   Same backend as above; **`SCHOOL_INBOX_EMAIL`** is used for display and FormSubmit fallback.

3. **`assets/js/stripe-payment-link-config.js`**  
   Replace **test** Stripe keys / Payment Link URL / Buy Button ID with **live** values when you launch; ensure the Payment Link product and inventory settings match how you sell (avoid accidental “sold out” if quantity limits are enabled).

4. **`account.html` (optional)**  
   Provide **`assets/js/api-config.js`** and **`assets/js/auth-session.js`** if you rely on backend auth; otherwise simplify or hide that page.

---

## Repository and license

Site content belongs to **S.E.T. School**. Template-derived assets may retain notices in CSS or footers check individual files.

For questions about deployment or swapping Stripe/FormSubmit to production, use the paths above so support can find the exact knobs.
