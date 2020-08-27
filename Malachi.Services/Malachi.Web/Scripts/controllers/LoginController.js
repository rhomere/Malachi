'use strict';
MALACHIAPP.controller('LoginController', ['$rootScope', '$scope', 'localStorageService', '$location', '$state', '$timeout', 'authService', 'ngAuthSettings', 'organizationService', function ($rootScope, $scope, localStorageService, $location, $state, $timeout, authService, ngAuthSettings, organizationService) {

  if (authService.authentication.isAuth) {
    if (authService.authentication.changePassword) {
      $location.path('/changepassword');
      return;
    }
    redirect();
  } else {
    // Call this after the whole page is loaded.
    $rootScope.$broadcast('$pageloaded');
  }

  if (authService.redirectToLogin) {
    location.reload(true);
    return;
  }

  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
  });

  $scope.errorList = [];
  // set sidebar closed and body solid layout mode
  $rootScope.settings.layout.pageBodySolid = false;
  //$rootScope.settings.layout.pageSidebarClosed = false;

  $scope.rootScope = $rootScope;

  $scope.showLogin = false;
  var organization = '';
  organizationService.getOrganization().then(function (result) {
    organization = result.data.Organization.Name;
    if (organization == 'Bass Online') {
      $scope.showLogin = false;//window.serviceBase.indexOf('localhost') > -1;
    } else {
      $scope.showLogin = true;
    }
  });

  var ua = detect.parse(navigator.userAgent);
  $scope.BrowserName = ua.browser.family;
  $scope.OSName = ua.os.family;
  $scope.OSVersion = parseInt(ua.os.major);

  $scope.loginData = {
    userName: "",
    password: "",
    useRefreshTokens: false
  };


  var rememberme = localStorageService.get('malachi_rememberme');
  if (rememberme !== null) {
    $scope.loginData.rememberme = true;
    $scope.loginData.userName = rememberme.username;
  }

  $scope.message = "";

  $scope.login = function () {
    $scope.errorList = [];
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    authService.login($scope.loginData).then(function (response) {
      if ($scope.loginData.rememberme) {
        localStorageService.set('malachi_rememberme', { username: $scope.loginData.userName });
      } else {
        localStorageService.remove('malachi_rememberme');
      }

      if (response.changePassword === "True") {
        $location.path('/changepassword');
      }
      else {
        $location.path('/dashboard');
      }
      Metronic.unblockUI();
    },
      function (err) {
        $scope.errorList.push(err.error_description);
        Metronic.unblockUI();
        //$scope.message = err.error_description;
      });
  };

  $scope.keyPress = function (keyCode) {
    if (keyCode === 13) {
      $scope.login();
    }
  }

  function redirect() {
    if ($rootScope.Organization !== null) {
      $location.path('/dashboard');
    }
    else {
      $timeout(function () {
        redirect();
      }, 100);
    }
  }


  $('#loginContainer').fadeIn(1000);
}]);