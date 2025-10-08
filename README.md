# Portfolio – Alexandre Cardin

## 📋 Description

Welcome to my personal portfolio!
I’m **Alexandre Cardin**, a **C#/.NET backend developer** based in **Toulouse, France**.
This website showcases my professional background, my technical skills, and gives visitors an easy way to get in touch with me.

## 🛠️ Technologies Used

* **Frontend**: HTML5, CSS3, JavaScript
* **CSS Framework**: HTML5 UP (Dimension template)
* **Web Server**: Nginx (Alpine Linux)
* **Containerization**: Docker
* **Assets**:

  * FontAwesome for icons
  * Optimized images (JPG, PNG)
  * CSS compiled from SASS

## 📁 Project Structure

```
AlexandreCardin/
├── assets/
│   ├── css/           # Compiled CSS styles
│   ├── js/            # JavaScript scripts
│   ├── sass/          # SASS sources
│   └── webfonts/      # FontAwesome fonts
├── images/            # Portfolio images
├── index.html         # Main page
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

* **Home page** introducing myself
* **Intro section** about my journey and motivation
* **Work section** highlighting my experience at illinks
* **About section** with personal details and hobbies (basketball, motorbikes, skiing, etc.)
* **Contact section** with a contact form and social links
* **Downloadable CV** in PDF format
* **Responsive design** (mobile & desktop friendly)
* **Language switch** between English and French via a simple button

## 🔧 Development

### Editing Styles

SASS files are located in `assets/sass/`. To recompile CSS:

```bash
# Install SASS (if not already installed)
npm install -g sass

# Compile styles
sass assets/sass/main.scss assets/css/main.css
sass assets/sass/noscript.scss assets/css/noscript.css
```

### Site Structure

* Each section is an `<article>` with a unique ID
* Navigation works with internal anchors
* Optimized images are stored in `images/`

### Language Switching

* **Discreet button** in the top-right corner
* **Vanilla JavaScript** for fast, lightweight behavior
* **Persistence** via `localStorage`
* **data-lang attributes** for bilingual content
* **Responsive** for both mobile and desktop

## 🚀 Deployment

### Next Steps for CI/CD

I plan to automate builds and deployments using:

1. **GitHub Actions** or **GitLab CI**
2. **Docker Registry** (Docker Hub or GitHub Container Registry)
3. **Automatic deployment** to my server
4. **Automated tests** before each release

### Environment Variables

* `DOCKER_REGISTRY_URL`
* `DOCKER_USERNAME`
* `DOCKER_PASSWORD`
* `SERVER_HOST`
* `SERVER_USER`
* `SERVER_KEY`

## 📞 Contact

* **LinkedIn**: [alexandre-cardin](https://www.linkedin.com/in/alexandre-cardin/)
* **Email**: through the contact form on the website

## 📄 License

This project is my **personal portfolio**.
All rights reserved © Alexandre Cardin.
