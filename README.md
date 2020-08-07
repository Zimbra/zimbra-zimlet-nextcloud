# nextcloud-zimlet
A modern UI Nextcloud Zimlet

See the demo:
https://github.com/Zimbra/nextcloud-zimlet/releases/download/0.0.2/20200529.Nextcloud.Zimlet.Modern.mp4

To set up OAuth see: https://github.com/ZimbraOS/zm-oauth-social/wiki/Setting-Up-Nextcloud

Also on Nextcloud assuming it run on Apache you must add:

      RewriteEngine On
      RewriteCond %{HTTP:Authorization} ^(.*)
      RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

On Zimbra 9 you need to install wkhtmltopdf be sure to use it from https://wkhtmltopdf.org/downloads.html and not from CentOS  repo (unless you also want to have an X server on your mailbox server)

      yum install xorg-x11-fonts-Type1 xorg-x11-fonts-75dpi libjpeg libXrender libXext libX11 fontconfig
      rpm -i https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.centos7.x86_64.rpm
      ln -s /usr/local/bin/wkhtmltopdf /bin/wkhtmltopdf

You need to compile and install the nextcloud extension jar on the mailbox server. Suggested install location  /opt/zimbra/lib/ext/nextcloud/ and restart mailbox afterwards. You also need to deploy the Zimlet using Zimlet-CLI.

## Owh no it is realllly slow

Check your bruteforce protection settings in Nextcloud and try a `truncate table bruteforce_attempts`.

In addition you need to set up CORS, assuming Apache something like:

```
Header set Content-Security-Policy "frame-ancestors 'self' zimbra.example.com;"
Header set Access-Control-Allow-Origin "https://zimbra.example.com"
Header set Access-Control-Allow-Methods "GET,POST,HEAD,DELETE,PUT,OPTIONS"
Header set Access-Control-Allow-Headers "Authorization, OCS-APIRequest"

```

## The Nextcloud tab in Zimbra does not work

If you are running Zimbra and Nextcloud on different domains and you see a `Too many redirects` error in the tab you should add/configure the following http header. Assuming you are running Nextcloud on Apache:
```
Header edit Set-Cookie SameSite.* $1
```
Please note that this will remove the SameSite Cookie policy, do this only if you understand what it does and if you have no other option. See: https://web.dev/samesite-cookies-explained/

