echo "This is for setting up a development database."
echo "Enter the name for the new user: "
read user
echo "Enter the password for the new user: "
read pw
mysql -u root -p -e "CREATE USER '$user'@'localhost' IDENTIFIED BY '$pw'; GRANT ALL PRIVILEGES ON * . * TO '$user'@'localhost'; FLUSH PRIVILEGES;"

echo "Enter a name for the new database: "
read db
echo "Enter the password for the new user ($pw): "
mysql -u $user -p -e "CREATE DATABASE $db;"