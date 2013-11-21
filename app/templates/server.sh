# Start a PHP server from a directory, optionally specifying the port
# (Requires PHP 5.4.0+.)
port="${1:-4000}"
ip=$(ipconfig getifaddr en0)
sleep 1 && open "http://${ip}:${port}/" &
php -S "${ip}:${port}"
