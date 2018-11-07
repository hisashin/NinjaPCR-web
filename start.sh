#!/bin/sh

cd /NinjaPCR-web-master

forever start --pidFile /var/run/ninjapcr.pid -l /dev/null -a -d -c "node" app.js

cat <<EOF >>~/.bashrc
trap 'forever stop app.js; exit 0' TERM
EOF
exec /bin/sh
