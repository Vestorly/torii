export default function(){
  return {
    init() {},

    login(callback, options) {
      const authResponse = { expiresIn: 1234 };

      if (options.return_scopes === true) {
        authResponse.grantedScopes = 'email';
      }

      if (options.auth_type === 'rerequest') {
        authResponse.expiresIn = 5678;
      }

      callback({
        authResponse: authResponse,
        status: 567
      });
    }
  };
}
