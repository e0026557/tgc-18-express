# This bash script is used to set up Express app and its dependencies
# Ensure bash script is run in the correct working directory

# Create an index.js file
touch index.js

# Initialise Node application
npm init

# Install Express
yarn add express

# Install handlebars for Express
# - Create 'views' directory for template files
# IMPORTANT: Remember to tell Express that we are using hbs as the view engine
yarn add hbs
mkdir views

# Create 'public' directory for static files
# IMPORTANT: Remember to register the 'public' folder with Express
mkdir public

# Install wax-on for template inheritance
# IMPORTANT: Remember to set up wax-on for template inheritance
# - Create 'layouts' directory inside of 'views' directory
yarn add wax-on
mkdir ./views/layouts

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

