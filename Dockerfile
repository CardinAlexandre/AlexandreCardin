FROM nginx:alpine

# Mise à jour et installation de Git
RUN apk update && apk add git

# Clonage du repository GitHub
RUN git clone https://github.com/PrieurA/AlexandreCardin.git /usr/share/nginx/html

# Copie des fichiers locaux (optionnel, dépend de votre besoin)
COPY . /usr/share/nginx/html

# Configuration du serveur nginx (si nécessaire)
# ...

# Exposition du port
EXPOSE 80

# Commande pour démarrer le serveur nginx
CMD ["nginx", "-g", "daemon off;"]