/**
 * Class: AsyncRequest
 * -------------------
 * Defines a JavaScript class that allows an asynchronous server
 * request to be made, and for the server response to be handled.
 *
 * If I'm interested in retrieving (e.g. "GET"-ting) the document
 * at https://www.google.com/search?q=hey, then I would rely
 * on the following JavaScript block to manage precisely that:
 *
 *   let request = AsyncRequest(https://www.google.com/search?q=hey);
 *   request.addParam("q", "hey");
 *   request.setSuccessHandler(handleResponse);
 *   request.send();
 *
 * Alternatively, you can daisy-chain method calls like this if it's more
 * convenient.
 *
 *   AsyncRequest(https://www.google.com/search?q=hey)
 *      .addParam("q", "hey")
 *      .setSuccessHandler(handleResponse)
 *      .send()
 *
 * The function installed to handle the server's response to a request must
 * be a one-argument function that takes an object of type AsyncResponse.  In the
 * context of the example above, handleResponse might look something like this:
 *
 *   function handleResponse(response) {
 *      console.log("Status code: " + response.getStatus());
 *      console.log("Status text: " + response.getStatusText());
 *      console.log("Payload length: " + response.getPayload().length);
 *   }
 *
 * The success handler is invoked whenever the web server is happy with the request and
 * responds with a status code of 200, which means everything went OK.  Whenever the server
 * responds with a status code of 400 or higher (404 is familiar to you, and 403 is fairly
 * common as well), then the success handler is ignored, and, if set, and error handler is
 * invoked instead. 
 */
"use strict";

let AsyncRequest = function(url) {
   url = normalize(url);   
   let method = "GET",
       success = undefined, 
       error = undefined,
       payload = undefined,
       contentType = "application/json",
       params = {};

/*
 * Function: setMethod
 * -------------------
 * Sets the method of the request.  Reasonable values
 * are "GET" and "POST".  If you never call setMethod,
 * then the method just defaults to "GET".
 */

   function setMethod(m) {
      method = m
      return this;
   };

/*
 * Function: setPayload
 * -------------------
 * Sets the payload of the request to be equal to that
 * provided.  Setting the payload automatically sets
 * the method to be "POST".
 */
   function setPayload(p) {
      method = "POST";
      payload = p;
      return this;
   };

/*
 * Function: setContentType
 * ------------------------
 * Sets the content type of any payload to be equal to that
 * provided.  By default, the content type is "application/text",
 * but it could be set to other things like "application/json",
 * 
 */  
   function setContentType(pt) {
      contentType = pt;
      return this;
   };

/**
 * Function: setSuccessHandler
 * ---------------------------
 * Installs the function that should be invoked when the request
 * has been received and processed and an HTTP response has been
 * sent back with status code of 200.
 *
 * The success handler can be any function that takes a single
 * parameter, which is an instance of the AsyncResponse object outlined
 * below.  See the overview documentation at the type of this file for
 * more detail.
 */
   function setSuccessHandler(fn) {
      success = fn;
      return this;
   };
   
/*
 * Function: setErrorHandler
 * -------------------------
 * Operates just like setSuccessHandler does, except the supplied
 * handler is only invoked if the response contains a status code of 400
 * or higher.  That's a statement that the was either a client error or
 * a server error that interfered with the server's ability to properly
 * handle the request.
 */
   function setErrorHandler(fn) {
      error = fn;
      return this;
   };

/*
 * Function: addParam
 * ------------------
 * Adds a single key/value pair to be included in the URL come send time.
 */   
   function addParam(key, value) {
      params[key] = value;
      return this;
   };
 
/*
 * Function: addParam
 * ------------------
 * Adds a collection of key/value pairs to be included in the URL
 * come send time.
 */  
   function addParams(p) {
      for (let key in p) {
         params[key] = p[key]
      }
      return this;
   };

/*
 * Function: send
 * --------------
 * Constructs the URL and sends the relevant HTTP request, and then
 * schedules any installed handlers to process the response.
 */
   function send() {
      let query = serializeParamaters();
      if (query.length > 0) url = url + "?" + query;
      let r;
      fetch(url, getOptions())
       .then(function(response) {
          r = response;
          return r.text();
       })
       .then(function(payload) {
          let response = AsyncResponse(r, payload);
          if (r.ok) {
             if (success) success(response);
          } else {
             if (error) error(response)
          }
       });
    };

    return {
       setMethod: setMethod,
       setContentType: setContentType,
       setPayload: setPayload,
       setSuccessHandler: setSuccessHandler,
       setErrorHandler: setErrorHandler,
       addParam: addParam,
       addParams: addParams,
       send: send
     };
   
/* Private methods */   
     
/*
 * Function: serializeParamaters
 * -----------------------------
 * Builds the query string out of the key/value map, and returns
 * the string.  The encodeURIComponent calls are in place to encode
 * characters (spaces, ampersands, equal signs, etc.) that might
 * otherwise be interpreted as delimiters or meta characters in the URL.
 */
   function serializeParamaters() {
      let components = [];
      for (let key in params) {
         key = encodeURIComponent(key)
         let value = encodeURIComponent(params[key])
         components.push([key, value].join("="));
      }
      return components.join("&");
   };

/*
 * Function: getOptions
 * --------------------
 * Constructs the set of options that the fetch API needs to
 * properly service the async request.
 */
   function getOptions() {
      let options = {};
      options.method = method;
      options.redirect = "follow";
      if (method === "POST" && payload !== undefined) {
         options.body = payload;
         options.headers = {};
         options.headers["Content-Type"] = contentType;
         options.headers["Content-Length"] = payload.length.toString();
      }
      return options;
   }

/*
 * Function: normalize
 * --------------------
 * Accepts the provided url and returns the same string with the
 * query string and the fragment removed.
 */
   function normalize(url) {
      if (url.indexOf("?") === -1 && url.indexOf("#") === -1) return url;
      let qpos = url.indexOf("?");
      if (qpos !== -1) url = url.substring(0, qpos);
      let fpos = url.indexOf("#");
      if (fpos !== -1) url = url.substring(0, fpos);
      return url;       
   };
}

/**
 * Class: AsyncResponse
 * --------------------
 * Encaspulates information about the server response, and affords
 * a trio of methods that can be used to extract the status code (e.g. 200, 403, 404, etc.),
 * the status message (e.g. "OK", "File Not Found", etc.).
 *
 * Note that you don't construct objects of this type.  Instances of this class
 * are constructed for you and passed to your success and error handlers.
 */
function AsyncResponse(response, payload) {

/*
 * Function: getStatus
 * -------------------
 * Self-explanatory.
 */
   function getStatus() {
     return response.status;
   }

/*
 * Function: getStatusText
 * -----------------------
 * Self-explanatory.
 */
   function getStatusText() {
     return response.statusText;
   }

/*
 * Function: getPayload
 * --------------------
 * Self-explanatory.
 */
   function getPayload() {
     return payload;
   }
   
/*
 * Function: getContentType
 * ------------------------
 * Retrieves the content type from the response header to
 * inform the client how the payload data is structured.
 */
   function getContentType() {
      return response.headers.get('Content-Type');
   }
   
   return {
      getStatus: getStatus,
      getStatusText: getStatusText,
      getContentType: getContentType,
      getPayload: getPayload
   };
};
