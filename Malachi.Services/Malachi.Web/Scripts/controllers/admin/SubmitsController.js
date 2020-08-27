
MALACHIAPP.controller('SubmitsController', ['$rootScope', 'ngAuthSettings', '$scope', '$location', '$timeout', 'localStorageService', '$stateParams', '$state', 'settings', 'Upload', 'adminService', 'policyService', 'accountService', 'toolsService', 'SubmitScroller', function ($rootScope, ngAuthSettings, $scope, $location, $timeout, localStorageService, $stateParams, $state, settings, Upload, adminService, policyService, accountService, toolsService, SubmitScroller) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.Submit = null;
    $scope.RenewalOf = "";
    $scope.newSubmit = false;
    $scope.ErrorMessage = null;
    $scope.filterBy = "Unread";
    $scope.searchName = '';
    $scope.rootScope = $rootScope;

    $scope.submitscroller = new SubmitScroller($scope);
    $scope.submitscroller.nextPage('', $scope.filterBy);

    $scope.currentTimeout = null;

    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.submitscroller.search($scope.searchName, $scope.filterBy, 0, 0); }, 1000);
    };

    $scope.filterChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = null;
        $scope.submitscroller.search($scope.searchName, $scope.filterBy, 0, 0);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.submitscroller.search('', $scope.filterBy, $scope.currentPage, 10);
    };


    $scope.selectSubmit = function (submit) {
        $scope.newSubmit = true;
        $scope.Submit = $.extend(true, {}, submit);

        for (var i = 0; i < $scope.Submit.GroupedFiles.length; i++) {
            var group = $scope.Submit.GroupedFiles[i];
            group.SubmitFile = group[0];
        }

        $scope.getSubmissionReason(submit);
    }

    $scope.getSubmissionReason = function (submit) {
        Metronic.blockUI({ target: "#submit-reasons", animate: true, overlayColor: "none" });
        adminService.getSubmissionReason(submit.PolicyId, submit.RiskCompanyId).then(function(result) {
            $scope.Submit.Reasons = result.data;
            Metronic.unblockUI("#submit-reasons");
        });
    }

    $scope.cancelSubmit = function () {
        $scope.newSubmit = false;
        $scope.ErrorMessage = null;
    }

    $scope.deleteSubmit = function () {
        //call the API/Admin/DeleteSubmit passing submitId
        adminService.deleteSubmit($scope.Submit.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.cancelSubmit();
                if ($rootScope._getSubmitCount)
                    $rootScope._getSubmitCount();
                $scope.searchNameChanged();
                $scope.ErrorMessage = null;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        });
    }

    $scope.approveSubmit = function () {
        adminService.updateSubmit($scope.Submit.Id, true, $scope.Submit.CarrierNotes).then(function (result) {
            if (result.data.Result.Success) {
                for (var i = 0; i < $scope.submitscroller.items.length; i++) {
                    if ($scope.submitscroller.items[i].Id == result.data.SubmittedPolicy.Id) {
                        $scope.submitscroller.items[i] = result.data.SubmittedPolicy;
                    }
                }
                $scope.cancelSubmit();
                if ($rootScope._getSubmitCount)
                    $rootScope._getSubmitCount();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.denySubmit = function () {
        adminService.updateSubmit($scope.Submit.Id, false, $scope.Submit.CarrierNotes).then(function (result) {
            if (result.data.Result.Success) {
                for (var i = 0; i < $scope.submitscroller.items.length; i++) {
                    if ($scope.submitscroller.items[i].Id == result.data.SubmittedPolicy.Id) {
                        $scope.submitscroller.items[i] = result.data.SubmittedPolicy;
                    }
                }
                $scope.cancelSubmit();
                if ($rootScope._getSubmitCount)
                    $rootScope._getSubmitCount();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.openParentPolicy = function (submit) {
        if (submit.Endorsements != null) {
            $scope.showEndorsements(submit);
            return;
        }
        // Load App
        policyService.getPolicyIdAndAppId(submit.SubmissionNumber).then(function(result) {
            if (result.data.Result.Success) {
                $rootScope.$state.transitionTo('policy', { appId: result.data.AppId, policyId: result.data.PolicyId });
            }
        });
    }

    $scope.downloadSubmitFile = function (submittedFile) {
        var name = submittedFile.Name;
        var id = submittedFile.Id; 

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', ngAuthSettings.apiServiceBaseUri + 'api/admin/DownloadSubmitFile', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "Form.pdf";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);

                    if (filename) {
                        // use HTML5 a[download] attribute to specify filename
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location = downloadUrl;
                    }

                    setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                }
            }
        };

        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        xhr.send(JSON.stringify({
            Id: id,
            Name: name
        }));
    }

    // Call this after the whole page is loaded.
    $rootScope.$broadcast('$pageloaded');
}]);


// Scroller constructor function to encapsulate HTTP and pagination logic
MALACHIAPP.factory('SubmitScroller', function ($http, adminService) {
    var SubmitScroller = function (scope) {
        this.items = [];
        this.busy = false;
        this.noResults = false; // will not trigger infinite scroll when no results
        this.after = 1;
        this.totalSubmittedPolicies = 0;
        this.Scope = scope;
    };

    SubmitScroller.prototype.nextPage = function (message, filter) {
        // if (this.items.length > 0 && this.items.length == this.totalSubmittedPolicies && SubmitScroller.filter == filter) return;
        // if search is already in process exit function
        if (this.busy) return;

        // once new search with another filter is performed enable infinite scroller
        if (SubmitScroller != filter)
            this.noResults = false;

        SubmitScroller.filter = filter;
        this.busy = true;
        var _this = this;

        adminService.searchSubmits(message, filter, this.after, 15).then(function (result) {
            var objects = result.data.SubmittedPolicies;

            // will prevent the client from performing requests to the server when no results returned
            if (objects.length == 0) {
                this.noResults = true;
            }

            _this.totalSubmittedPolicies = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    _this.items.push(objects[i]);
                }
                _this.after++;
            }
            _this.busy = false;
            _this.Scope.SubmittedPolicies = this.items;

        }.bind(this), function (error) {

            // log error
            Console.log("Error - Not able to retrieve submits from server!");

        });

    };

    SubmitScroller.prototype.search = function (message, filter) {
        this.after = 1;
        this.items = [];
        if (message == '' || message == null) {
            this.nextPage('', filter);
            return;
        }
        if (this.busy) return;
        this.busy = true;
        var _this = this;

        adminService.searchSubmits(message, filter, this.after, 15).then(function (result) {
            var objects = result.data.SubmittedPolicies;

            _this.totalSubmittedPolicies = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    _this.items.push(objects[i]);
                }
                _this.after++;
            }
            _this.busy = false;
            _this.Scope.SubmittedPolicies = _this.items;

            // once new search is performed enable infinite scroller
            this.noResults = false;

        }.bind(this), function (error) {

            // log error
            Console.log("Error - Not able to retrieve submits from server!");

            // once new search is performed enable infinite scroller
            this.noResults = false;
        });

    };

    return SubmitScroller;
});

