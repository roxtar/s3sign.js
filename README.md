s3sign.js
=========

s3sign.js is a lightweight JavaScript library to generate signed S3 URLs. It can be run in a browser and in NodeJS. The s3sign.js library depends on [CryptoJS](https://code.google.com/p/crypto-js/).

The total **unminified** code size is 14.5 KB, which is much smaller than [aws-sdk.js](https://sdk.amazonaws.com/js/aws-sdk-2.0.25.min.js) whose minified version is 239 KB today.

* s3sign.js - 6.4 KB
* CyrptoJS  - 8.1 KB

Most of the code is a straight JavaScript port from the [s3-signed-url](https://github.com/rbrigham/s3-signed-url) Perl script.

Demo
-----
You can [see a demo here](http://roxtar.github.io/s3sign/s3sign.html).

Usage
------

### Browser
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
        httpMethod,           // HTTP method. GET, POST, etc
        s3Bucket,             // Your S3 bucket name
        path                  // Path to your S3 key. Do not include the bucket name in this.
        );

  </script>
```

### NodeJS
Installation:
<pre>
  npm install s3sign
</pre>

Example code:
<pre>
  var s3sign = require("s3sign");
  var signedUrl = s3sign.generateSignedUrl(
        accessKey,            // AWS Access Key
        secretKey,            // AWS secret Key
        expiresInSeconds,     // Expiration time in seconds from now 
        httpMethod,           // HTTP method. GET, POST, etc
        s3Bucket,             // Your S3 bucket name.
        path                  // Path to your S3 key. Do not include the bucket name in this.
        );
</pre>
