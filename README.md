# nextcloud-zimlet
A modern UI Nextcloud Zimlet

See the demo:
https://github.com/Zimbra/nextcloud-zimlet/releases/download/0.0.1/Nextcloud.Zimlet.Modern.OAuth.mp4

To set up OAuth see: https://github.com/ZimbraOS/zm-oauth-social/wiki/Setting-Up-Nextcloud

Also on Nextcloud assuming it run on Apache you must add:

      RewriteEngine On
      RewriteCond %{HTTP:Authorization} ^(.*)
      RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

On Zimbra you need to install wkhtmltopdf be sure to use it from https://wkhtmltopdf.org/downloads.html and not from CentOS  repo (unless you also want to have an X server on your mailbox server)

      ln -s /usr/local/bin/wkhtmltopdf /bin/wkhtmltopdf

## Owh no it is realllly slow

Check your bruteforce protection settings in Nextcloud and try a `truncate table bruteforce_attempts`.

## Unstable feature / Tab integration

It is possible to have a Nexctloud tab integration in Zimbra. This uses an undocumented use of the login API of Nextcloud. So it may break in the future. It also needs one PHP file to be added to you Nextcloud installation. This feature can be removed from the zimlet by setting `const enableTabIntegration = false;` in index.js.

Add a file zimbra.php in the same location as where root index.php is on Nextcloud server:

```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
  <script>
xmlhttp=new XMLHttpRequest();
xmlhttp.open("GET", "index.php");
xmlhttp.setRequestHeader("OCS-APIRequest","true");
xmlhttp.setRequestHeader("Authorization","Bearer <?php echo $_POST['token'];?>");
xmlhttp.onload = function() {
window.location.href="index.php/apps/files/";
}
xmlhttp.send();
</script>
</body>
</html>

```

In addition you need to set up CORS, assuming Apache something like:

```
Header set Content-Security-Policy "frame-ancestors 'self' zimbra.example.com;"
Header set Access-Control-Allow-Origin "https://zimbra.example.com"
Header set Access-Control-Allow-Methods "GET,POST,HEAD,DELETE,PUT,OPTIONS"
Header set Access-Control-Allow-Headers "Authorization, OCS-APIRequest"

```
