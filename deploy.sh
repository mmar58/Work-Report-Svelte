# Copy from your root folder to the public web folder
set -e
git pull
sudo cp -r /root/node/Work-Report-Svelte/build/* /var/www/workreport.anzdevelopers.com/
pm2 restart ecosystem.config.cjs