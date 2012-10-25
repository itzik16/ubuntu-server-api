Ubuntu Server API
=================

HTTP friendly API (HATEOS or Websockets) for admining remote Ubuntu servers. Designed to support [Ubuntu Server GUI](http://ubuntuservergui.com).

### Status - Developer Preview
Early version of the app I'm releasing to get developer feedback. It has the basic architecture in place and PAM authentication. For now I only recommend running it on local testing/development servers.

### Install For Developers
    git clone git@github.com:rawberg/ubuntu-server-api.git ubuntu-server-api
    cd ubuntu-server-api
    npm install

### Install Notes
- you may need to install [architect](https://github.com/c9/architect) and [connect-architect](https://github.com/c9/connect-architect) from their github repos to resolve the architect.log dependency

### Additional steps for Ubuntu 12.04
- You must update node to v0.8.12 for it to install the proper sqlite3 version.

```
sudo npm install -g n
sudo n 0.8.12
```
- You also have to install the libpam0g-dev package.

```
sudo apt-get install libpam0g-dev
```


    
### Tests
- written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js/)
- run them from the root directory via `make test`

### Documentation
- for now the tests and source code are the best documentation
- pretty documentation is coming soon

### License
[AGPL 3.0](http://opensource.org/licenses/AGPL-3.0)

