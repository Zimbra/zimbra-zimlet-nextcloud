import { createElement, Component } from 'preact';
import { Text } from 'preact-i18n';
import { withIntl } from '../../enhancers';
import style from './style.less';
import { OAuthClient } from '@zimbra/oauth-client';

@withIntl()
export default class NextcloudSettingsPanel extends Component {
	constructor(props) {
		super(props);
		this.zimletContext = props.children.context;
		this.moreMenu = props.children.moreMenu;
		this.attacher = props.children.attacher;

		const oauthClient = new OAuthClient(this.zimletContext);
		oauthClient.getCredentials('nextcloud').then(credentials => {
			if (credentials[0]) {
				this.setState({ authorized: true });
			}
			else {
				this.setState({ authorized: false });
			}
		});

	}

	deactivate = () => {
		const { plugins, zimbraBatchClient } = this.zimletContext;
		plugins.unregister('slot::action-menu-mail-more', this.moreMenu);
		plugins.unregister('slot::attachment-single-action', this.moreMenu);
		plugins.unregister('slot::attachment-multi-action', this.moreMenu);
		plugins.unregister('slot::compose-attachment-action-menu', this.attacher);
		const oauthClient = new OAuthClient({ zimbraBatchClient });
		oauthClient.removeCredentials('nextcloud').then(() => {
			this.setState({ authorized: false });
		});
	}

	openPage = url => () => {
		window.open(url, '_blank', 'noopener');
	};

	render() {
		if (this.state.authorized == true) {
			return (
				<div style="margin-left:10px">
					<h1 class={style.heading}>

						<span>
							<Text id={'nextcloud-zimlet-modern.title'} />
						</span>
					</h1>
					<p>
						<Text id={'nextcloud-zimlet-modern.outro'} />
					</p>
					<p>
						<button type="button" onClick={this.deactivate} class="blocks_button_button blocks_button_primary blocks_button_regular zimbra-client_sidebar-primary-button_button"><Text id={'nextcloud-zimlet-modern.deactivateButton'} /></button>
					</p>
				</div>
			);
		}
		else {
			return (
				<div style="margin-left:10px">
					<h1 class={style.heading}>

						<span>
							<Text id={'nextcloud-zimlet-modern.title'} />
						</span>
					</h1>
					<p>
						<Text id={'nextcloud-zimlet-modern.intro'} />
					</p>
					<p>
						<button type="button" onClick={this.openPage('/service/extension/oauth2/authorize/nextcloud?type=noop')} class="blocks_button_button blocks_button_primary blocks_button_regular zimbra-client_sidebar-primary-button_button"><Text id={'nextcloud-zimlet-modern.activateButton'} /></button>

					</p>
				</div>
			);
		}

	}
}
