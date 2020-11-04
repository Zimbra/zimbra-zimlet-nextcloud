########################################################################################################

SHELL=bash
NAME = $(shell cat package.json | grep 'name":' | cut -c 12- | rev | cut -c 3- | rev)
DESC = $(shell cat package.json | grep 'description":' | cut -c 19- | rev | cut -c 3- | rev)
VERSION = $(shell cat package.json | grep 'version":' | cut -c 15- | rev | cut -c 3- | rev)
WORKSPACE = pkg

.PHONY: clean all

########################################################################################################

all: zimbra-zimlet-pkg
	rm -rf build/stage build/tmp
	cd build/dist/[ucr]* && \
	if [ -f "/etc/redhat-release" ]; \
	then \
		createrepo '.'; \
	else \
		dpkg-scanpackages '.' /dev/null > Packages; \
	fi

########################################################################################################

download:
	mkdir downloads
	wget -O downloads/zm-nextcloud-extension.jar https://files.zimbra.com/downloads/nextcloud/9.0.0.p7/zm-nextcloud-extension.jar

create-zip:
	npm install --no-audit
	npm run build
	npm run package

stage-zimlet-zip:
	install -T -D pkg/$(NAME).zip build/stage/$(NAME)/opt/zimbra/zimlets-network/zm-x-zimlet-nextcloud.zip
	install -T -D downloads/zm-nextcloud-extension.jar build/stage/$(NAME)/opt/zimbra/lib/ext/nextcloud/zm-nextcloud-extension.jar

zimbra-zimlet-pkg: download create-zip stage-zimlet-zip
	../../zm-pkg-tool/pkg-build.pl \
		--out-type=binary \
		--pkg-version=$(VERSION).$(shell git log --pretty=format:%ct -1) \
		--pkg-release=1 \
		--pkg-name=$(NAME) \
		--pkg-summary='$(DESC)' \
		--pkg-depends='zimbra-network-store (>= 9.0.0)' \
		--pkg-post-install-script='scripts/postinst.sh'\
		--pkg-installs='/opt/zimbra/lib/ext/nextcloud/zm-nextcloud-extension.jar' \
		--pkg-installs='/opt/zimbra/zimlets-network/zm-x-zimlet-nextcloud.zip'

########################################################################################################

clean:
	rm -rf build
	rm -rf downloads
	rm -rf pkg

########################################################################################################
