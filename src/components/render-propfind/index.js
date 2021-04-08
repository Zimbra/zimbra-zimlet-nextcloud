import { createElement, Component } from 'preact';
import style from './style';
import { getName, getTimeDate, getSize, sanitizeFileName, getParentPath, shortName } from '../../utils';

const RenderPropfind = props => {
    //map is a for-each iterator es6 equivalent
    props.files.shift();
    let items = props.files.map(file => {
        if (file.contentType == "httpd/unix-directory" || !props.foldersOnly) {
            if (getName(file.href)) {
                if (file.contentType == "httpd/unix-directory") {
                    return <tr><td data-item={file.href} title={shortName(getName(file.href), true)} className={style.folderIcon}>{shortName(getName(file.href))}</td><td></td><td></td></tr>;
                }
                else {
                    return <tr><td data-item={file.href} title={shortName(getName(file.href), true)} className={style.fileIcon}>{shortName(getName(file.href))}</td><td>{getSize(file.contentLength)}</td><td>{getTimeDate(file.modified)}</td></tr>;
                }
            }
        }
    });

    return (
       <div style="display: block; width:100%">
          <div style="position: fixed; background-color:#f2f2f2; width:92%;border-bottom:1px solid #cccccc">
             <button className={style.homeIcon} data-item="/" title="home folder"/>
             <button className={style.upIcon} data-item={getParentPath(props.path, "/")} title="parent folder"/>
          </div>
          <div style="display: block; height: 100%; overflow-y: scroll;padding-top:22px">
             <table style="display: block;" className={style.itemTable} data-text={props.emptyMsg}>
                {items}
             </table>
             <hr className={style.itemListHr} />
          </div>
       </div>
    );
};

export default RenderPropfind;
