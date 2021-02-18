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
	const enableTabIntegration = false;

	const CustomMenuItem = withIntl()(() => (
		// List of components can be found in zm-x-web, zimlet-manager/shims.js, and more can be added if needed
		<MenuItem responsive href={`/nextcloud`}>
			<span className="zimbra-icon-nextcloud"></span>
			<b><Text id={'nextcloud-zimlet-modern.title'} /></b>
		</MenuItem>
	));

	exports.init = function init() {
		const oauthClient = new OAuthClient(context);
		//moreMenu stores a Zimlet menu item. We pass context to it here
		const moreMenu = createMore(context);
		const attacher = createAttacher(context);

		oauthClient.getInfo('nextcloud')
			.then(info => {
				context.nextcloudInfo = info;

				oauthClient.getCredentials('nextcloud').then(credentials => {
					if (credentials[0]) {
						plugins.register('slot::action-menu-mail-more', moreMenu);
						plugins.register('slot::attachment-single-action', moreMenu);
						plugins.register('slot::attachment-multi-action', moreMenu);
						plugins.register('slot::compose-attachment-action-menu', attacher);

						if (enableTabIntegration) {
							//this has not been tested in a while, enableTabIntegration has been hardcoded to false for a while 
							plugins.register("slot::menu", CustomMenuItem);
							plugins.register("slot::routes", Router);
							function Router() {
								return [<App path={`/nextcloud`}>{{ context }}</App>];
							}
						}
					}
				});
			});

		// Create a main nav menu item.
		const CustomTabItemInner = () => {
			const childIcon = (
				<span class="zimbra-icon-nextcloud">
				</span>);
			return (
				<MenuItem icon={childIcon} responsive href={`/cloudapps/ncauthorize`}>
					Nextcloud
				</MenuItem>
			);
		};

		const CustomTabItem = withIntl()(CustomTabItemInner);
		plugins.register(`slot::cloudapps-tab-item`, CustomTabItem);
		plugins.register("slot::routes", RouteCloudApps);
		function RouteCloudApps() {
			return [<NextcloudSettingsPanel path={`/cloudapps/ncauthorize`}>{{ context, moreMenu, attacher }}</NextcloudSettingsPanel>];
		}
	};

	return exports;
}
