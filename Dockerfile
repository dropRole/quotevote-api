# Multi-staged build 
# Environment
FROM node:19 as build

# Create app directory
WORKDIR /app

# Copy package.json into the app directory
COPY package.json .

# Copy yarn.lock into the app directory
COPY yarn.lock .

# Install app dependencies
RUN yarn install

# Copy all files into the app directory
COPY . .

# Build the dist files
RUN yarn build

# Environment
FROM node:19

# Create app directory
WORKDIR /app

# Copy the package.json into the app directory
COPY package.json .

# Copy the yarn.lock into the app directory
COPY yarn.lock . 

# Install all the dependencies
RUN yarn install --production

# Copy all the files into the app directory
COPY --from=build /app/dist ./dist

# ENV var for productioned stage
ENV STAGE prod 

# Copy the uploads folder
COPY uploads .

# Copy the migrations folder
COPY src/migrations ./dist

# Set STAGE env var

# Run the app
CMD ["node", "dist/main.js"]