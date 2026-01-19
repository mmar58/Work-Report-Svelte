# Copy from your root folder to the public web folder
set -e
git pull
sudo cp -r /root/node/work-report-svelte/build/* /var/www/work-report-svelte/
pm2 restart ecosystem.config.cjs