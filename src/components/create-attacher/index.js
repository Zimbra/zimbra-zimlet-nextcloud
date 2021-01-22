import { createElement } from 'preact';
import NextcloudAttacher from '../nextcloud-attacher';

export default function createAttacher(context) {
	return props => (
		<NextcloudAttacher {...props}>{{context}}</NextcloudAttacher>
	);
}
