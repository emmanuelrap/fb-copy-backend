1. Crea una carpeta

2. npm init -y
3. npm install express pg cors dotenv

# ORM prisma (para connsultas tipo objectos) (crea toda la BD)

npm install prisma --save-dev
npm install @prisma/client
npx prisma init
-modificar el schema.prisma
npx prisma migrate dev --name init

# PRISMA

npx prisma studio (ejecuta el studio web, como si fuera un SGBD)

# CORRER SERVIDOR

npm start

# CLOUDNARY

npm install cloudinary multer

# Pare deployar

1.- Crear una variable de la BD a la que apunta
2.- heroku addons:create heroku-postgresql:hobby-dev --app tu-nombre-de-app

2.- heroku config --app tu-nombre-de-app
heroku config --app fb-copy-backend
3.- verificar: heroku config --app tu-nombre-de-app
