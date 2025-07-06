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
