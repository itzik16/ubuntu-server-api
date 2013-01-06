Ubuntu Server API
=================

HTTP friendly API (HATEOS or Websockets) for admining remote Ubuntu servers. Designed to support [Ubuntu Server GUI](http://ubuntuservergui.com).

### Status - Developer Preview
Early version of the app I'm releasing to get developer feedback. It has the basic architecture in place and PAM authentication. For now I only recommend running it on local testing/development servers.

### Auto Install (recommended)
    sudo curl -L get.ubuntuserverapi.com | sudo bash

### Manual Install
    sudo apt-get install -y build-essential python-software-properties python-pycurl
    sudo add-apt-repository -y ppa:richarvey/nodejs && apt-get update
    sudo apt-get install -y nodejs nodejs-dev npm libsqlite3-dev libpam0g-dev
    sudo apt-get install -y ubuntu-server-api

### Install For Developers
    git clone git@github.com:rawberg/ubuntu-server-api.git ubuntu-server-api
    cd ubuntu-server-api
    sudo npm install -g --unsafe-perm

### Install Notes
currently tested with Ubuntu Server versions (11.04, 11.10, 12.04 and 12.10).

### Tests
- written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js/)
- run them from the root directory via `make test`

### Documentation
- for now the tests and source code are the best documentation
- pretty documentation is coming soon

### License
[AGPL 3.0](http://opensource.org/licenses/AGPL-3.0)

