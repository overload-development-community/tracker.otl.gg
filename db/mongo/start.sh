#!/bin/bash

if [ -f /data/db/initialized ];
then
    # Location of temp files to tell us mongod is running.
    pidfile="${TMPDIR:-/tmp}/start-temp-mongod.pid"
    logfile="${TMPDIR:-/tmp}/start-temp-mongod.log"

    # The command line to use for mongo.
    mongo=( mongosh --host 127.0.0.1 --port 27017 -u "$(cat $MONGO_INITDB_ROOT_USERNAME_FILE)" -p "$(cat $MONGO_INITDB_ROOT_PASSWORD_FILE)" )

    # Remove any existing temp file.
    rm -f "$pidfile"
    rm -f "$logfile"

    echo "Starting Mongo for migrations."

    # Start mongod.
    mongod --fork --logpath "$logfile" --pidfilepath "$pidfile" --setParameter diagnosticDataCollectionEnabled=false

    # Ensure mongod is running.
    tries=30
    while true; do
        if ! { [ -s "$pidfile" ] && ps "$(< "$pidfile")" &> /dev/null; }; then
            echo >&2 "error: mongod does not appear to have stayed running -- perhaps it had an error?"
            exit 1
        fi
        if "${mongo[@]}" 'admin' --eval 'quit(0)' &> /dev/null; then
            break
        fi
        (( tries-- ))
        if [ "$tries" -le 0 ]; then
            echo >&2 "error: mongod does not appear to have accepted connections quickly enough -- perhaps it had an error?"
            exit 1
        fi
        sleep 1
    done

    # Run migrations.
    echo "Running migrations."
    "${mongo[@]}" /var/mongo/migrations/index.js
    echo "Migrations complete."

    # Ensure mongod is not running.
    tries=30
    while true; do
        if ! { [ -s "$pidfile" ] && ps "$(< "$pidfile")" &> /dev/null; }; then
            break
        fi
        (( tries-- ))
        if [ "$tries" -le 0 ]; then
            kill `cat "$pidfile"`
            sleep 10
            break
        fi
        sleep 1
    done

    echo "Mongo shutdown."

    # Remove pidfile.
    rm -f "$pidfile"

    # Do a backup after 1 minute.
    $(sleep 1m; /var/mongo/backup.sh) &

    # Do a backup every day.
    $(while true; do sleep 1d; /var/mongo/backup.sh; done) &
fi

echo "Starting Mongo."

# Start up mongod normally.
exec /usr/local/bin/docker-entrypoint.sh mongod --setParameter diagnosticDataCollectionEnabled=false
