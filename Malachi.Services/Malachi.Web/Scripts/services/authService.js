'use strict';
MALACHIAPP.factory('authService', ['organizationService', '$http', '$q', 'localStorageService', 'ngAuthSettings', function (organizationService, $http, $q, localStorageService, ngAuthSettings) {

  var serviceBase = ngAuthSettings.apiServiceBaseUri;
  var authServiceFactory = {};

  var _authentication = {
    isAuth: false,
    userName: "",
    firstName: "",
    lastName: "",
    roles: [],
    organizationId: null,
    organizationType: null,
    changePassword: null,
    useRefreshTokens: false
  };

  var _externalAuthData = {
    provider: "",
    userName: "",
    firstName: "",
    lastName: "",
    roles: [],
    organizationId: null,
    organizationType: null,
    changePassword: null,
    externalAccessToken: ""
  };

  var setAuthData = function (response, access_token) {
    // Save the results (and token)
    localStorageService.set('authorizationData',
        {
            token: access_token,
            userName: response.userName,
            officeId: response.officeId,
            firstName: response.firstName,
            lastName: response.lastName,
            organizationType: response.organizationType,
            organizationId: response.organizationId,
            changePassword: response.changePassword,
            roles: response.roles.split(','),
            isUnderwriterExec: response.isUnderwriterExec == "True",
            userId: response.userId,
            claims: JSON.parse(response.claims)
      });

    _authentication.isAuth = true;
    _authentication.userName = response.userName;
    _authentication.firstName = response.firstName;
    _authentication.lastName = response.lastName;
    _authentication.roles = response.roles.split(',');
    _authentication.organizationId = response.organizationId;
    _authentication.organizationType = response.organizationType;
    _authentication.changePassword = response.changePassword == "True";
    _authentication.officeId = response.officeId;
    _authentication.isUnderwriterExec = response.isUnderwriterExec == "True";
    _authentication.userId = response.userId;
  }


  var organization = '';
  organizationService.getOrganization().then(result => {
    organization = result.data.Organization.Name;
       
      var uri = window.location.href.indexOf("http://localhost:49956") > -1 ? 'http://localhost:49956' :
          window.location.href.indexOf("test-client-dev") > -1 ? "" :
                                                                         "";
      var client_id = window.location.href.indexOf("http://localhost:49956") > -1 ? 'malachi.local' : "malachi.Web";

      var config = {
        authority: window.authServiceUri,
        client_id: client_id,
        redirect_uri: uri + "/callback.html",
        response_type: "id_token token",
        scope: "client openid profile api1",
        post_logout_redirect_uri: uri + "/index.html"
      };

      authServiceFactory.userManager = new Oidc.UserManager(config);
      authServiceFactory.userManager.getUser().then(function (user) {
        if (user) {
          localStorageService.set('authorizationData', { token: user.access_token });
          // Ask the server for user profile, also add the token
          $http.get(window.serviceBase + 'api/Account/GetProfile').success(function (response) {
            setAuthData(response, user.access_token);
          });
        } else {
          // If its local host, we are going to skip SSO
          //if (window.serviceBase.indexOf('localhost') < 0) {
          _authentication.isAuth = false;
          authServiceFactory.userManager.signinRedirect();
          //}
        }
      }); 
  });

  var _resetPassword = function (email) {
    return $http.post(serviceBase + 'api/account/EmailResetPassword', { Email: email }).then(function (response) {
      return response;
    });
  }

  var login2 = function (loginData, deferred) {
    $http.post(window.serviceBase + 'api/Account/Login', { userName: loginData.userName, password: loginData.password }).success(response => {
      setAuthData(response, response.access_token);
      deferred.resolve(response);
    });
  }

  var _login = function (loginData) {
    var deferred = $q.defer();

    if (organization == "Bass Online") {
      login2(loginData, deferred);
      return deferred.promise;
    }

    var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

    if (loginData.useRefreshTokens) {
      data = data + "&client_id=" + ngAuthSettings.clientId;
    }

    $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

      if (loginData.useRefreshTokens) {
        localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, firstName: response.firstName, lastName: response.lastName, organizationType: response.organizationType, organizationId: response.organizationId, changePassword: response.changePassword, roles: response.roles.split(','), refreshToken: response.refresh_token, useRefreshTokens: true, isUnderwriterExec: response.isUnderwriterExec == "True", userId: response.userId });
      }
      else {
        localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, officeId: response.officeId, firstName: response.firstName, lastName: response.lastName, organizationType: response.organizationType, organizationId: response.organizationId, changePassword: response.changePassword, roles: response.roles.split(','), refreshToken: "", useRefreshTokens: false, isUnderwriterExec: response.isUnderwriterExec == "True", userId: response.userId });
      }
      _authentication.isAuth = true;
      _authentication.userName = loginData.userName;
      _authentication.firstName = response.firstName;
      _authentication.lastName = response.lastName;
      _authentication.roles = response.roles.split(',');
      _authentication.organizationId = response.organizationId;
      _authentication.organizationType = response.organizationType;
      _authentication.changePassword = response.changePassword == "True";
      _authentication.useRefreshTokens = loginData.useRefreshTokens;
      _authentication.officeId = response.officeId;
      _authentication.isUnderwriterExec = response.isUnderwriterExec == "True";
      _authentication.userId = response.userId;

      deferred.resolve(response);

    }).error(function (err, status) {
      _logOut();
      deferred.reject(err);
    });

    return deferred.promise;

  };

  var _changePassword = function (loginData) {

    var data = loginData;

    var deferred = $q.defer();

    $http.post(serviceBase + 'api/account/ChangePassword', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err, status) {
      deferred.reject(err);
    });

    return deferred.promise;

  };

  var _setPasswordWithToken = function (token, newPassword, confirmPassword) {
    return $http.post(serviceBase + 'api/account/ResetPassword', { Token: token, NewPassword: newPassword, ConfirmPassword: confirmPassword }).then(function (response) {
      return response;
    });
  };

  var _logOut = function () {

    localStorageService.remove('authorizationData');

    _authentication.isAuth = false;
    _authentication.userName = "";
    _authentication.firstName = "";
    _authentication.lastName = "";
    _authentication.officeId = null;
    _authentication.roles = [];
    _authentication.organizationId = null;
    _authentication.changePassword = null;
    _authentication.organizationType = null;
    _authentication.useRefreshTokens = false;
    _authentication.isUnderwriterExec = false;
    _authentication.userId = "";

    if (authServiceFactory.userManager != null) authServiceFactory.userManager.signoutRedirect();
  };

  var _fillAuthData = function () {

    var authData = localStorageService.get('authorizationData');
    if (authData) {
      _authentication.isAuth = true;
      _authentication.userName = authData.userName;
      _authentication.firstName = authData.firstName;
      _authentication.lastName = authData.lastName;
      _authentication.officeId = authData.officeId;
      _authentication.roles = authData.roles;
      _authentication.organizationId = authData.organizationId;
      _authentication.changePassword = authData.changePassword == "True";
      _authentication.organizationType = authData.organizationType;
      _authentication.useRefreshTokens = authData.useRefreshTokens;
      _authentication.userId = authData.userId;
      _authentication.isUnderwriterExec = authData.isUnderwriterExec;
    }

  };


  var _verifyEmail = function (email) {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/account/VerifyEmail', { Email: email }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }

  authServiceFactory.login = _login;
  authServiceFactory.logOut = _logOut;
  authServiceFactory.fillAuthData = _fillAuthData;
  authServiceFactory.authentication = _authentication;
  authServiceFactory.resetPassword = _resetPassword;

  authServiceFactory.changePassword = _changePassword;
  authServiceFactory.setPasswordWithToken = _setPasswordWithToken;

  authServiceFactory.verifyEmail = _verifyEmail;

  return authServiceFactory;
}]);