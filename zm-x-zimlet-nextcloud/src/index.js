//Load components from Zimbra
import { createElement, Component, render } from 'preact';
import { OAuthClient } from '@zimbra/oauth-client';
import App from "./components/app";
import { MenuItem } from "@zimbra-client/components";
import { withIntl } from "./enhancers";
import { Text } from "preact-i18n";

//Load the createMore function from our Zimlet component
import createMore from "./components/more";
import createAttacher from "./components/create-attacher";
import NextcloudSettingsPanel from './components/nextcloud-settings-panel';

import style from './style';

export default function Zimlet(context) {
	//Get the 'plugins' object from context and define it in the current scope
	const { plugins } = context;
	const exports = {};
	const enableTabIntegration = true;

	const CustomMenuItem = withIntl()(() => (
		// List of components can be found in zm-x-web, zimlet-manager/shims.js, and more can be added if needed
		<MenuItem responsive href={`/nextcloud`}>
			<span className="zimbra-icon-nextcloud"></span>
			<b><Text id={'nextcloud-zimlet-modern.title'} /></b>
		</MenuItem>
	));

	exports.init = function init() {
		const oauthClient = new OAuthClient(context);


		oauthClient.getInfo('nextcloud')
			.then(info => {
				context.nextcloudInfo = info;

				oauthClient.getCredentials('nextcloud').then(credentials => {
					//moreMenu stores a Zimlet menu item. We pass context to it here
					const moreMenu = createMore(context);
					plugins.register('slot::action-menu-mail-more', moreMenu);

					const attacher = createAttacher(context);
					plugins.register('slot::compose-attachment-action-menu', attacher);

					if (enableTabIntegration) {
						plugins.register("slot::menu", CustomMenuItem);
						plugins.register("slot::routes", Router);
						function Router() {
							return [<App path={`/nextcloud`}>{{context}}</App>];
						}
					}
				});
			});


		plugins.register('settings', {
			id: 'com_zimbra_x-nextcloud',
			title: 'Nextcloud',
			component: NextcloudSettingsPanel
		});

	};

	return exports;
}
