# nextcloud-zimlet
A modern UI Nextcloud Zimlet

See the demo:
https://github.com/Zimbra/nextcloud-zimlet/releases/download/0.0.1/Nextcloud.Zimlet.Modern.OAuth.mp4

To set up OAuth see: https://github.com/ZimbraOS/zm-oauth-social/wiki/Setting-Up-Nextcloud

Also on Nextcloud assuming it run on Apache you must add:

      RewriteEngine On
      RewriteCond %{HTTP:Authorization} ^(.*)
      RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

On Zimbra you need to install wkhtmltopdf be sure to use it from https://wkhtmltopdf.org/downloads.html and not from CentOS  repo (unless you also want to have an X server on your mailbox server)

      ln -s /usr/local/bin/wkhtmltopdf /bin/wkhtmltopdf
