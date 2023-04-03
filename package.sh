#!/bin/bash

npm install
zimlet build
zimlet package -v 1.2.1 --zimbraXVersion ">=2.0.0" -n "zimbra-zimlet-nextcloud" --desc "Nextcloud integration for Zimbra" -l "Nextcloud Zimlet"
