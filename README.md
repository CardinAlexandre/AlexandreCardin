# Portfolio Alexandre Cardin

## 📋 Description

Ce projet est un portfolio personnel développé pour Alexandre Cardin, développeur backend C#/.NET basé à Toulouse. Le site présente son parcours professionnel, ses compétences et permet aux visiteurs de le contacter.

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript
- **Framework CSS** : Template HTML5 UP (Dimension)
- **Serveur web** : Nginx (Alpine Linux)
- **Containerisation** : Docker
- **Assets** : 
  - FontAwesome pour les icônes
  - Images optimisées (JPG, PNG)
  - CSS compilé depuis SASS

## 📁 Structure du projet

```
AlexandreCardin/
├── assets/
│   ├── css/           # Styles CSS compilés
│   ├── js/            # Scripts JavaScript
│   ├── sass/          # Sources SASS
│   └── webfonts/      # Polices FontAwesome
├── images/            # Images du portfolio
├── index.html         # Page principale
├── Dockerfile         # Configuration Docker
└── CV-Alexandre-Cardin.pdf
```

## 🚀 Installation et test en local

### Prérequis
- Docker installé sur votre machine
- Git (pour cloner le repository)

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <url-du-repository>
   cd AlexandreCardin
   ```

2. **Construire l'image Docker**
   ```bash
   docker build -t alexandre-cardin-portfolio .
   ```

3. **Lancer le conteneur**
   ```bash
   docker run -d -p 8080:80 --name portfolio alexandre-cardin-portfolio
   ```

4. **Accéder au site**
   Ouvrez votre navigateur et allez sur : `http://localhost:8080`

### Alternative sans Docker

Si vous préférez tester directement avec un serveur web local :

```bash
# Avec Python (si installé)
python -m http.server 8000

# Avec Node.js (si installé)
npx serve .

# Avec PHP (si installé)
php -S localhost:8000
```

Puis accédez à `http://localhost:8000`

## 🐳 Configuration Docker

Le Dockerfile utilise une image Nginx Alpine légère :

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

Cette configuration :
- Utilise Nginx comme serveur web
- Copie tous les fichiers statiques dans le répertoire de Nginx
- Expose le port 80 par défaut

## 📝 Fonctionnalités

- **Page d'accueil** avec présentation personnelle
- **Section Intro** : Parcours et motivation
- **Section Work** : Expérience professionnelle chez illinks
- **Section About** : Présentation personnelle et hobbies
- **Section Contact** : Formulaire de contact et liens sociaux
- **CV téléchargeable** en PDF
- **Design responsive** adapté mobile/desktop
- **Changement de langue** : Français/Anglais avec bouton discret

## 🔧 Développement

### Modification des styles
Les fichiers SASS se trouvent dans `assets/sass/`. Pour recompiler les CSS :

```bash
# Installer SASS (si pas déjà fait)
npm install -g sass

# Compiler les styles
sass assets/sass/main.scss assets/css/main.css
sass assets/sass/noscript.scss assets/css/noscript.css
```

### Structure des sections
- Chaque section est dans un `<article>` avec un ID unique
- La navigation utilise des ancres pour naviguer entre les sections
- Les images sont optimisées et stockées dans le dossier `images/`

### Système de changement de langue
- **Bouton discret** : Position fixe en haut à droite
- **JavaScript vanilla** : Code optimisé et léger
- **Persistance** : Sauvegarde de la préférence dans localStorage
- **Attributs data-lang** : Gestion des contenus bilingues
- **Responsive** : Adaptation mobile et desktop

## 🚀 Déploiement

### Prochaines étapes pour le CI/CD

Pour automatiser le build et le déploiement, nous pourrons mettre en place :

1. **GitHub Actions** ou **GitLab CI** pour l'automatisation
2. **Registry Docker** (Docker Hub, GitHub Container Registry)
3. **Déploiement automatique** sur votre serveur
4. **Tests automatisés** avant déploiement

### Variables d'environnement nécessaires
- `DOCKER_REGISTRY_URL` : URL du registry Docker
- `DOCKER_USERNAME` : Nom d'utilisateur Docker
- `DOCKER_PASSWORD` : Token d'accès Docker
- `SERVER_HOST` : Adresse de votre serveur
- `SERVER_USER` : Utilisateur SSH du serveur
- `SERVER_KEY` : Clé privée SSH

## 📞 Contact

- **GitHub** : [PrieurA](https://github.com/PrieurA)
- **LinkedIn** : [alexandre-prieur](https://www.linkedin.com/in/alexandre-prieur/)
- **Email** : Via le formulaire de contact sur le site

## 📄 Licence

Ce projet est un portfolio personnel. Tous droits réservés.
