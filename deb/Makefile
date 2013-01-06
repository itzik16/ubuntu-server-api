## Packaging (requires ruby gem fps)
PKG_NAME = ubuntu-server-api
PKG_VERSION = 0.6.0
PKG_PREFIXPATH = /etc/init
PKG_BEFOREREMOVE = before-remove
PKG_BEFOREINSTALL = before-install
PKG_AFTERINSTALL = after-install
PKG_LICENSE = AGPL
PKG_VENDOR = 'Ubuntu Server GUI'
PKG_CATEGORY = admin
PKG_DESCRIPTION = 'HTTP friendly API for managing Ubuntu Servers.'
PKG_URL = 'https://github.com/rawberg/ubuntu-server-api'


package:
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
		ubuntu-server-api.conf

.PHONY: package
