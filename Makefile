## Packaging (requires ruby gem fps)
PKG_NAME = ubuntu-server-api
PKG_VERSION = 0.6.0
PKG_PREFIXPATH = /etc/init/
PKG_BEFOREREMOVE = deb/before-remove
PKG_BEFOREINSTALL = deb/before-install
PKG_AFTERINSTALL = deb/after-install
PKG_LICENSE = AGPL
PKG_VENDOR = 'Ubuntu Server GUI'
PKG_CATEGORY = admin
PKG_DESCRIPTION = 'HTTP friendly API for managing Ubuntu Servers.'
PKG_URL = 'https://github.com/rawberg/ubuntu-server-api'


package:
	rm -R -f node_modules/*
	fpm -s dir -t deb \
		-n $(PKG_NAME) \
		-v $(PKG_VERSION) \
		-d 'python-software-properties' \
		-d 'nodejs > 0.8.0' \
		-d 'npm > 1.0.0' \
		--verbose \
		--license $(PKG_LICENSE) \
		--vendor $(PKG_VENDOR) \
		--category $(PKG_CATEGORY) \
		--description $(PKG_DESCRIPTION) \
		--architecture all \
		--maintainer david@ubuntuservergui.com \
		--url $(PKG_URL) \
		--prefix $(PKG_PREFIXPATH) \
		--before-install $(PKG_BEFOREINSTALL) \
		--after-install $(PKG_AFTERINSTALL) \
		--before-remove $(PKG_BEFOREREMOVE) \
		deb/ubuntu-server-api.conf

.PHONY: package

## Test Runner
MOCHA_OPTS= -t 5000
REPORTER = spec

check: test

test: test-unit

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-acceptance:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--bail \
		test/acceptance/*.js

test-cov: lib-cov
	@EXPRESS_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

benchmark:
	@./support/bench

.PHONY: test test-unit test-acceptance benchmark
