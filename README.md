# Zimbra Nextcloud Zimlet fo modern UI

With the Nextcloud Zimlet you can add files from Nextcloud to emails as attachments, links and inline images. You can also store emails and attachments from Zimbra to Nextcloud.

This Zimlet is in the official repos and can be installed via:

      yum install zimbra-zimlet-nextcloud
      apt install  zimbra-zimlet-nextcloud

## Install instructions

See: https://zimbra.github.io/documentation/zimbra-10/adminguide.html#_setting_up_nextcloud

## Owh no it is realllly slow

Check your bruteforce protection settings in Nextcloud and try a `truncate table bruteforce_attempts`.

## Zimbra Nextcloud Java extension

Nextcloud extension moved to it's own repo at: https://github.com/Zimbra/zm-nextcloud-extension

## Classic UI Zimlet

See: https://github.com/Zimbra/com_zimbra_nextcloud
