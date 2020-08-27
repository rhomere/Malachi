'use strict';

MALACHIAPP.controller('GuidelinesController', ['$rootScope', '$scope', '$http', '$sce', '$modal', 'guidelinesService', 'authService', function ($rootScope, $scope, $http, $sce, $modal, guidelinesService, authService) {
  $scope.$on('$viewContentLoaded', function () {
    $scope.treeContainer = $('#guidelines-hierarchy');
    $scope.setupChangedEvent();
    $scope.loadTreeContainer();
  });
  Metronic.blockUI({ target: "#guidelines-loading", animate: true, overlayColor: 'none' });

  $scope.Loading = false;
  $scope.Errors = [];
  $scope.treeContainer;
  $scope.selectedFileUri;
  $scope.DocumentAdded = false;
  $scope.DirectoryAdded = false;
  $scope.Roles = authService.authentication.roles;
  $scope.ShowAdminFunc = $scope.Roles.filter(x => x === 'Guideline Admin').length > 0;

  $scope.loadTreeContainer = function () {
    $scope.treeContainer.jstree({
      'core': {
        'themes': {
          'name': 'proton',
          'responsive': true
        },
        'data': getNodeChildren
      },
      'plugins': ['contextmenu'], contextmenu: { items: customMenu }
    });
  };

  function customMenu(node) {
    var items = {
      Delete: {
        label: 'Delete',
        action: function () {
          // node.directory
          // node.text
          var directory = '';
          if (node.parents[0] !== '#') {
            node.parents = node.parents.reverse();
          }
          node.parents.forEach(function (element) {
            directory += element + '/';
          });
          guidelinesService.DeleteNode(directory, node.text).then(function (result) {
            $scope.Errors = [];
            if (result.data == null) $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            if (result.data.Success) {
              $scope.Loading = true;
              Metronic.blockUI({ target: "#guidelines-loading", animate: true, overlayColor: 'none' });
              getNodeChildren($scope.node, $scope.cb, false);
            } else {
              $scope.Errors = result.data.Errors;
            }
          }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          });
        }
      }
    };

    if (node.children.length !== 0 || $scope.ShowAdminFunc === false) {
       //items.Delete._disabled = true;
      delete items.Delete;
    }
    return items;
  }

  $scope.setupChangedEvent = function () {
    $scope.treeContainer.on('changed.jstree', function (e, data) {
      if (data.selected.length == 1 && data.selected[0].includes("pdf")) {
        setSelectedFileUri(data.selected[0]);
        $scope.$apply();
      }
    });
  };

  $scope.getPdfEmbeddedSrc = function () {
    if ($scope.selectedFileUri)
      return $sce.trustAsResourceUrl($scope.selectedFileUri);
    else
      return $sce.trustAsResourceUrl("#");
  };

  $scope.getLogoSrc = function () {
    return $sce.trustAsResourceUrl("/Content/img/guidelines-logo.png");
  }

  function setSelectedFileUri(uri) {
    $scope.selectedFileUri = uri;
  };

  function getNodeChildren(node, cb, waitForContainerToUpdate) {
    $scope.node = {};
    $scope.cb = {};
    $scope.node = node;
    $scope.cb = cb;

    if (node.id == "#") {
      guidelinesService.getRootNodes(waitForContainerToUpdate).then(function (result) {
        /* HARDCODE TO DEFAULT */
        if (result.data.length >= 1 && result.data[0].children.constructor === Array)
          setDefault(result.data[0].children);

        setNodeIconPaths(result.data);
        cb.call(this, result.data);
        $scope.Loading = false;
        Metronic.unblockUI("#guidelines-loading");
      });
    }
    else {
      /* FOR FUTURE USE */
    }
  };

  function setNodeIconPaths(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.icon)
        node.icon = getIconPath(node.icon);

      if (node.children.constructor === Array) {
        setNodeIconPaths(node.children);
      }
    }
  };

  function setDefault(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.text == "Personal Lines UW Guidelines 5-2020") {
        if (!node.state)
          node.state = {};

        node.state.selected = true;
        setSelectedFileUri(node.id);
      }
    }
  };

  function getIconPath(iconName) {
    return "/Plugins/jstree3.3.5/icons/" + iconName + ".svg";
  };

  $scope.openGuideline = function () {
    var modalInstance = $modal.open({
      templateUrl: 'GuideLinesModal.html',
      controller: 'GuidelinesModalController',
      size: 'md',
      backdrop: 'static',
      keyboard: true,
      resolve: { }
    });

    modalInstance.result.then(function (data) {
      if (data !== 'cancel') {
        Metronic.blockUI({ target: "#guidelines-loading", animate: true, overlayColor: 'none' });
        getNodeChildren($scope.node, $scope.cb, false);
      }
      $scope.Loading = true;
      getNodeChildren($scope.node, $scope.cb, true);
    });
  };
}]);

MALACHIAPP.controller('GuidelinesModalController', ['$rootScope', '$scope', '$modalInstance', 'guidelinesService', function ($rootScope, $scope, $modalInstance, guidelinesService) {

  $scope.Errors = [];
  $scope.Document = {};
  //$scope.disableNextBtn = false;

  $scope.onFileUploaded = function (element) {
    var file = element.files[0];
    $scope.Document.Name = file.name;
    var reader = new FileReader();
    reader.onload = function () {
      var buffer = new Uint8Array(this.result);
      $scope.Document.Data = Array.from(buffer);
    }
    reader.readAsArrayBuffer(file);
    $scope.DocumentAdded = true;
    $scope.$apply();
  }

  $scope.next = function () {
    //$scope.disableNextBtn = true;
    // Clear the errors before validating the input
    $scope.Errors = [];
    // Validate the directory input
    validateInput();

    // If we got errors, don't do anything
    if ($scope.Errors.length > 0) return;

    guidelinesService.AddNode($scope.Document.Data, $scope.Document.Directory, $scope.Document.Name).then(function (result) {
      if (result.data.Success) {
        $modalInstance.close('close');
      } else {
        $scope.Errors = result.data.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  // close the modal window
  $scope.close = function () {

    // close
    $modalInstance.dismiss('cancel');
  };

  function validateInput() {
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';@,{}|\\":<>\?]/); //unacceptable chars

    // Check for same folder and subfolder becuase doing so creates circular reference issue for .jsTree plugin
    var directoryArr = $scope.Document.Directory.split('/');
    var sameSubDir = false;
    var count = 0;
    directoryArr.forEach(function (element) {
      if (element === directoryArr[0] && directoryArr.length >= 2)
        count++;
    });
    if (count === directoryArr.length) sameSubDir = true;

    if (sameSubDir)
      $scope.Errors.push("The folder name can not be the same as subfolder");

    if ($scope.Document.Directory === undefined || $scope.Document.Directory === '') {
      $scope.Errors.push("Directory required");
    }

    if (!$scope.DocumentAdded) $scope.Errors.push("Must upload document");

    if (pattern.test($scope.Document.Directory)) {
      //$scope.Errors = [];
      $scope.Errors.push("Directory can only include '/' no other special characters '[~`!#$%\^&*+=\-\[\]\\';,{}|\\\":<>\?]'.");
    }
    //else
    //  $scope.Errors = [];
  }
}]);