MALACHIAPP.controller('UsersController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', '$timeout', '$modal', 'settings', 'authService', 'settingsService', 'accountService', 'toolsService', 'UserScroller', function ($rootScope, $scope, $location, $stateParams, $state, $timeout, $modal, settings, authService, settingsService, accountService, toolsService, UserScroller) {
  $scope.$on('$viewContentLoaded',
    function () {
      // initialize core components
      Metronic.initAjax();
      // set default layout mode
      $rootScope.settings.layout.pageBodySolid = false;
      //$rootScope.settings.layout.pageSidebarClosed = false;
    });

  $scope.Users = [];
  $scope.Roles = [];
  $scope.OrgsByType = [];
  $scope.Agents = [];
  $scope.Agencies = [];
  $scope.OrganizationType = {};
  $scope.DDOrganizationName = {};
  $scope.User = null;
  $scope.newUser = false;
  $scope.Errors = [];
  $scope.ErrorMessage = null;
  $scope.userIsGlobal = $.inArray("Global Admin", authService.authentication.roles) > -1;
  $scope.FilteredUsers = [];
  $scope.isBassOnline = $rootScope.Organization.Name == "Bass Online";

  $scope.RoleCategories = {
    selection: "",
    types: [
      { name: "Admin", roles: [] },
      { name: "Underwriter", roles: [] }
    ]
  };

  // Hello world
  function populateRoleCategories() {
    var categories = $scope.RoleCategories.types;
    // Set up Admin roles
    categories[0].roles = $.extend(true, [], $scope.Roles);
    // Set up Underwriter roles
    categories[1].roles = [
      "Bind Authority",
      "Fee Update",
      "Late Binding Authority",
      "Liability Mod",
      "Policy",
      "Admin Form Removal",
      "Submit Binder",
      "View Disabled Apps",
      "Fee Endorsement Authority",
      "Issue Authority",
      "Modify Endorsement",
      "Property Mod",
      "Return Premium Authority"
    ];
  }

  $scope.AgentTypes = [
    {
      Id: 1,
      Name: "Underwriter"
    },
    {
      Id: 2,
      Name: "Agent"
    },
    {
      Id: 3,
      Name: "Insured"
    }
  ];


  $scope.userscroller = new UserScroller($scope);
  $scope.userscroller.nextPage("", "", "");


  settingsService.getRoles().then(function (result) {
    if (result.data.Result.Success) {
      $scope.Roles = result.data.Roles;
      populateRoleCategories();
    } else {
      $scope.Errors = result.data.Result.Errors;
    }
  },
    function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  settingsService.getRoleDescriptions().then(function (result) {
    if (result.data.Result.Success) {
      $scope.RoleDescriptions = result.data.RoleDescriptions;
    } else {
      $scope.Errors = result.data.Result.Errors;
    }
  },
    function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  settingsService.getAllOrganizations().then(function (result) {
    if (result.data.Result.Success) {
      $scope.AllOrganizations = result.data.Organizations;
    } else {
      $scope.Errors = result.data.Result.Errors;
    }
  },
    function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  $scope.addNewUser = function () {
    $scope.newUser = true;
    $scope.User = new user();
    $scope.User.OrganizationType = authService.authentication.organizationType;
    $scope.Errors = [];
  }

  $scope.selectUser = function (user) {
    $scope.newUser = true;
    $scope.User = $.extend(true, {}, user);
    $scope.getUserAgent(user);
    $scope.getUserAgency(user);
    $scope.Errors = [];

    settingsService.getOffices($scope.User.OrganizationId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Organizations = [
          {
            Id: $scope.User.OrganizationId,
            Name: $scope.User.OrganizationName,
            Offices: result.data.Offices
          }
        ];
        $scope.getAgentsByOrg($scope.User.OrganizationId, $scope.User.OrganizationType);

        if ($scope.User.OfficeId !== null) {
          for (var i = 0; i < result.data.Offices.length; i++) {
            if (result.data.Offices[i].Id === $scope.User.OfficeId) {
              $scope.Offices = [
                {
                  Id: result.data.Offices[i].Id,
                  Name: result.data.Offices[i].Name,
                }
              ];
            }
          }
        }
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    },
      function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
  }

  $scope.getUserAgent = function (user) {
    if (user.AgentId === null || user.AgentId === "" || user.AgentId === undefined) return;

    $scope.Agents = [];
    settingsService.getAgentById(user.AgentId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Agents.push(result.data.Agent);
        $scope.User.AgentId = user.AgentId;
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    },
      function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
  };

  $scope.getUserAgency = function (user) {
    if (user.AgencyId === null || user.AgencyId === "" || user.AgencyId === undefined) return;

    $scope.Agencies = [];
    settingsService.getAgencyById(user.AgencyId).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Agencies.push(result.data.Agency);
        $scope.User.AgencyId = user.AgencyId;
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    },
      function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
  }

  $scope.deleteUser = function (user) {
    settingsService.deleteUser(user.Id).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Users.splice($.inArray(user, $scope.Users), 1);
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    },
      function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
  }


  $scope.organizationTypeChange = function () {
    $scope.Offices = [];
    $scope.Organizations = [];
    $scope.User.OrganizationId = null;
    $scope.User.OfficeId = null;
  }

  $scope.selectRolesByCategory = function () {
    var category = $.grep($scope.RoleCategories.types,
      function (type) {
        return type.name === $scope.RoleCategories.selection;
      })[0];

    if (category != undefined) {
      $scope.User.Roles = category.roles;
    }
  }

  $scope.cancelUser = function () {
    $scope.newUser = false;
    $scope.RoleCategories.selection = "";
    $scope.Errors = [];
    $scope.ErrorMessage = null;
  }

  $scope.saveUser = function () {
    validatePage();
    if ($scope.Errors.length > 0) return;

    var isNewUser = $scope.User.Id == null;
    updateUser(isNewUser);
  }

  function validatePage() {
    $scope.Errors = [];

    var user = $scope.User;

    if (user.UserType === 1 && user.OrganizationType === 'MGA') {
      if (user.OfficeId == null)
        $scope.Errors = ['Office field must be set for Underwriters.'];
    } else {
      if (!$scope.validateUserEmail())
        $scope.Errors.push('Please enter a valid email address.');
    }
  }

  function updateUser(isNewUser) {
    isNewUser = isNewUser || false;

    settingsService.updateUser($scope.User).then(function (result) {
      if (result.data.Result.Success) {
        var user = result.data.User;
        if (isNewUser) {
          $scope.Users.push(user);
          $scope.userscroller.items = $scope.Users;
        } else {
          var index = $scope.Users.findIndex(function (x) { return x.Id === user.Id; });
          if (index > -1) $scope.Users[index] = user;
        }
        $scope.cancelUser();
      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.emailResetPasswordToUser = function () {
    settingsService.resetPasswordEmail($scope.User).then(function (result) {
      if (result.data.Result.Success) {

      } else {
        $scope.Errors = result.data.Result.Errors;
      }
    },
      function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
  }


  $scope.validateUserEmail = function () {
    var user = $scope.User;
    if (user == undefined) return false;

    var email = user.Email;
    if (email == undefined) return false;

    var pattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email.trim());
  }

  $scope.newUserTable = function () {
    $scope.User.Tables.push(new userTable());
  }

  $scope.newUserField = function (table) {
    if (table !== null)
      table.Fields.push(new userField());
    else
      $scope.User.Fields.push(new userField());
  }

  $scope.newUserFieldOptions = function (table) {
    var field = new userField();
    field.OptionItems.push(new userFieldOptionItem());
    if (table !== null)
      table.Fields.push(field);
    else
      $scope.User.Fields.push(field);
  }

  $scope.newOption = function (field) {
    field.OptionItems.push(new userFieldOptionItem());
  }

  $scope.deleteTable = function (table) {
    $scope.User.Tables.splice($.inArray(table, $scope.User.Tables), 1);
  }

  $scope.deleteField = function (field, fields) {
    fields.splice($.inArray(field, fields), 1);
  }

  $scope.deleteOption = function (option, options) {
    options.splice($.inArray(option, options), 1);
  }

  // will load organization everytime that organization type is changed
  $scope.loadOrganizations = function () {
    // clear next sibling select
    this.$$nextSibling.$select.selected = "";

    // load new organizations based on selected organizationType
    $scope.OrgsByType = [];
    $scope.OrgsByType = $scope.OrganizationType.Name.Organizations;
  }

  $scope.refreshOrganizations = function (name) {
    if ($scope.User != null) {
      return settingsService.searchOrganizations(name, $scope.User.OrganizationType).then(function (result) {
        if (result.data.Result.Success) {
          $scope.Organizations = result.data.Organizations;
        } else {
          $scope.Errors = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }
  };

  $scope.refreshOffices = function (val) {
    var offices = [];
    if ($scope.Organizations !== null && $scope.User != null && $scope.User.OrganizationType === "MGA" && $scope.Organizations != null) {
      var lval = val.toLowerCase();
      for (var i = 0; i < $scope.Organizations.length; i++) {
        if ($scope.Organizations[i].Id === $scope.User.OrganizationId) {
          var org = $scope.Organizations[i];
          for (var j = 0; j < org.Offices.length; j++) {
            var lname = org.Offices[j].Name.toLowerCase();

            if (lname.indexOf(lval) > -1 || lval === null || lval.length === 0) {
              offices.push(org.Offices[j]);
            }
          }
        }
      }
    }
    $scope.Offices = offices;
    return offices;
  }

  $scope.currentTimeout = null;
  $scope.refreshAgencies = function (searchTerm) {
    if (searchTerm === "" || searchTerm === null || searchTerm === undefined) return;

    if (searchTerm.length < 3) return;

    if ($scope.currentTimeout !== null) {
      $timeout.cancel($scope.currentTimeout);
    }
    $scope.currentTimeout = $timeout(function () {
      $scope.Agencies = [];
      var lsearchTerm = searchTerm.toLowerCase();
      return settingsService.searchAgenciesByName(lsearchTerm).then(function (result) {
        if (result.data.Result.Success) {
          $scope.Agencies = result.data.Agencies;
        }
        else {
          $scope.Errors = result.data.Result.Errors;
        }
      }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
      });
    }, 3000);
  };

  $scope.populateAgents = function () {
    var agencyKey = $scope.User.AgencyId;
    $scope.User.AgentId = "";
    $scope.Agents = [];

    return settingsService.getAgentsByAgencyId(agencyKey).then(function (result) {
      if (result.data.Result.Success) {
        $scope.Agents = result.data.Agents;
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.getAgentsByOrg = function (orgId, orgType) {
    settingsService.searchUsersByOrganization(orgId, orgType).then(function (result) {
      if (result.data.Result.Success) {
        $scope.FilteredUsers = result.data.Users;
        for (var i = 0; i < $scope.FilteredUsers.length; i++) {
          $scope.FilteredUsers[i].FullName = $scope.FilteredUsers[i].FirstName + ' ' + $scope.FilteredUsers[i].LastName;
        }
      }
    }, function (error) {
    });
  }

  //--------------------------
  //- Import Users -
  //--------------------------
  $scope.showImportUsersModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'uploadfile.html',
      controller: 'uploadfile',
      backdrop: 'static',
      size: 'lg',
      resolve: {
      }
    });
  }

}]);



MALACHIAPP.controller('uploadfile', ['$rootScope', 'ngAuthSettings', 'localStorageService', '$http', '$scope', '$timeout', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'Upload', 'settingsService', function ($rootScope, ngAuthSettings, localStorageService, $http, $scope, $timeout, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, Upload, settingsService) {

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  var serviceBase = ngAuthSettings.apiServiceBaseUri;

  $scope.import = function () {
    var form = $('#importusersform')[0]; // You need to use standard javascript object here
    var formData = new FormData(form);

    var authData = localStorageService.get('authorizationData');

    $.ajax({
      url: serviceBase + 'api/settings/importusers',
      data: formData,
      type: 'POST',
      contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
      processData: false, // NEEDED, DON'T OMIT THIS
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", 'Bearer ' + authData.token);
      }
    });


    $modalInstance.dismiss('cancel');
  }

}]);



function user() {
  return {
    Enabled: false,
    Roles: ["Policy"],
    MemberUserIds: []
  };
}

// Scroller constructor function to encapsulate HTTP and pagination logic
MALACHIAPP.factory('UserScroller', function ($http, settingsService) {
  var UserScroller = function (scope) {
    this.items = [];
    this.busy = false;
    this.after = 1;
    this.totalUsers = 0;
    this.Scope = scope;

  };

  UserScroller.prototype.nextPage = function (message, type, name) {
    // if a search is being performed then exit function
    if (this.busy)
      return;

    // if the model is not defined initialize it to empty string
    if (message == undefined)
      message = "";
    if (type == undefined)
      type = "";
    if (name == undefined)
      name = "";

    // set search as busy
    this.busy = true;

    // perform search
    settingsService.searchUsers(message, this.after, 15, type, name).then(function (result) {

      // store users in a temp
      var objects = result.data.Users;

      // make sure there are users to iterate through
      if (objects.length > 0) {

        // iterate through objects and push to current items
        for (var i = 0; i < objects.length; i++) {
          this.items.push(objects[i]);
        }

        // increment page
        this.after++;

        // set search as not busy
        this.busy = false;
      }

      // add items to scope
      this.Scope.Users = this.items;
    }.bind(this), function (error) {
      // log an error
      console.log("Error - Was not able to perform request for Contracts!");

      // scroller is no longer busy
      this.busy = false;

      //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  };

  UserScroller.prototype.search = function (message, type, name) {
    // if the model is not defined initialize it to empty string
    if (message == undefined)
      message = "";
    if (type == undefined)
      type = "";
    if (name == undefined)
      name = "";

    // set to first page
    this.after = 1;

    // get rid 
    this.items = [];

    // set search as busy
    this.busy = true;

    settingsService.searchUsers(message, this.after, 15, type, name).then(function (result) {
      var objects = result.data.Users;
      this.totalUsers = result.data.Count;
      if (objects.length > 0) {
        for (var i = 0; i < objects.length; i++) {
          this.items.push(objects[i]);
        }
        this.after++;
        this.busy = false;
      }
      this.Scope.Users = this.items;
    }.bind(this), function (error) {
      // log an error
      console.log("Error - Was not able to perform request for Contracts!");

      // scroller is no longer busy
      this.busy = false;

      //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  };

  return UserScroller;
});


//settingsService.getUsers().then(function (result) {
//    if (result.data.Result.Success) {
//        $scope.Users = result.data.Users;

//    } else {
//        $scope.Errors = result.data.Result.Errors;
//    }
//}, function (error) {
//    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
//});