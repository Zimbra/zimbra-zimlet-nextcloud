import { createElement, Component } from 'preact';
import { Text } from 'preact-i18n';
import { withIntl } from '../../enhancers';
import style from './style.less';

@withIntl()
export default class NextcloudSettingsPanel extends Component {
	openPage = url => () => {
        window.open(url, '_blank', 'noopener');
	};

	render() {
		return (
			<div>
				<h1 class={style.heading}>
					
					<span>
						<Text id={'nextcloud-zimlet-modern.title'} />
					</span>
				</h1>
				<p>
					<Text id={'nextcloud-zimlet-modern.intro'} />
				</p>
				<p>
                <button type="button" onClick={this.openPage('/service/extension/oauth2/authorize/nextcloud?type=noop')} class="blocks_button blocks_button_primary blocks_button_regular blocks_button_brand-primary"><Text id={'nextcloud-zimlet-modern.authButton'} /></button>
				</p>
			</div>
		);
	}
}