import { createElement, Component, render } from 'preact';
import { Text, withText } from 'preact-i18n';
import { withIntl } from '../../enhancers';
import { ModalDialog, ActionMenuGroup, ActionMenuItem, NestedActionMenuItem } from '@zimbra-client/components';
import style from './style';
import { getOCSPath, getDAVPath, getName, getTimeDate, getSize, sanitizeFileName, getParentPath } from '../../utils';
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
    attach: 'nextcloud-zimlet-modern.attach',
    attachInline: 'nextcloud-zimlet-modern.attachInline',
    attachAsLink: 'nextcloud-zimlet-modern.attachAsLink',
    shareLinkPassword: 'nextcloud-zimlet-modern.shareLinkPassword',
    expirationDate: 'nextcloud-zimlet-modern.expirationDate',
    plainTextShareLink: 'nextcloud-zimlet-modern.plainTextShareLink',
    attachFromNextcloud: 'nextcloud-zimlet-modern.attachFromNextcloud',
    attachedOK: 'nextcloud-zimlet-modern.attachedOK',
    linkInserted: 'nextcloud-zimlet-modern.linkInserted'
})
export default class NextcloudAttacher extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;
        this.props.onAttachmentOptionSelection(this.chooseLinksFromService);
    };

    //onAttachmentOptionSelection is passed from the Zimlet Slot and allows to add an event handler
    onAttachFilesFromService = (attachType) => {
        if (attachType == "attach") {
            this.props.onAttachmentOptionSelection(this.chooseFilesFromService);
        }
        else if (attachType == "attachInline") {
            this.props.onAttachmentOptionSelection(this.chooseFilesFromServiceInline);
        }
        else if (attachType == "attachAsLink") {
            this.props.onAttachmentOptionSelection(this.chooseFilesFromServiceAsLink);
        }
    }

    chooseFilesFromService = (editor) => {
        this.showDialog(editor, "attach");
    }

    chooseFilesFromServiceInline = (editor) => {
        this.showDialog(editor, "attachInline");
    }

    chooseFilesFromServiceAsLink = (editor) => {
        this.showDialog(editor, "attachAsLink");
    }

    downloadAndAttachFile = (path, editor, attachType) => {
        var request = new XMLHttpRequest();
        var url = '/service/extension/nextcloud';

        let fakeEmailData = {}
        if (attachType == "attachAsLink") {
            fakeEmailData.nextcloudAction = "createShare";
            fakeEmailData.shareType = "3"; //3 = public link share
            fakeEmailData.password = window.parent.document.getElementById('linkSharePassword').value;
            fakeEmailData.expiryDate = window.parent.document.getElementById("expirationDate").value;
            fakeEmailData.OCSPath = getOCSPath(this.zimletContext);
            fakeEmailData.nextcloudPath = path;
        }
        else {
            fakeEmailData.nextcloudPath = path;
            fakeEmailData.nextcloudAction = "get";
            request.responseType = "blob";
        }

        fakeEmailData.nextcloudDAVPath = getDAVPath(this.zimletContext);
        var formData = new FormData();
        formData.append("jsondata", JSON.stringify(fakeEmailData));
        request.open('POST', url);
        request.onreadystatechange = function (e) {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    if (attachType == "attachAsLink") {
                        let OCSResponse = JSON.parse(request.responseText);
                        OCSResponse.text = getName(path);
                        if(!editor.isPlainText())
                        {
                           editor.insertLinksAtCaret([OCSResponse]);
                           this.alert(this.props.linkInserted);
                        }
                        else
                        {
                           //https://github.com/ZimbraOS/zm-x-web/blob/1a6ae45704a6e189dd859a22ed802aac150c694d/src/components/composer/composer.js#L990
                           //InsertAt... not supported in plain text compose mode
                           window.prompt(this.props.plainTextShareLink,OCSResponse.url);
                        }
                    }
                    else {
                        // Blob and File are defined per window; We need compatibility with the parent Blob for attachments
                        let file = new window.parent.File([request.response], sanitizeFileName(getName(path)), { type: request.response.type });

                        if (attachType == "attachInline") {
                            if (file.type.indexOf('image/') === 0) {
                                editor.embedImages([file], false);
                            }
                            else {
                                editor.addAttachments([file], false);
                            }
                        }
                        else if (attachType == "attach") {
                            editor.addAttachments([file], false);
                        }
                        this.alert(this.props.attachedOK);
                    }
                } else {
                    this.alert(this.props.AttachFailure);
                }
            }
        }.bind(this);
        request.send(formData);
    }

    showDialog = (editor, attachType) => {
        const minDate = (new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)).toISOString().slice(0,10);

        switch (attachType) {
           case 'attach':
              this.modalTitle = this.props.attachFromNextcloud;
              this.displayShareLinkOptions = "none";
              break;
           case 'attachInline':
              this.modalTitle = this.props.attachInline
              this.displayShareLinkOptions = "none";
              break;
           case 'attachAsLink':
              this.modalTitle = this.props.attachAsLink;
              this.displayShareLinkOptions = "block";
              break;
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
                <div class="zimbra-client_modal-dialog_inner"><header class="zimbra-client_modal-dialog_header"><h2>{this.modalTitle}</h2><button onClick={this.handleClose} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
                    <div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent"><div style={{display:this.displayShareLinkOptions}}><div style="margin:5px;margin-bottom:15px"><input id="linkSharePassword" placeholder={this.props.shareLinkPassword} value=""></input> {this.props.expirationDate} : <input type="date" min={minDate} id="expirationDate" name="expirationDate"  value=""></input></div></div><div onClick={e => this.DAVItemListClick(e, editor, attachType)} id="nextcloudPropfind" style="width:100%; padding-left:10px; overflow:scroll; max-height:400px"></div>
                        <Button onClick={this.handleClose} styleType="secondary" brand="primary">OK</Button>
                    </div>
                </div>
            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'attachFromNextcloudModal', modal: this.modal }));

        this.doPropFind("/");
    }

    handleClose = e => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'attachFromNextcloudModal' }));
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

    DAVItemListClick = (e, editor, attachType) => {
        const path = e.target.getAttribute("data-item");
        if (path.slice(-1) == "/") {
            //It's a folder, open it...
            this.doPropFind(path);
        }
        else {
            //It's a file attach it.
            this.downloadAndAttachFile(path, editor, attachType);
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
            <NestedActionMenuItem
                anchor="bottom"
                icon={childIcon}
                position="right"
                title={this.props.title}
            >
                <ActionMenuGroup>
                    <ActionMenuItem onClick={() => this.onAttachFilesFromService('attach')}>
                        <Text id="nextcloud-zimlet-modern.attach" />
                    </ActionMenuItem>
                    <ActionMenuItem onClick={() => this.onAttachFilesFromService('attachInline')}>
                        <Text id="nextcloud-zimlet-modern.attachInline" />
                    </ActionMenuItem>
                    <ActionMenuItem onClick={() => this.onAttachFilesFromService('attachAsLink')}>
                        <Text id="nextcloud-zimlet-modern.attachAsLink" />
                    </ActionMenuItem>
                </ActionMenuGroup>
            </NestedActionMenuItem>

        );
    }
}
