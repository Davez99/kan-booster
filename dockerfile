# Usando imagem oficial do Node.js
FROM node:16

# Definindo o diretório de trabalho no container
WORKDIR /src/app

# Copiando o arquivo de dependências
COPY requirements.txt ./

# Instalando dependências listadas no requirements.txt
RUN xargs npm install < requirements.txt

# Copiando o restante dos arquivos do projeto
COPY . .

# Expor a porta usada pela aplicação
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "run", "dev"]
