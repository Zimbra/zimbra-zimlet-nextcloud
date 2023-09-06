import { createElement, Component, render } from 'preact';
import { withIntl } from '../../enhancers';
import style from './style';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import { withText } from 'preact-i18n';
import { getDAVPath, getName, getTimeDate, getSize, sanitizeFileName, getParentPath } from '../../utils';
import RenderPropfind from '../render-propfind';
import { Button } from '@zimbra-client/blocks';

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

        //A multiple messages are selected, take message where menu was invoked
        try {
           if(Array.isArray(this._props.emailData.messages))
           {
              this._props.emailData = this._props.emailData.messages[0];
           }
        } catch(err){}//ignore

        //Invoked from slot attachment-single-action
        if (this._props.attachment) {
            this._props.emailData = {};
            this._props.emailData.attachments = [];
            this._props.emailData.attachments[0] = this._props.attachment;
            this._props.emailData.subject = this._props.attachment.filename; //the file name is not really used by the back-end
            this._props.emailData.id = "skip";
            this._props.emailData.slot = "attachment-single-action";
        }
        else if (this._props.attachments) {
            this._props.emailData = {};
            this._props.emailData.attachments = [];
            this._props.emailData.attachments = this._props.attachments;
            this._props.emailData.subject = this._props.attachments[0].filename; //the file name is not really used by the back-end
            this._props.emailData.id = "skip";
            //technically I am lying as this is the attachment-multi-action slot, but it needs to do the same thing so:
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

        //fixme to-do: Zimlet should not alter this._props.emailData as this is not a copy but a reference to the email object, which is used by parent Modern UI as well!
        let emailData = this._props.emailData;
        if(emailData.__typename == "Conversation")
        {
           console.log("Attachments are not saved separately when invoked from conversation view. Will be in EML.");
           emailData.id = emailData.messagesMetaData[0].id;
        }

        var request = new XMLHttpRequest();
        var url = '/service/extension/nextcloud';
        var formData = new FormData();
        formData.append("jsondata", JSON.stringify(emailData));
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
        filename = (sanitizeFileName(this._props.emailData.subject) || this._props.emailData.id);
        if (this._props.emailData.slot == "attachment-single-action") {            
            readonly = true;
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
                        <Button onClick={this.handleSave} styleType="secondary" brand="primary">OK</Button>
                    </div>
                </div>
            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'saveToNextcloudModal', modal: this.modal }));
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
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'saveToNextcloudModal' }));

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
            return (<div class="zimbra-client_attachment-grid_buttonContainer"><Button onClick={this.showDialog} styleType="secondary" brand="primary">{childIcon}{this._props.title}</Button></div>)
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
