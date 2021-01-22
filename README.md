# Zimbra Nextcloud Zimlet
A modern UI Nextcloud Zimlet

See the demo:
https://github.com/Zimbra/nextcloud-zimlet/releases/download/0.0.2/20200529.Nextcloud.Zimlet.Modern.mp4

To set up OAuth see: https://github.com/ZimbraOS/zm-oauth-social/wiki/Setting-Up-Nextcloud

Also on Nextcloud assuming it run on Apache you must add:

      RewriteEngine On
      RewriteCond %{HTTP:Authorization} ^(.*)
      RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

On Zimbra 9 you need to install wkhtmltopdf be sure to use it from https://wkhtmltopdf.org/downloads.html and not from CentOS  repo (unless you also want to have an X server on your mailbox server)

      #CentOS 7
      yum install xorg-x11-fonts-Type1 xorg-x11-fonts-75dpi libjpeg libXrender libXext libX11 fontconfig
      rpm -i https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.centos7.x86_64.rpm
      ln -s /usr/local/bin/wkhtmltopdf /bin/wkhtmltopdf
      
      #Ubuntu 18
      apt install  xfonts-base xfonts-75dpi libssl1.1  libpng16-16
      wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.bionic_amd64.deb
      dpkg -i  wkhtmltox_0.12.1.4-2.bionic_amd64.deb
      ln -s /usr/local/bin/wkhtmltopdf /bin/wkhtmltopdf

Other operating systems: https://github.com/wkhtmltopdf/packaging/releases/tag/0.12.6-1

You need to compile and install the nextcloud extension jar on the mailbox server. Suggested install location  /opt/zimbra/lib/ext/nextcloud/ and restart mailbox afterwards. You also need to deploy the Zimlet using Zimlet-CLI.

## Owh no it is realllly slow

Check your bruteforce protection settings in Nextcloud and try a `truncate table bruteforce_attempts`.

## Zimbra Nextcloud Java extension

Nextcloud extension moved to it's own repo at: https://github.com/Zimbra/zm-nextcloud-extension
