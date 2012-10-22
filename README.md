Ubuntu Server API
=================

HTTP friendly API (HATEOS or Websockets) for admining remote Ubuntu servers. Designed to support [Ubutuntu Server GUI](http://ubuntuservergui.com).

### Status - Developer Preview
Early version of the app I'm releasing to get developer feedback. It has the basic architecture in place and PAM authentication. For now I only recommend running it on local testing/development servers.

### Install For Developers
    git clone git@github.com:rawberg/ubuntu-server-api.git ubuntu-server-api
    cd ubuntu-server-api
    npm install

### Install Notes
- you may need to install [architect](https://github.com/c9/architect) and [connect-architect](https://github.com/c9/connect-architect) from their github repos to resolve the architect.log dependency

### Tests
- written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js/)
- run them from the root directory via `make test`

