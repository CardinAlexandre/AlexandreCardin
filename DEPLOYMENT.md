# 🚀 Configuration CI/CD - Portfolio Alexandre Cardin

## 📋 Vue d'ensemble

Ce document explique comment configurer le déploiement automatique de votre portfolio sur votre Raspberry Pi via GitHub Actions et Portainer.

## 🔧 Configuration requise

### 1. Secrets GitHub

Ajoutez ces secrets dans votre repository GitHub (Settings → Secrets and variables → Actions) :

#### Docker Hub
- `DOCKER_USERNAME` : Votre nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD` : Votre token d'accès Docker Hub

#### Raspberry Pi
- `RASPBERRY_PI_HOST` : Adresse IP de votre Raspberry Pi (ex: `192.168.1.100`)
- `RASPBERRY_PI_USER` : Nom d'utilisateur SSH (ex: `pi`)
- `RASPBERRY_PI_SSH_KEY` : Clé privée SSH pour se connecter au Raspberry Pi

#### Formulaire de contact (service `portfolio-mailer`)
- `SMTP_USERNAME` : adresse de la boîte OVH qui envoie (ex: `noreply@cardinalexandre.fr`)
- `SMTP_PASSWORD` : mot de passe de cette boîte
- `SMTP_FROM` : expéditeur affiché, en général la même adresse que `SMTP_USERNAME`

Les messages arrivent sur `dev@cardinalexandre.fr`, via `ssl0.ovh.net:465`.

### 2. Configuration Raspberry Pi

#### Installation Docker
```bash
# Sur votre Raspberry Pi
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Configuration SSH
```bash
# Générer une clé SSH (sur votre machine locale)
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/raspberry_pi_key

# Copier la clé publique sur le Raspberry Pi
ssh-copy-id -i ~/.ssh/raspberry_pi_key.pub pi@192.168.1.100

# Ajouter la clé privée dans les secrets GitHub
cat ~/.ssh/raspberry_pi_key
```

### 3. Configuration Portainer (Optionnel)

Si vous préférez utiliser Portainer au lieu de Docker direct :

#### Créer un stack Portainer
```yaml
version: '3.8'
services:
  portfolio:
    image: ${DOCKER_USERNAME}/alexandre-cardin-portfolio:latest
    container_name: alexandre-cardin-portfolio
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - TZ=Europe/Paris
```

## 🔄 Workflow de déploiement

### Déclenchement automatique
- **Push sur `main` ou `master`** → Build et déploiement automatique
- **Pull Request** → Build de test uniquement

### Étapes du pipeline
1. **Checkout** du code
2. **Build** de l'image Docker
3. **Push** vers Docker Hub
4. **Déploiement** sur Raspberry Pi via SSH
5. **Nettoyage** des anciennes images

## 🐳 Optimisations Docker

### Dockerfile optimisé
- ✅ Utilisateur non-root pour la sécurité
- ✅ Health check intégré
- ✅ Configuration Nginx optimisée
- ✅ Compression Gzip
- ✅ Headers de sécurité

### Configuration Nginx
- ✅ Cache des assets statiques
- ✅ Compression Gzip
- ✅ Headers de sécurité
- ✅ Gestion des erreurs
- ✅ Endpoint de santé

## 🔍 Monitoring

### Health Check
```bash
# Vérifier le statut du conteneur
curl http://votre-ip/health

# Logs du conteneur
docker logs alexandre-cardin-portfolio
```

### Portainer Dashboard
- Accédez à `http://votre-ip:9000`
- Surveillez les conteneurs et les logs
- Gérez les mises à jour

## 🚨 Dépannage

### Problèmes courants

#### 1. Échec de connexion SSH
```bash
# Tester la connexion SSH
ssh -i ~/.ssh/raspberry_pi_key pi@192.168.1.100
```

#### 2. Problème de permissions Docker
```bash
# Sur le Raspberry Pi
sudo chmod 666 /var/run/docker.sock
```

#### 3. Port déjà utilisé
```bash
# Vérifier les ports utilisés
sudo netstat -tulpn | grep :80
```

## 📊 Avantages de cette configuration

- ✅ **Déploiement automatique** à chaque push
- ✅ **Sécurité renforcée** avec utilisateur non-root
- ✅ **Performance optimisée** avec Nginx
- ✅ **Monitoring intégré** avec health checks
- ✅ **Gestion facile** via Portainer
- ✅ **Rollback simple** en cas de problème

## 🔧 Commandes utiles

```bash
# Voir les logs du déploiement
docker logs alexandre-cardin-portfolio

# Redémarrer le conteneur
docker restart alexandre-cardin-portfolio

# Mettre à jour manuellement
docker pull votre-username/alexandre-cardin-portfolio:latest
docker stop alexandre-cardin-portfolio
docker rm alexandre-cardin-portfolio
docker run -d --name alexandre-cardin-portfolio -p 80:80 votre-username/alexandre-cardin-portfolio:latest
```
