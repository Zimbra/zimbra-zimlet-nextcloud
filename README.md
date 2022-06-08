# Zimbra Nextcloud Zimlet
A modern UI Nextcloud Zimlet

See the demo:
https://github.com/Zimbra/nextcloud-zimlet/releases/download/0.0.2/20200529.Nextcloud.Zimlet.Modern.mp4

To set up OAuth see: https://github.com/ZimbraOS/zm-oauth-social/wiki/Setting-Up-Nextcloud

Also on Nextcloud assuming it run on Apache you must add:

      RewriteEngine On
      RewriteCond %{HTTP:Authorization} ^(.*)
      RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

You need to compile and install the nextcloud extension jar on the mailbox server. Suggested install location  /opt/zimbra/lib/ext/nextcloud/ and restart mailbox afterwards. You also need to deploy the Zimlet using Zimlet-CLI.

## Owh no it is realllly slow

Check your bruteforce protection settings in Nextcloud and try a `truncate table bruteforce_attempts`.

## Zimbra Nextcloud Java extension

Nextcloud extension moved to it's own repo at: https://github.com/Zimbra/zm-nextcloud-extension
