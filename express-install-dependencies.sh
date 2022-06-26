# This bash script is used to re-install dependencies for Express app
# Ensure bash script is run in the correct working directory

# Initialise Node application
npm init

# Install Express
yarn add express

# Install handlebars for Express
yarn add hbs

# Install wax-on for template inheritance
yarn add wax-on

# Install Axios
yarn add axios

# Install MongoDB
yarn add mongodb

# Install dotenv for environment variables
# - Create a env file to store environment variables
yarn add dotenv
touch .env

# Install cors for enabling cors for RESTFUL API
yarn add cors

# Install JSON Web Tokens (JWT) for API Authentication
yarn add jsonwebtoken

# Install Node monitor 
npm install -g nodemon

