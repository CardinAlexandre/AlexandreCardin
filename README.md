# Portfolio – Alexandre Cardin

## 📋 Description

Welcome to my personal portfolio!
I’m **Alexandre Cardin**, a **C#/.NET backend developer** based in **Toulouse, France**.
This website showcases my professional background, my technical skills, and gives visitors an easy way to get in touch with me.

## 🛠️ Technologies Used

* **Frontend**: HTML, CSS and vanilla JavaScript, no build step
* **Animation**: [GSAP](https://gsap.com) + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering) smooth scroll (vendored in `assets/vendor/`)
* **Typography**: Bricolage Grotesque (variable), Instrument Serif, JetBrains Mono — via Google Fonts
* **Web Server**: Nginx (Alpine Linux)
* **Containerization**: Docker

## 📁 Project Structure

```
AlexandreCardin/
├── assets/
│   ├── css/style.css  # All styles (design tokens at the top)
│   ├── js/app.js      # Animation engine (loader, scroll scenes, cursor, physics…)
│   ├── js/i18n.js     # English translations (French lives in the HTML)
│   └── vendor/        # GSAP, ScrollTrigger, Lenis
├── images/            # WebP images
├── index.html         # The whole story, one page
├── Dockerfile         # Docker configuration
└── CV-Alexandre-Cardin.pdf
```

## 🚀 Local Installation & Testing

### Requirements

* Docker installed on your machine
* Git (to clone the repository)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/CardinAlexandre/AlexandreCardin.git
   cd AlexandreCardin
   ```

2. **Build the Docker image**

   ```bash
   docker build -t alexandre-cardin-portfolio .
   ```

3. **Run the container**

   ```bash
   docker run -d -p 8080:80 --name portfolio alexandre-cardin-portfolio
   ```

4. **Access the website**
   Open your browser and go to: `http://localhost:8080`

### Alternative Without Docker

If you’d like to test it directly using a local web server:

```bash
# With Python (if installed)
python -m http.server 8000

# With Node.js (if installed)
npx serve .

# With PHP (if installed)
php -S localhost:8000
```

Then open your browser at `http://localhost:8000`

## 🐳 Docker Configuration

The project uses a lightweight **Nginx Alpine** image:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

This setup:

* Uses Nginx as the web server
* Copies all static files to Nginx’s default directory
* Exposes port 80 by default

## 📝 Features

The site tells one story — **metal → wood → code** — in acts:

1. **Hero** — giant name whose letter weight "breathes" under the cursor, collage stickers, a marquee that speeds up with scroll
2. **Manifesto** — pinned, words light up one by one while metal, wood and code swatches land on the workbench
3. **Story** — horizontal scroll: Rouen, metalwork at the Piriou shipyard in Brittany (ship under construction, live welding sparks, Gwenn-ha-Du), cabinetmaking in Montréal (snow, maple leaves, a walking caribou), Toulouse at golden hour (brick sketch, brick Occitan cross), code
4. **Work** — stacking cards for illinks and Viveris × Liebherr (fleet radar, mining haul truck)
5. **Off screen** — basketball, tennis, motorbike, hiking
6. **Contact** — form posting to `/api/contact` (see *Contact form service* below), links, CVs (FR/EN)

Also: custom cursor, film grain, chapter HUD, FR/EN switch, `prefers-reduced-motion` support (everything stays readable without animation or without JavaScript), responsive down to phones.

## ✉️ Contact form service

`mailer/` is a small ASP.NET Core (.NET 10) minimal API that sends the form to **dev@cardinalexandre.fr** through OVH SMTP (MailKit).

* Runs as its own container, `portfolio-mailer`, on the `proxy` Docker network, with no published port; nginx forwards `/api/` to it (same origin, no CORS)
* The sender is a mailbox of the domain (SPF only allows OVH); the visitor goes in `Reply-To`, so "Reply" answers them directly
* Anti-spam: honeypot field, 5 messages / 10 min per visitor, 60 / hour overall, strict validation
* Configuration through environment variables: `Smtp__Username`, `Smtp__Password`, `Smtp__From` (defaults: `ssl0.ovh.net:465`, recipient `dev@cardinalexandre.fr`); the service refuses to start if it is misconfigured

```bash
dotnet test mailer/Mailer.slnx              # tests
dotnet run --project mailer/Mailer          # local run: expects a test SMTP on localhost:1025 (e.g. npx maildev)
```

## 🎮 Mini-games

* **Welding (Metal / Piriou)** — hold the click on the green dot and follow the dotted seam on the hull. The bead turns into holes if you go too fast and burns if you go too slow; the grade combines length welded, accuracy and steady speed. Best score is kept in `localStorage` (`ac-weld-best`).
* **Sunbeam catcher (Toulouse)** — move the pink brick with the mouse only: click it to grab it (it follows the mouse; another click drops it, and a long press drops it on release) — finger drag on touch screens — to catch falling sunbeams: 1 point + a combo bonus per consecutive catch, a missed beam resets the combo. Beams speed up as the combo grows; the game only runs while the Toulouse step is on screen.
* **Easter egg (Code)** — grab the plug at the end of the CRT man's cable (same click-to-grab / click-to-drop logic): a wall socket appears. Plug it in and he gets electrocuted, shuts down like an old tube, smokes a little, then reboots back to his original state.
* **Axe throwing (Wood / Montréal)** — click the log to throw a Viking axe (10 max, the oldest falls). Pin a falling maple leaf for 1 point + a combo bonus that grows with each consecutive hit; a miss resets the combo.

## 🔧 Development

No build step: edit the files and reload. Static assets are cached for a year by Nginx, so **bump the `?v=` query strings in `index.html`** when you change CSS/JS.

### Language Switching

* French text is written in `index.html`; elements carrying `data-i18n="key"` are replaced by `window.I18N_EN[key]` from `assets/js/i18n.js`
* Attributes are translated with `data-i18n-attr="attr:key"`
* The choice is stored in `localStorage` and applied on reload behind a curtain transition

## 🚀 Deployment

### Next Steps for CI/CD

I plan to automate builds and deployments using:

1. **GitHub Actions** or **GitLab CI**
2. **Docker Registry** (Docker Hub or GitHub Container Registry)
3. **Automatic deployment** to my server
4. **Automated tests** before each release

### Environment Variables

GitHub secrets used by `.github/workflows/deploy.yml`:

* `REGISTRY_USERNAME`, `REGISTRY_PASSWORD` — private registry
* `RASPBERRY_PI_HOST`, `RASPBERRY_PI_USER`, `RASPBERRY_PI_SSH_KEY` — deployment
* `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` — OVH mailbox used to send the contact form

## 📞 Contact

* **LinkedIn**: [alexandre-cardin](https://www.linkedin.com/in/alexandre-cardin/)
* **Email**: through the contact form on the website

## 📄 License

This project is my **personal portfolio**.
All rights reserved © Alexandre Cardin.
