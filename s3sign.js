/**
 *
 * s3sign.js v1.0
 * github.com/roxtar/s3sign.js
 * (c) 2014 Rohit Kumar. All rights reserved.
 * github.com/roxtar/s3sign.js/LICENSE
 *
 */

if (typeof s3sign === "undefined") {

  var s3sign = (function() {
    function logError(msg) {
      var prefix="error: "
      console.log(prefix + msg);
    }

    // The result of this subroutine is a string to which the resource path (sans
    // bucket, including a leading '/') can be appended.  Examples include:
    // - "http://s3.amazonaws.com/bucket"
    // - "http://bucket.s3.amazonaws.com"
    // - "http://<vanityDomain>"  -- vanityDomain resolves to s3.amazonaws.com
    //
    // parameters:
    // - protocol - ex: "http" or "https"
    // - server   - ex: "s3.amazonaws.com"
    // - port     - ex: "80"
    // - bucket   - ex: "myBucket"
    // - format   - ex: "SUBDOMAIN"
    function buildUrlBase(protocol, server, port, bucket, callingFormat) {
      var url = protocol + "://";
      if (bucket === "") {
        url += server + ":" + port;
      } else if (callingFormat === "PATH") {
        url += server + ":" + port + "/" + bucket;
      } else if (callingFormat === "SUBDOMAIN") {
        url += bucket + "." + server + ":" + port;
      } else if (callingFormat === "VANITY") {
        url += bucket + ":" + port
      } else {
        logError("Unknown or unhandled CALLING_FORMAT");
      }
      return url;
    }
    // Generate a canonical string for the given parameters.  Expires is optional and is
    // only used by query string authentication. "path " is the resource NOT INCLUDING
    // THE BUCKET.
    function canonicalString(method, bucket, path, pathArgs, headers, expires) {
      var interestingHeaders = {}
      var kAmazonHeaderRegex = new RegExp("^x-amz-");
      interestingHeaders["content-type"] = "";
      interestingHeaders["content-md5"] = "";
      interestingHeaders["date"] = "";
      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          var lowerKey = key.toLowerCase();  // lower case, lower bass.
          switch (lowerKey) {
            case "content-md5":
            case "content-type":
            case "date":
              interestingHeaders.lowerKey = headers[key].trim();
          }
          if (lowerKey.match(kAmazonHeaderRegex)) {
            interestingHeaders.lowerKey = headers[key].trim();
          }
        }
      }
      interestingHeaders["date"] = expires;

      var sortedKeys = [];
      for (var key in interestingHeaders) {
          if (interestingHeaders.hasOwnProperty(key)) {
              sortedKeys.push(key);
          }
      }
      sortedKeys.sort();

      var str = method + "\n";
      for (var i = 0; i < sortedKeys.length; i++) {
          var key = sortedKeys[i];
          if (key.match(kAmazonHeaderRegex)) {
              str += key + ":" + interestingHeaders[key] + "\n";
          } else {
              str += interestingHeaders[key] + "\n";
          }
      }
      // bucket is non-empty
      if (bucket) {
          str += "/" + bucket;
      }
      str += "/" + path;

      var specialArgList = ["acl", "location", "logging", "torrent"];
      var foundSpecialArgs = [];
      for (var arg in pathArgs) {
          if (pathArgs.hasOwnProperty(arg)) {
              for (var i = 0; i < specialArgList.length; i++) {
                  if (arg === specialArgList[i]) {
                      foundSpecialArgs.push(arg);
                  }
              }
          }
      }

      if (foundSpecialArgs.length > 1) {
          logError("More than one special query-string argument found: " + foundSpecialArgs.join());
      } else if (foundSpecialArgs.length === 1) {
          str += "?" + foundSpecialArgs[0];
      }
      return str;
    }

    // finds the hmac-sha1 hash of the canonical string and the aws secret access key and then
    // base64 encodes the result (optionally urlencoding after that).
    function encode(secretKey, canonicalString, urlEncode) {
      var hmac = CryptoJS.HmacSHA1(canonicalString, secretKey);
      var b64 = hmac.toString(CryptoJS.enc.Base64);
      if (urlEncode) {
        return encodeURIComponent(canonicalString);
      } else {
        return b64;
      }
    }

    function pathArgsToHashString(pathArgs) {
      var argStr = "";
      for (var key in pathArgs) {
        if(pathArgs.hasOwnProperty(key)) {
          var val = pathArgs[key];
          argStr += key;
          if (val) {
            argStr += "=" + encodeURIComponent(val);
          }
          argStr += "&";
        }
      }
      // Remove trailing '&' and return
      return argStr.substring(0, argStr.length - 1);
    }

    var s3sign_ = {
      generateSignedUrl : function(
        accessKey, 
        secretKey, 
        expiresInSeconds, 
        method, 
        bucket, 
        path,
        expires,
        pathArgs, 
        headers) {
        if (!method) {
          logError("Must specify method");
          return;
        }
        if (!path) {
          logError("Must specify path");
          return;
        }
        if (typeof pathArgs === "undefined" ) {
          pathArgs = {};
        }

        if (typeof headers === "undefined") {
          headers = {};
        }
        var expiresDate;
        if (expiresInSeconds) {
          var expiresInInt = parseInt(expiresInSeconds)
          var date = new Date();
          date.setSeconds(date.getSeconds() + expiresInInt);
          expiresDate = date;
        } else if (expires) {
          expiresDate = Date.parse(expires);
        } else {
          logError("The expiration date or the expiration seconds need to be present.");
        }

        // TODO: Make these values configurable
        var protocol = "https"
        var server = "s3.amazonaws.com";
        var port = 443;
        var urlEncode = false;
        var callingFormat = "PATH";

        var urlBase = buildUrlBase(protocol, server, port, bucket, callingFormat);
        var expiresString = Math.floor(expiresDate.getTime()/1000);
        var canonicalStr = canonicalString(method, bucket, path, pathArgs, headers, expiresString);
        var encodedCanonical = encode(secretKey, canonicalStr, urlEncode);
        pathArgs["Signature"] = encodedCanonical;
        pathArgs["Expires"] = expiresString;
        pathArgs["AWSAccessKeyId"] = accessKey;
        var argString = pathArgsToHashString(pathArgs);

        var signedUrl = urlBase + "/" + path + "?" + argString;
        return signedUrl;
      }
    }
    return s3sign_;
  })();
}
