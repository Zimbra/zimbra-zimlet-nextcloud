//Load components from Zimbra
import { createElement } from "preact";
import { Text } from "preact-i18n";
import { withIntl } from "./enhancers";
import { MenuItem } from "@zimbra-client/components";
import { OAuthClient } from '@zimbra/oauth-client';
import { provide } from 'preact-context-provider';

//Load the createMore function from our Zimlet component
import createMore from "./components/more";
import createAttacher from "./components/create-attacher";
import NextcloudSettingsPanel from './components/nextcloud-settings-panel';

export default function Zimlet(context) {
	//Get the 'plugins' object from context and define it in the current scope
	const { plugins } = context;
	const exports = {};

	exports.init = function init() {
		const oauthClient = new OAuthClient(context);


		oauthClient.getInfo('nextcloud')
			.then(info => {
				context.nextcloudInfo = info;
			});

		oauthClient.getCredentials('nextcloud').then(credentials => {
			//moreMenu stores a Zimlet menu item. We pass context to it here
			const moreMenu = createMore(context);
			plugins.register('slot::action-menu-mail-more', moreMenu);

			const attacher = createAttacher(context);
			plugins.register('slot::compose-attachment-action-menu', attacher);
		});


		plugins.register('settings', {
			id: 'com_zimbra_x-nextcloud',
			title: 'Nextcloud',
			component: NextcloudSettingsPanel
		});

	};

	return exports;
}
