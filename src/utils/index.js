export function getDAVPath(context) {
    return context.nextcloudInfo.nextcloud_url.replace('index.php', 'remote.php/webdav');
};

export function getOCSPath(context) {
    return context.nextcloudInfo.nextcloud_url.replace('index.php', 'ocs/v1.php/apps/files_sharing/api/v1/shares');
};

export function getName(path) {
    if (/\/$/.test(path)) {
        path = path.substr(0, path.length - 1);
    }
    return path.substr(path.lastIndexOf('/') + 1);
};

export function shortName(name, isTitle) {
    const maxLength = 40;
    if (!isTitle) {
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + "...";
        }
        else {
            return name;
        }
    }
    else
    {
        if (name.length > maxLength) {
            return name;
        }
        else
        {
            return "";
        }
    }
};


export function getTimeDate(unixtime) {
    let options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return (new Date(unixtime).toLocaleString("en-GB", options))
};

/* When setting share expiration date, we prohibit user to select date in the past
this function returns the date of tomorrow that can be used in a html input type=date */
export function getMinShareDate() {
    let dt = new Date();
    dt.setTime(dt.getTime() + (24 * 60 * 60 * 1000));
    return (dt.toISOString().slice(0, 10));
};

export function getSize(bytes) {
    if (bytes < 0) {
        return;
    }
    let si = true;
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
};

/* Strips the current path to a folder or file down to that of the parent folder
 * but cannot go lower than base.
 * So: /nextcloud/remote.php/webdav/Photos/Nut.jpg -> /nextcloud/remote.php/webdav/
 * /nextcloud/remote.php/webdav/Photos/ -> /nextcloud/remote.php/webdav/
 * /nextcloud/remote.php/webdav/ -> /nextcloud/remote.php/webdav/
 * (as /nextcloud/remote.php/webdav/ is usually the base)
 */
export function getParentPath(path, base) {
    path = path.replace(base, '');

    if (path[path.length - 1] == "/") {
        //origin path is a folder
        //remove slash at the end
        path = path.replace(/\/$/, '');
        //remove current folder
        path = path.substring(0, path.lastIndexOf("/"));
    }
    else {
        //origin path is a file
        //remove file name
        path = path.substring(0, path.lastIndexOf("/"));
        //remove current folder
        path = path.substring(0, path.lastIndexOf("/"));
    }

    path = base + path + '/';
    path = path.replace('//', '/');
    return path;
};

/* Strips the filename from a path
* /nextcloud/remote.php/webdav/Photos/Nut.png -> /nextcloud/remote.php/webdav/Photos/
 */
export function getPath(path, base) {
    path = path.replace(base, '');

    if (path[path.length - 1] == "/") {
        //origin path is a folder
    }
    else {
        //origin path is a file
        //remove file name
        path = path.substring(0, path.lastIndexOf("/"));
    }

    path = base + path + '/';
    path = path.replace('//', '/');
    return path;
};

/* From original Zimlet */
export function timeConverter(UNIX_timestamp) {
    var d = new Date(UNIX_timestamp);
    return d.getFullYear() + "" + ("0" + (d.getMonth() + 1)).slice(-2) + "" +
        ("0" + d.getDate()).slice(-2) + "-" + ("0" + d.getHours()).slice(-2) + "" + ("0" + d.getMinutes()).slice(-2) + "" + ("0" + d.getSeconds()).slice(-2);
};


/* From original Zimlet, strips characters that do not work on all operating systems from filenames */
export function sanitizeFileName(fileName) {
    //Also remove double spaces
    return fileName.replace(/\\|\/|\:|\*|\?|\"|\<|\>|\||\%|\&|\@|\!|\'|\[|\]|\(|\)|\;|\=|\+|\$|\,|\#/gm, "").replace(/ +(?= )/g, '');
};
