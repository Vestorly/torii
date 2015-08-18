var jwtDecode = function(jwtToken) {
  var parts = jwtToken.split('.');
  var payload = parts[1];
  var output = payload.replace(/-/g, "+").replace(/_/g, "/");
  // sorry about the window. here can't be helped see:
  // http://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  var decodedToken;
  try {
    decodedToken = decodeURIComponent(window.escape(atob(output)));
  } catch (err) {
    decodedToken = atob(output);
  }
  return JSON.parse(decodedToken);
};

export default jwtDecode;
