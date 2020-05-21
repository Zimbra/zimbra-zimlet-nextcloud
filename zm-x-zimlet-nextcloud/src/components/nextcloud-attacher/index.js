import { createElement, Component, render } from 'preact';
import { Text, withText } from 'preact-i18n';
import { withIntl } from '../../enhancers';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import style from './style';
import { getDAVPath, getName, getTimeDate, getSize, sanitizeFileName, getParentPath } from '../../utils';
import RenderPropfind from '../render-propfind';

@withIntl()
@withText({
    title: 'nextcloud-zimlet-modern.title',
    SavedOK: 'nextcloud-zimlet-modern.SavedOK',
    SavedFail: 'nextcloud-zimlet-modern.SavedFail',
    saveNextcloud: 'nextcloud-zimlet-modern.saveNextcloud',
    saveNextcloudDescription: 'nextcloud-zimlet-modern.saveNextcloudDescription',
    filename: 'nextcloud-zimlet-modern.filename',
    folderCurrent: 'nextcloud-zimlet-modern.folderCurrent',
    PropfindFailure: 'nextcloud-zimlet-modern.PropfindFailure',
    NoItems: 'nextcloud-zimlet-modern.NoItems',
    AttachFailure: 'nextcloud-zimlet-modern.AttachFailure',
})
export default class NextcloudAttacher extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;
        this.props.onAttachmentOptionSelection(this.chooseLinksFromService);
    };

    //onAttachmentOptionSelection is passed from the Zimlet Slot and allows to add an event handler
    onAttachFilesFromService = () =>
        this.props.onAttachmentOptionSelection(this.chooseFilesFromService);

    chooseFilesFromService = (editor) => {
        this.showDialog(editor);
    }

    downloadAndAttachFile = (path, editor) => {
        let fakeEmailData = {}
        fakeEmailData.nextcloudAction = "get";
        fakeEmailData.nextcloudPath = path;
        fakeEmailData.nextcloudDAVPath = getDAVPath(this.zimletContext);
        var request = new XMLHttpRequest();
        var url = '/service/extension/nextcloud';
        var formData = new FormData();
        formData.append("jsondata", JSON.stringify(fakeEmailData));
        request.open('POST', url);
        request.responseType = "blob";
        request.onreadystatechange = function (e) {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    // Blob and File are defined per window; We need compatibility with the parent Blob for attachments
                    let file = new window.parent.File([request.response], sanitizeFileName(getName(path)), { type: request.response.type });
                    editor.addAttachments([file], false);
                } else {
                    this.alert(this.props.AttachFailure);
                }
            }
        }.bind(this);
        request.send(formData);    
    }

    showDialog = (editor) => {
        let display = window.parent.document.getElementsByClassName("zimbra-client_composer_right");
        let dialog = <div onClick={e => this.DAVItemListClick(e, editor)} id="nextcloudPropfind" style="width:100%; padding-left:10px; overflow:scroll"></div>
        display[0].style.minWidth = "600px";
        render(dialog, display[0]);
        this.doPropFind("/");
    }

    doPropFind = (path) => {
        let fakeEmailData = {}
        fakeEmailData.nextcloudAction = "propfind";
        fakeEmailData.nextcloudPath = path;
        fakeEmailData.nextcloudDAVPath = getDAVPath(this.zimletContext);
        var request = new XMLHttpRequest();
        var url = '/service/extension/nextcloud';
        var formData = new FormData();
        formData.append("jsondata", JSON.stringify(fakeEmailData));
        request.open('POST', url);
        request.onreadystatechange = function (e) {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    const propfindResponse = JSON.parse(request.responseText);
                    const renderedPropFind = RenderPropfind({ files: propfindResponse, path: path, foldersOnly: false, emptyMsg: this.props.NoItems });
                    render(renderedPropFind, window.parent.document.getElementById('nextcloudPropfind'));
                }
                else {
                    this.alert(this.props.PropfindFailure);
                }
            }
        }.bind(this);
        request.send(formData);
    }

    DAVItemListClick = (e, editor) => {
        const path = e.target.getAttribute("data-item");
        if (path.slice(-1) == "/") {
            //It's a folder, open it...
            this.doPropFind(path);
        }
        else {
            //It's a file attach it.
            this.downloadAndAttachFile(path, editor);
        }
    }

    alert = (message) => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.notifications.notify({
            message: message
        }));
    }

    render() {
        const childIcon = (
            <span class={style.appIcon}>
            </span>);

        return (
            <ActionMenuItem icon={childIcon} onClick={this.onAttachFilesFromService}>
                <Text id="nextcloud-zimlet-modern.title" />
            </ActionMenuItem>

        );
    }
}
