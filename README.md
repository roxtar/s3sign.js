s3sign.js
=========

s3sign.js is a JavaScript library to generate signed S3 URLs. It's intended to be run in a browser, but it should be easy enough to port it to run on node.js. The s3sign.js library depends on [CryptoJS](https://code.google.com/p/crypto-js/).

Demo
-----
[See demo here.](http://roxtar.github.io/s3sign/s3sign.html)

Usage
------
Include the following scripts in your HTML
```html
  <script src="CryptoJS/hmac-sha1.js"></script>
  <script src="CryptoJS/enc-base64.js"></script>
  <script src="s3sign.js"></script>
```
Wherever you want to generate a signed URL, you can call

```html
  <script type="text/javascript">
   var signedUrl = s3sign.generateSignedUrl(
        accessKey,            // AWS Access Key
        secretKey,            // AWS secret Key
        expiresInSeconds,     // Expiration time in seconds from now
        http_method,          // HTTP method. GET, POST, etc
        s3Bucket,             // Your S3 bucket name
        path                  // Path to your S3 key. Do not include the bucket name in this.
        );

  </script>
```
