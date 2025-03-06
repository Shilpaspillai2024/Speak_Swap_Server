# Use official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docket caching
COPY package*.json ./

#Copy the .env file to the container
COPY .env .env

#Install dependencies
RUN npm install

# Copy the entire project to the conatiner
COPY . .

#Expose the port your backend runs on
EXPOSE 5000


# Start the backend server

CMD [ "npm","run","dev" ]