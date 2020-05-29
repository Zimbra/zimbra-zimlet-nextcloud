/*

Copyright (C) 2016-2020  Barry de Graaff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.

*/

package com.zimbra.nextcloud;

import com.github.sardine.impl.io.ContentLengthInputStream;
import com.zimbra.common.service.ServiceException;
import com.zimbra.common.util.L10nUtil;
import com.zimbra.common.util.ZimbraCookie;
import com.zimbra.common.util.ZimbraLog;
import com.zimbra.cs.account.*;
import com.zimbra.cs.extension.ExtensionHttpHandler;
import com.zimbra.common.util.L10nUtil.MsgKey;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;

import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.StandardCopyOption;
import java.util.*;

import com.zimbra.cs.service.AuthProvider;
import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.json.JSONObject;
import org.json.JSONArray;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.List;

import com.zimbra.oauth.handlers.impl.NextCloudTokenHandler;
import com.github.sardine.DavResource;
import com.github.sardine.impl.SardineImpl;

public class Nextcloud extends ExtensionHttpHandler {

    /**
     * The path under which the handler is registered for an extension.
     *
     * @return path
     */
    @Override
    public String getPath() {
        return "/nextcloud";
    }

    /**
     * Processes HTTP GET requests.
     *
     * @param req  request message
     * @param resp response message
     * @throws java.io.IOException
     * @throws javax.servlet.ServletException
     */
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        AuthToken authToken = null;
        Account account = null;
        String accessToken = null;

        try {
            final String cookieString = getFromCookie(req.getCookies(),
                    ZimbraCookie.authTokenCookieName(false));
            authToken = getAuthToken(cookieString);
            account = getAccount(authToken);
            accessToken = NextCloudTokenHandler.refreshAccessToken(account, "nextcloud");

        } catch (Exception e) {
            e.printStackTrace();
        }

        if (req.getParameter("url") != null) {


            //work around for cors OPTIONS request not permitted in Nextcloud ATM
            resp.getOutputStream().print("<!doctype html>");
            resp.getOutputStream().print("<html lang=\"en\">");
            resp.getOutputStream().print("<head>");
            resp.getOutputStream().print("  <meta charset=\"utf-8\">");
            resp.getOutputStream().print("  <!--ZM-NC-TOKEN-OK-->");
            resp.getOutputStream().print("</head>");
            resp.getOutputStream().print("<body><form id=\"ncForm\" action=\"" + req.getParameter("url") + "\" method=\"post\"><input type=\"hidden\" name=\"token\" value=\"" + accessToken + "\"></form>");
            resp.getOutputStream().print("  <script>");
            resp.getOutputStream().print("  document.getElementById(\"ncForm\").submit();");
            resp.getOutputStream().print("</script>");
            resp.getOutputStream().print("</body>");
            resp.getOutputStream().print("</html>");
        } else {
            resp.getOutputStream().print("com.zimbra.nextcloud is installed.");
        }
    }

    /**
     * Processes HTTP POST requests.
     *
     * @param req  request message
     * @param resp response message
     * @throws java.io.IOException
     * @throws javax.servlet.ServletException
     */
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, ServletException {
        AuthToken authToken = null;
        Account account = null;
        String accessToken = null;

        try {
            final String cookieString = getFromCookie(req.getCookies(),
                    ZimbraCookie.authTokenCookieName(false));
            authToken = getAuthToken(cookieString);
            account = getAccount(authToken);
            accessToken = NextCloudTokenHandler.refreshAccessToken(account, "nextcloud");
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {

            JSONObject receivedJSON = new JSONObject(IOUtils.toString(req.getPart("jsondata").getInputStream(), "UTF-8"));
            String action = receivedJSON.getString("nextcloudAction");
            String path = receivedJSON.getString("nextcloudPath");
            String nextcloudDAVPath = receivedJSON.getString("nextcloudDAVPath");

            SardineImpl sardine = new SardineImpl(accessToken);
            //having to do a replace for spaces, maybe a bug in Sardine.
            path = nextcloudDAVPath + uriEncode(path).replace("%2F", "/");

            switch (action) {
                case "propfind":
                    JSONArray propfindResponse = this.propfind(sardine, path);
                    resp.setContentType("application/json");
                    resp.setCharacterEncoding("UTF-8");
                    resp.getOutputStream().print(propfindResponse.toString());
                    break;
                case "get":
                    ContentLengthInputStream is = sardine.get(path);
                    Header[] originalHeadersFromNc = is.getResponse().getAllHeaders();
                    for (int n = 0; n < originalHeadersFromNc.length; n++) {
                        Header header = originalHeadersFromNc[n];
                        if ("Content-Type".equals(header.getName())) {
                            resp.setHeader("Content-Type", header.getValue());
                        }
                        if ("Content-Disposition".equals(header.getName())) {
                            resp.setHeader("Content-Disposition", header.getValue());
                        }
                    }
                    is.transferTo(resp.getOutputStream());
                    break;
                case "put":
                    String name = receivedJSON.getString("nextcloudFilename");
                    //having to do a replace for spaces, maybe a bug in Sardine.
                    name = uriEncode(name).replace("%2F", "/");
                    resp.setContentType("application/json");
                    resp.setCharacterEncoding("UTF-8");
                    resp.getOutputStream().print(receivedJSON.toString());
                    if (fetchMail(req, authToken, accessToken, path, name, receivedJSON)) {
                        resp.setStatus(200);
                    } else {
                        resp.setStatus(500);
                    }
                    break;
                default:
                    resp.getOutputStream().print("com.zimbra.nextcloud is installed.");
                    return;
            }

        } catch (
                Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Retrieves authToken from header or cookie.<br>
     * JWT is searched for as priority, then cookie.
     *
     * @param cookies Request cookies
     * @param headers Request headers
     * @return An auth token
     * @throws ServiceException If there are issues creating the auth token
     */
    protected static AuthToken getAuthToken(String authTokenStr)
            throws ServiceException {
        AuthToken authToken = null;
        try {
            authToken = ZimbraAuthToken.getAuthToken(authTokenStr);
        } catch (final AuthTokenException e) {
            ZimbraLog.extensions.info("Error authenticating user.");
            throw ServiceException.PERM_DENIED(HttpServletResponse.SC_UNAUTHORIZED + ": "
                    + L10nUtil.getMessage(MsgKey.errMustAuthenticate));
        }
        return authToken;
    }


    /**
     * Retrieves a cookie from the cookie jar.
     *
     * @param cookies    Cookie jar
     * @param cookieName The specific cookie we need
     * @return A cookie
     */
    private static String getFromCookie(Cookie[] cookies, String cookieName) {
        String encodedAuthToken = null;
        if (cookies != null) {
            for (int i = 0; i < cookies.length; i++) {
                if (cookies[i].getName().equals(cookieName)) {
                    encodedAuthToken = cookies[i].getValue();
                    break;
                }
            }
        }
        return encodedAuthToken;
    }

    protected static Account getAccount(AuthToken authToken) throws ServiceException {
        Account account = null;
        if (authToken != null) {
            if (authToken.isZimbraUser()) {
                if (!authToken.isRegistered()) {
                    throw ServiceException.PERM_DENIED(HttpServletResponse.SC_UNAUTHORIZED + ": "
                            + L10nUtil.getMessage(MsgKey.errMustAuthenticate));
                }
                try {
                    account = AuthProvider.validateAuthToken(Provisioning.getInstance(),
                            authToken, true);
                } catch (final ServiceException e) {
                    throw ServiceException.PERM_DENIED(HttpServletResponse.SC_UNAUTHORIZED + ": "
                            + L10nUtil.getMessage(MsgKey.errMustAuthenticate));
                }
            } else {
                throw ServiceException.PERM_DENIED(HttpServletResponse.SC_UNAUTHORIZED + ": "
                        + L10nUtil.getMessage(MsgKey.errMustAuthenticate));
            }
        } else {
            throw ServiceException.PERM_DENIED(HttpServletResponse.SC_UNAUTHORIZED + ": "
                    + L10nUtil.getMessage(MsgKey.errMustAuthenticate));
        }

        if (account == null) {
            throw ServiceException.PERM_DENIED(HttpServletResponse.SC_UNAUTHORIZED + ": "
                    + L10nUtil.getMessage(MsgKey.errMustAuthenticate));
        }

        ZimbraLog.extensions.debug("Account is:%s", account);

        return account;
    }

    public boolean fetchMail(HttpServletRequest req, AuthToken authToken, String
            accessToken, String Path, String fileName, JSONObject mailObject) {
        try {
            File targetFile = File.createTempFile("sardine", ".html", new File("/tmp"));
            File targetPdf = new File(targetFile.toString().replace(".html", ".pdf"));
            try {
                HttpURLConnection connection = null;

                String uri = req.getScheme() + "://" +
                        req.getServerName() +
                        ":" + req.getServerPort() +
                        "/h/printmessage?id=" + mailObject.getString("id");

                URL url = new URL(uri);

                connection = (HttpURLConnection) url.openConnection();
                connection.setDoOutput(true);
                connection.setUseCaches(false);
                connection.setInstanceFollowRedirects(true);
                connection.setRequestMethod("GET");
                connection.setRequestProperty("charset", "utf-8");
                connection.setRequestProperty("Content-Length", "0");
                connection.setRequestProperty("Cookie", "ZM_AUTH_TOKEN=" + authToken.getEncoded() + ";");
                connection.setUseCaches(false);

                if (connection.getResponseCode() == 200) {
                    java.nio.file.Files.copy(
                            connection.getInputStream(),
                            targetFile.toPath(),
                            StandardCopyOption.REPLACE_EXISTING);
                } else {
                    throw new Exception("com.zimbra.nextcloud cannot fetch email");
                }

                /*
                Install wkhtmltopdf from  https://wkhtmltopdf.org/downloads.html not from OS repo!!
                ln -s /usr/local/bin/wkhtmltopdf /bin/wkhtmltopdf
                 */

                List<String> cmd = new ArrayList<String>(Arrays.asList("wkhtmltopdf"));
                cmd.add(targetFile.getAbsolutePath());
                cmd.add(targetPdf.getAbsolutePath());
                execCommand(cmd);
                targetFile.delete();
                SardineImpl sardine = new SardineImpl(accessToken);
                sardine.put(Path + fileName.replace(".pdf", "") + ".pdf", targetPdf, "application/pdf");
                targetPdf.delete();

                JSONArray attachments = null;
                try {
                    attachments = mailObject.getJSONArray("attachments");
                } catch (Exception e) {
                }

                //fetch and upload attachments
                if (attachments != null) {
                    for (int i = 0; i < attachments.length(); i++) {
                        JSONObject attachment = attachments.getJSONObject(i);
                        uri = req.getScheme() + "://" +
                                req.getServerName() +
                                ":" + req.getServerPort() +
                                attachment.getString("url") + "&disp=a";

                        url = new URL(uri);

                        connection = (HttpURLConnection) url.openConnection();
                        connection.setDoOutput(true);
                        connection.setUseCaches(false);
                        connection.setInstanceFollowRedirects(true);
                        connection.setRequestMethod("GET");
                        connection.setRequestProperty("charset", "utf-8");
                        connection.setRequestProperty("Content-Length", "0");
                        connection.setRequestProperty("Cookie", "ZM_AUTH_TOKEN=" + authToken.getEncoded() + ";");
                        connection.setUseCaches(false);

                        if (connection.getResponseCode() == 200) {
                            sardine = new SardineImpl(accessToken);
                            //having to do a replace for spaces, maybe a bug in Sardine.
                            String attachmentFileName = uriEncode(attachment.getString("filename")).replace("%2F", "/");
                            sardine.put(Path + fileName.replace(".pdf", "") + '-' + attachmentFileName, connection.getInputStream());
                        } else {
                            throw new Exception("com.zimbra.nextcloud cannot fetch attachment");
                        }
                    }
                }

                return true;
            } catch (Exception e) {
                targetFile.delete();
                targetPdf.delete();
                e.printStackTrace();
                return false;
            }
        } catch (Exception e) {
            System.out.println("com.zimbra.nextcloud seems we have no access to /tmp on this server....");
            e.printStackTrace();
            return false;
        }
    }

    private static void execCommand(List<String> command) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            Process p = pb.start();
            p.waitFor();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * Perform a PROPFIND request.
     * <p>
     * Implement Custom DAV Property oc:fileid, needed for OnlyOffice and other integrations
     * {http://owncloud.org/ns}fileid The unique id for the file within the instance
     * https://docs.nextcloud.com/server/12/developer_manual/client_apis/WebDAV/index.html
     * <p>
     * Copied from com.zextras.dav->DavSoapConnector.java from ownCloud Zimlet
     */
    public JSONArray propfind(SardineImpl mSardine, String Path)
            throws IOException {
        try {
            final JSONArray arrayResponse = new JSONArray();
            //to-do: check if this breaks WebDAV Servers that do not implement this, aka Alfresco,
            //if it breaks, make it configurable
            Set<QName> CustomProps = new HashSet<QName>();
            CustomProps.add(new QName("http://owncloud.org/ns", "fileid", "oc"));
            CustomProps.add(new QName("DAV:", "getcontentlength", "d"));
            CustomProps.add(new QName("DAV:", "getlastmodified", "d"));
            CustomProps.add(new QName("DAV:", "getcontenttype", "d"));
            CustomProps.add(new QName("DAV:", "resourcetype", "d"));

            List<DavResource> propfind = mSardine.propfind(
                    Path,
                    1,
                    CustomProps
            );

            for (DavResource resource : propfind) {
                JSONObject res = new JSONObject();
                res.put("href", getDAVPath(resource.getPath()));
                if (resource.getCreation() != null) {
                    res.put("creation", resource.getCreation().getTime());
                }
                if (resource.getModified() != null) {
                    res.put("modified", resource.getModified().getTime());
                }
                res.put("contentType", resource.getContentType());
                res.put("contentLength", resource.getContentLength());
                res.put("etag", resource.getEtag());
                res.put("displayName", resource.getDisplayName());

                JSONArray resourceTypes = new JSONArray();
                for (QName name : resource.getResourceTypes()) {
                    resourceTypes.put("{" + name.getNamespaceURI() + "}" + name.getLocalPart());
                }
                res.put("resourceTypes", resourceTypes);
                res.put("contentLanguage", resource.getContentLanguage());
                JSONArray supportedReports = new JSONArray();
                for (QName name : resource.getSupportedReports()) {
                    supportedReports.put("{" + name.getNamespaceURI() + "}" + name.getLocalPart());
                }
                res.put("supportedReports", supportedReports);
                JSONObject customProps = new JSONObject();
                for (String key : resource.getCustomProps().keySet()) {
                    customProps.put(key, resource.getCustomProps().get(key));
                }
                res.put("customProps", customProps);
                arrayResponse.put(res);
            }
            return arrayResponse;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public String getDAVPath(String path) {
        String matchFilter = "remote.php/webdav";
        return path.substring(path.lastIndexOf(matchFilter) + matchFilter.length());
    }

    public String uriEncode(String dirty) {
        try {
            String clean = java.net.URLEncoder.encode(dirty, "UTF-8");
            return clean.replaceAll("\\+", "%20");
        } catch (Exception ex) {
            return ex.toString();
        }
    }

    private String uriDecode(String dirty) {
        try {
            String clean = java.net.URLDecoder.decode(dirty, "UTF-8");
            return clean;
        } catch (Exception ex) {
            return ex.toString();
        }
    }
}
