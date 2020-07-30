# nextcloud-zimlet
A modern UI Nextcloud Zimlet

See the demo:
https://github.com/Zimbra/nextcloud-zimlet/releases/download/0.0.2/20200529.Nextcloud.Zimlet.Modern.mp4

To set up OAuth see: https://github.com/ZimbraOS/zm-oauth-social/wiki/Setting-Up-Nextcloud

Also on Nextcloud assuming it run on Apache you must add:

      RewriteEngine On
      RewriteCond %{HTTP:Authorization} ^(.*)
      RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

On Zimbra you need to install wkhtmltopdf be sure to use it from https://wkhtmltopdf.org/downloads.html and not from CentOS  repo (unless you also want to have an X server on your mailbox server)

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

