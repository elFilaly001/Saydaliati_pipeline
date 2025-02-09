if [ "$(pm2 list | grep nest-app)" ]; then
    pm2 stop nest-app
    pm2 delete nest-app
fi

# Install node if it doesn't exist
if ! [ -x "$(command -v node)" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    . ~/.nvm/nvm.sh
    nvm install 18
fi

# Install pm2 if it doesn't exist
if ! [ -x "$(command -v pm2)" ]; then
    npm install -g pm2
fi