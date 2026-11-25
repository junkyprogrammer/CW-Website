# Corporate Workspace website

Static one-page site for **Corporate Workspace**, a coworking space on S.P. Ring Road,
Ahmedabad. No build step, no framework, no dependencies. Plain HTML, CSS and JS, ready
to drop onto Cloudflare Pages.

---

## 1. Brand kit (derived from the logo artwork)

There was no existing brand kit, so these were sampled straight out of the logo and the
Instagram creative. They are the single source of truth now, and everything in
`assets/css/styles.css` is built from them.

| Token | Hex | Where it came from |
|---|---|---|
| Gold (primary) | `#C28614` | exact pixel value of the logo artwork |
| Gold deep | `#9A6A0E` | darker end of the button gradient |
| Gold light | `#E0A82E` | lighter end of the button gradient |
| Cream (page background) | `#F9F3E3` | logo background `#F6EED5`, lifted slightly |
| Mustard accent | `#E3C04C` | the lounge armchairs in the brand photo |
| Ink (headings) | `#1E1B15` | the near-black used on the creative |
| Ink soft (body copy) | `#5A5345` | |
| Hairline / borders | `#E8DEC4` | |

**Type.** The creative uses a geometric grotesk, so:

- **Poppins** (600/700/800) for headings, buttons and the wordmark lockup
- **Inter** (400/500/600) for body copy

Both load from Google Fonts. To self-host later, swap the `<link>` in each HTML file.

All of this lives in the `:root` block at the top of `assets/css/styles.css`. Change a
value there and it updates across the whole site.

---

## 2. Page structure

The homepage runs in this order:

1. Top bar (phone + location)
2. Sticky nav
3. Hero
4. Amenities strip (5 tiles)
5. **Spaces** (4 cards) with a pricing note
6. **Why us** (3 reasons)
7. **Location** with a Google Map
8. **FAQ** (4 questions)
9. **Enquiry form**
10. Footer

### Files

```
index.html          the whole site (one page, anchor-linked sections)
thank-you.html      post-submit page (used when the form posts to a real backend)
404.html            not-found page, served automatically by Cloudflare Pages
assets/css/styles.css
assets/js/main.js   nav, scroll reveal, form handling, contact links
assets/img/         logo, icons, photos, social share card
_headers            security + caching headers for Cloudflare Pages
_redirects          /contact, /pricing etc. point at the right section
robots.txt
sitemap.xml
site.webmanifest
```

### Images

| File | What it is |
|---|---|
| `logo.png` | full logo, gold, transparent background |
| `logo-white.png` | same logo in white, for the dark footer |
| `icon-mark.png` | just the CW emblem (nav + favicon source) |
| `icon-32/180/192/512.png` | favicons and the home-screen icon |
| `og-cover.jpg` | 1200x630 card shown when the link is shared |
| `reception.jpg` | the branded reception, used in the hero and the share card |
| `shot-lounge.jpg` | break-out lounge, used in the Why section |

The transparent logo and all the icons were generated from the original JPEG, so they
sit cleanly on any background. `logo.png` is not referenced by any page, it is kept as
the master artwork that the icons and the share card are built from.

> `reception.jpg` is a proper high-resolution photo. **`shot-lounge.jpg` is still a crop
> taken out of the Instagram creative**, so it is low resolution. Replacing it with a
> real photo is the one remaining visual upgrade. Keep the same filename and nothing
> else needs to change. Shoot it landscape, bright, and at least 1600px wide.

---

## 3. The enquiry form (Google Forms), read this bit

The form on the website stays exactly as it looks. Behind it, the answers are posted
into a **Google Form**, so every enquiry lands in a Google Sheet you can sort, filter,
share with staff and export. Free, unlimited, and no third-party service to sign up for.

### Already wired up

The site is connected to the existing **CW-Web-Entries** form
(`1DfugG5GE-bGeX5y3S78VR8UjKhSJebeKR2psc8tXw4M`). All seven field IDs were read off the
form and are in `CONFIG.form.googlePrefilledLink` in `assets/js/main.js`:

| Website field | Google question | Field ID |
|---|---|---|
| Your name | Name | `entry.1199287607` |
| Phone / WhatsApp | Phone | `entry.2141065898` |
| Email | Email | `entry.1600174500` |
| What do you need? | What do you need? | `entry.234337404` |
| How many people? | How many people | `entry.11557545` |
| Preferred start | Preffered Start | `entry.1115235294` |
| Message | Message | `entry.935538839` |

Answers post to
`https://docs.google.com/forms/d/e/1FAIpQLSdBXsplhQ4PenoYQKnUzQGTUFX8-I91Ys8_1dbUGZvdawg3EQ/formResponse`.

### Status: published and tested end to end

The form is published and a live test enquiry was submitted from the website and
confirmed in the **Responses** tab. All seven answers landed in the right questions.

The test submission went cross-origin without credentials, exactly as a stranger's
browser would, which also proves the form does **not** require a Google sign-in.

> There is one test row in the Responses tab named **"WEBSITE TEST - please delete"**.
> Delete it whenever you like: Responses tab, Individual, then the bin icon.

Google Forms sends no CORS headers, so the browser submits "blind": the answers are
delivered, but the page cannot read back whether Google accepted them. That is fine
while the form is left alone. **If you ever edit the questions, unpublish the form, or
turn on sign-in, submissions will start vanishing with no error shown to the visitor.**
Re-test after any change to the form.

### A note on required questions

All seven questions in the Google Form are currently marked **Required**, but the
website only requires Name, Phone and What do you need. Google throws away a whole
submission if a required answer is blank.

So the script sends `-` for any field the visitor left empty
(`CONFIG.form.googleFillEmpty`). Every enquiry gets through, and blanks show as `-` in
the Sheet.

If you would rather see genuinely empty cells, un-tick **Required** on Email, How many
people, Preffered Start and Message in the Google Form, then set
`googleFillEmpty: ''` in `assets/js/main.js`.

(Also worth fixing the spelling of "Preffered Start" in the form while you are there.
It does not affect anything technically, the script matches on field ID, but it will
show up as a column heading in the Sheet.)

### If you ever rebuild the form

Delete the questions or make a new form and the IDs change. To re-point the site:
three-dot menu → **Get pre-filled link** → type `NAME`, `PHONE`, `EMAIL`, `SPACE`,
`SEATS`, `MOVEIN`, `MESSAGE` as the seven answers → **Get link** → **Copy link** → paste
it into `googlePrefilledLink`. The script reads the IDs out of that link by matching
those words, so you never copy an `entry.1234567890` number by hand.

Keep every question **Short answer** or **Paragraph**. A Dropdown or Multiple choice
question rejects any answer that is not an exact option match.

### Switching to something else later

| `provider` | What you need | Free tier |
|---|---|---|
| `'google'` | the pre-filled link above | unlimited, lands in a Sheet |
| `'whatsapp'` | nothing | unlimited, no record kept |
| `'web3forms'` | an access key from [web3forms.com](https://web3forms.com) in `web3formsKey` | 250 / month, lands in an inbox |
| `'formspree'` | the form URL from [formspree.io](https://formspree.io) in `formspreeEndpoint` | 50 / month, with a dashboard |
| `'custom'` | any endpoint that accepts a JSON POST, in `customEndpoint` | your own |

With `google`, `web3forms`, `formspree` or `custom` the visitor is sent to
`thank-you.html` after submitting. Set `redirectTo: null` to show an inline success
message instead.

The form already has client-side validation, a honeypot spam trap, and a visible failure
message with the phone number if a request ever fails.

---

## 4. Deploy to Cloudflare Pages (free)

### Option A, drag and drop (fastest, about 2 minutes)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com), then **Workers & Pages**,
   **Create**, **Pages**, **Upload assets**.
2. Name the project, for example `corporate-workspace`.
3. Drag **the contents of this folder** (not the folder itself) into the upload box.
4. **Deploy.** You get `https://corporate-workspace.pages.dev` immediately.

To update later, repeat with **Create new deployment**.

### Option B, connect Git (better, auto-deploys on every push)

```bash
git add .
git commit -m "Corporate Workspace website"
git remote add origin <your-repo-url>
git push -u origin main
```

Then in Cloudflare Pages choose **Connect to Git**, pick the repo and set:

- **Framework preset:** None
- **Build command:** *(leave empty)*
- **Build output directory:** `/`

Every push to `main` redeploys automatically.

### Option C, Wrangler CLI

```bash
npx wrangler pages deploy . --project-name=corporate-workspace
```

### Custom domain

Pages project, then **Custom domains**, then **Set up a domain**. If the domain is
already on Cloudflare the DNS record is created for you, otherwise point a `CNAME` at
`<project>.pages.dev`. HTTPS is automatic and free.

---

## 5. Before you go live, things to confirm with your friend

These are placeholders or assumptions I could not verify. Each one is a single
find-and-replace.

| Item | Current value | Action |
|---|---|---|
| **Google Form** | done, tested | Nothing to do. One test row is sitting in Responses, delete it when convenient. |
| **Email address** | `info@corporateworkspace.in` | **Invented placeholder.** He may not own this domain. Set the real one in `CONFIG.email` in `assets/js/main.js` and it fills in everywhere automatically. |
| **Site URL** | `https://corporateworkspace.pages.dev` | Appears in the canonical tag, Open Graph tags, `robots.txt`, `sitemap.xml` and the structured data. Replace with the real URL once you know it. |
| **Opening hours** | Mon to Sat, 9:00 am to 8:00 pm | Assumed. Confirm, and if it is actually 24x7 for members, say so, it is a selling point. |
| **Pricing** | "exact pricing the same day" note under the Spaces cards | Add real figures once he gives them. |
| **Instagram link** | `https://www.instagram.com/` | Points at Instagram's homepage. Put his actual profile URL in the footer. |
| **Cabin capacity** | "2 to 15 people" | Confirm the real range. |
| **Parking** | FAQ says parking at the complex | Confirm. |

### Address note

You mentioned Naroda, the creative says **Bilasiya**. I used the creative's wording, and
the Google Maps embed resolves it correctly. The real listing reads *"Shilp Arcade,
Bilasia on, Sardar Patel Ring Rd, Hanspura, Ahmedabad, Gujarat 382330"*, with Naroda just
to the west. The pin lands in the right place, so nothing needs changing unless he
prefers different wording.

---

## 6. Local preview

```bash
python -m http.server 8787
```

Then open <http://127.0.0.1:8787>. Any static server works, there is nothing to build.

---

## 7. After launch, worth doing

1. **Google Business Profile.** For a local coworking space this drives more enquiries
   than the website does. Claim the listing, add the site URL and photos.
2. **Add exact coordinates** to the `LocalBusiness` JSON-LD in `index.html` once the
   Google listing exists. It sharpens local search results.
3. **More real photos.** The reception shot is excellent. Once there are three or four
   more at that quality (cabins, the open floor, the conference room), a gallery section
   is worth adding back.
4. **Testimonials.** Two or three member quotes with names would slot naturally between
   Why us and the FAQ.
