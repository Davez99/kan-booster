# Usando a imagem oficial do Node.js
FROM node:16

# Definindo o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiando os arquivos necessários para o container
COPY package*.json ./

# Instalando dependências
RUN npm install

# Copiando o restante dos arquivos do projeto para o container
COPY . .

# Expondo a porta onde o backend será executado
EXPOSE 3000

# Comando para iniciar o backend
CMD ["npm", "run", "dev"]
