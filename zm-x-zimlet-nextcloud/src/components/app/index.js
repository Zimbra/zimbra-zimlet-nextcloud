import { createElement, Component, render } from 'preact';
import style from './style';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;      
    };    
	render() {        
		return (
			<iframe class={style.wrapper} src={this.zimletContext.nextcloudInfo.nextcloud_url}>
			</iframe>
		);
	}
}
