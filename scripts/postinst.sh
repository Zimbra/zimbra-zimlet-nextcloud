#!/bin/bash
echo "*** Configuring Zimbra-Zimlet-Nextcloud ***"
su - zimbra -c "zmmailboxdctl status"
if [ $? -ne 0 ]; then
   echo "*** Mailbox is not running... ***"
   echo "*** Follow the steps below as zimbra user ignore if installing through install.sh .. ***"
   echo "*** Install the Zimbra-Zimlet-Nextcloud Modern Zimlet. ***"
   echo "*** zmzimletctl -l deploy /opt/zimbra/zimlets-network/zimbra-zimlet-nextcloud.zip ***"
   echo "*** Install the Zimbra-Zimlet-Nextcloud Classic Zimlet. ***"
   echo "*** zmzimletctl -l deploy /opt/zimbra/zimlets-network/com_zimbra_nextcloud.zip ***"
   echo "*** zmprov fc zimlet ***"
else
   echo "*** Deploying Zimbra-Zimlet-Nextcloud Modern Zimlet ***"
   su - zimbra -c  "zmzimletctl -l deploy /opt/zimbra/zimlets-network/zimbra-zimlet-nextcloud.zip"
   echo "*** Deploying Zimbra-Zimlet-Nextcloud Classic Zimlet ***"
   su - zimbra -c  "zmzimletctl -l deploy /opt/zimbra/zimlets-network/com_zimbra_nextcloud.zip"
   su - zimbra -c  "zmprov fc zimlet"
fi
echo "*** Zimbra-Zimlet-Nextcloud Installation Completed. ***"
echo "*** Restart the mailbox service as zimbra user. Run ***"
echo "*** su - zimbra ***"
echo "*** zmmailboxdctl restart ***"
