#!/bin/bash
set -e

echo -e "\n"
echo -e "########################################################################"
echo -e "#                                                                      #"
echo -e "#  Generating Self-Signed SSL Cert                                     #"
echo -e "#                                                                      #"
echo -e "########################################################################"
echo -e "\n"

if [ ! -d "db" ]; then
    mkdir db
fi

if [ ! -d ".ssl" ]; then
    mkdir .ssl
    mkdir .ssl/private
    mkdir .ssl/certs
fi

openssl genrsa -out .ssl/private/usg-key.pem 1024

openssl req -new -key .ssl/private/usg-key.pem -out .ssl/usg-csr.pem -subj "/C=US/ST=California/L=San Francisco/O= /CN=$HOSTNAME"

openssl x509 -req -in .ssl/usg-csr.pem -signkey .ssl/private/usg-key.pem -out .ssl/certs/usg-cert.pem -days 3650