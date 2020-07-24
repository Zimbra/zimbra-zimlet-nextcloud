import { createElement, Component, render } from 'preact';
import { withIntl } from '../../enhancers';
import style from './style';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import { withText } from 'preact-i18n';
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
export default class MoreMenu extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;

        //zimlet slots have inconsistent prop names, we copy all props to _props and make them consistent
        this._props = this.props;

        //Invoked from slot attachment-single-action
        if (this._props.attachment) {
            this._props.emailData = {};
            this._props.emailData.attachments = [];
            this._props.emailData.attachments[0] = this._props.attachment;
            this._props.emailData.subject = this._props.attachment.filename;
            this._props.emailData.id = "skip";
            this._props.emailData.slot = "attachment-single-action";
        }
        else {
            this._props.emailData.slot = "action-menu-mail-more";
        }
    };

    handleSave = e => {
        this._props.emailData.nextcloudAction = "put";
        this._props.emailData.nextcloudPath = window.parent.document.getElementById('nextcloudFolder').value;
        this._props.emailData.nextcloudDAVPath = getDAVPath(this.zimletContext);
        this._props.emailData.nextcloudFilename = sanitizeFileName(window.parent.document.getElementById('nextcloudFileName').value);

        var request = new XMLHttpRequest();
        var url = '/service/extension/nextcloud';
        var formData = new FormData();
        formData.append("jsondata", JSON.stringify(this._props.emailData));
        request.open('POST', url);
        request.onreadystatechange = function (e) {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    this.alert(this._props.SavedOK);
                    this.handleClose();
                }
                else {
                    this.alert(this._props.SavedFail);
                    this.handleClose();
                }
            }
        }.bind(this);
        request.send(formData);
    }

    showDialog = e => {
        this._props.emailData.nextcloudAction = "propfind";
        this._props.emailData.nextcloudPath = "/";
        this._props.emailData.nextcloudDAVPath = getDAVPath(this.zimletContext);

        let filename = "";
        let readonly = false;
        if (this._props.emailData.slot == "attachment-single-action") {
            filename = (sanitizeFileName(this._props.emailData.subject) || this._props.emailData.id);
            readonly = true;
        }
        else {
            filename = (sanitizeFileName(this._props.emailData.subject) || this._props.emailData.id) + '.pdf';
        }

        this.modal = (
            <ModalDialog
                class={style.modalDialog}
                contentClass={style.modalContent}
                innerClass={style.inner}
                onClose={this.handleClose}
                cancelButton={false}
                header={false}
                footer={false}
            >
                <div class="zimbra-client_modal-dialog_inner"><header class="zimbra-client_modal-dialog_header"><h2>{this._props.saveNextcloud}</h2><button onClick={this.handleClose} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
                    <div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent">{this._props.saveNextcloudDescription}
                        <table>
                            <tr><td>{this._props.filename}: </td><td style="width:80%"><input class="zimbra-client_text-input_input" style="width:100%" id="nextcloudFileName" readOnly={readonly} value={filename}></input></td></tr>
                            <tr><td>{this._props.folderCurrent}: </td><td style="width:80%"><input readonly class="zimbra-client_text-input_input" style="width:100%" id="nextcloudFolder"></input></td></tr>
                        </table>
                        <div onClick={this.DAVItemListClick} id="nextcloudPropfind" style="width:100%; padding-left:10px; max-height:500px; overflow-y: scroll; overflow-x:hidden"></div>
                    </div>
                    <footer class="zimbra-client_modal-dialog_footer" id="nextcloudDialogButtons"><button type="button" onClick={this.handleSave} class="blocks_button blocks_button_regular">OK</button></footer>
                </div>
            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal', modal: this.modal }));
        this.doPropFind("/");
    }

    doPropFind = (path) => {
        this._props.emailData.nextcloudAction = "propfind";
        this._props.emailData.nextcloudPath = path;
        this._props.emailData.nextcloudDAVPath = getDAVPath(this.zimletContext);
        var request = new XMLHttpRequest();
        var url = '/service/extension/nextcloud';
        var formData = new FormData();
        formData.append("jsondata", JSON.stringify(this._props.emailData));
        request.open('POST', url);
        request.onreadystatechange = function (e) {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    const propfindResponse = JSON.parse(request.responseText);
                    const renderedPropFind = RenderPropfind({ files: propfindResponse, path: path, foldersOnly: true, emptyMsg: this._props.NoItems });
                    window.parent.document.getElementById('nextcloudFolder').value = path;
                    render(renderedPropFind, window.parent.document.getElementById('nextcloudPropfind'));
                }
                else {
                    window.parent.document.getElementById('nextcloudPropfind').innerText = this._props.PropfindFailure;

                }
            }
        }.bind(this);
        request.send(formData);
    }

    DAVItemListClick = (e) => {
        this.doPropFind(e.target.getAttribute("data-item"));
    }

    handleClose = e => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));

        //only available in attachment-single-action
        try {
            this._props.closeModal();
        } catch (err) { };
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
        if (this._props.emailData.slot == "attachment-single-action") {
            return (<div class="zimbra-client_attachment-grid_buttonContainer"><button onClick={this.showDialog} type="button" class="blocks_button blocks_button_regular zimbra-client_attachment-grid_button">{childIcon}{this._props.title}</button></div>)
        }
        else {
            return (
                <div>
                    <ActionMenuItem icon={childIcon} onClick={this.showDialog}>
                        {this._props.title}
                    </ActionMenuItem>
                </div>
            );
        }
    }
}
