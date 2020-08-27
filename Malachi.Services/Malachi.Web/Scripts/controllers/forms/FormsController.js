MALACHIAPP.controller('FormsController', ['$rootScope', 'ngAuthSettings', '$scope', 'authService', '$location', '$timeout', '$stateParams', '$state', '$filter', 'settings', 'Upload', 'formsService', 'accountService', 'toolsService', 'settingsService', 'FormScroller', 'contractService', function ($rootScope, ngAuthSettings, $scope, authService, $location, $timeout, $stateParams, $state, $filter, settings, Upload, formsService, accountService, toolsService, settingsService, FormScroller, contractService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.Forms = [];
    $scope.Form = null;
    $scope.newForm = false;
    $scope.oldForm = false;
    $scope.ErrorMessage = null;


    $scope.isInRole = function (role) {
        return $.inArray(role, authService.authentication.roles) > -1;
    }

    contractService.getLimits().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Limits = result.data.Limits;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    settingsService.getCoverages().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Coverages = result.data.Coverages;
            $scope.Coverages.unshift({ Id: null, Name: "Interline" });
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.formscroller = new FormScroller($scope);
    $scope.formscroller.nextPage('');


    $scope.searchForms = function (codeNumber, pageNumber, display) {
        formsService.searchForms(codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Forms = result.data.Forms;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout !== null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.formscroller.search($scope.searchName); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchForms('', $scope.currentPage, 10);
    };

    $scope.addNewForm = function () {
        $scope.newForm = true;
        $scope.Form = new form();
    }

    $scope.selectForm = function (form) {
        $scope.oldForm = true;
        $scope.Form = $.extend(true, {}, form);

    }

    $scope.deleteForm = function (form) {
        formsService.deleteForm(form.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Forms.splice($.inArray(form, $scope.Forms), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelForm = function () {
        $scope.newForm = false;
        $scope.oldForm = false;
        $scope.ErrorMessage = null;
    }

    $scope.downloadForm = function (form) {
        formsService.canDownloadForm(form.Id).then(function (result) {
            if (result.data.Result.Success) {
                window.open(serviceBase + '/api/Forms/DownloadForm?formId=' + form.Id + '&token=' + result.data.Token + '&userId=' + authService.authentication.userId, '_blank');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.saveForm = function () {
        var isNew = $scope.Form.Id === null;

        formsService.updateForm($scope.Form).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Forms.push(result.data.Form);
                }
                else {
                    for (var i = 0; i < $scope.Forms.length; i++) {
                        if ($scope.Forms[i].Id === result.data.Form.Id) {
                            $scope.Forms[i] = result.data.Form;

                            
                        }
                    }
                }

                if ($scope.formFile != null) {
                    Upload.upload({
                        url: serviceBase + 'api/Forms/UploadForm',
                        data: { file: $scope.formFile, 'FormId': result.data.Form.Id }
                    });
                    result.data.Form.HasFile = true;
                    $scope.formFile = null;
                }

                // Clean up
                
                $scope.cancelForm();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newFormTable = function () {
        $scope.Form.Tables.push(new formTable());
    }

    $scope.newFormField = function (table) {
        if (table != null)
            table.Fields.push(new formField());
        else
            $scope.Form.Fields.push(new formField());
    }

    $scope.newFormFieldOptions = function (table) {
        var field = new formField();
        field.OptionItems.push(new formFieldOptionItem());
        if (table != null)
            table.Fields.push(field);
        else
            $scope.Form.Fields.push(field);
    }

    $scope.newOption = function (field) {
        field.OptionItems.push(new formFieldOptionItem());
    }

    $scope.deleteTable = function (table) {
        $scope.Form.Tables.splice($.inArray(table, $scope.Form.Tables), 1);
    }

    $scope.deleteField = function (field, fields) {
        fields.splice($.inArray(field, fields), 1);
    }

    $scope.deleteOption = function (option, options) {
        options.splice($.inArray(option, options), 1);
    }

}]);


function form() {
    return {
        Fields: [],
        Tables: [],
        Enabled: true
    };
}

function formTable() {

    return {
        "Name": '',
        "MaxRows": 3,
        "Fields": []
    };
}

function formField() {

    return {
        "FieldType": 'Text',
        "FieldName": "",
        "FieldDescription": "",
        "OptionItems": []
    };
}

function formFieldOptionItem() {

    return {
        "Id": '',
        "Description": ""
    };
}


// Scroller constructor function to encapsulate HTTP and pagination logic
MALACHIAPP.factory('FormScroller', function ($http, $filter, formsService) {
    var FormScroller = function (scope) {
        this.items = [];
        this.busy = false;
        this.after = 1;
        this.totalForms = 0;
        this.Scope = scope;
        this.previousSearch = ""; // will hold previous message search
        this.noResult = false; // will stop the infinite scroll if no results
    };

    FormScroller.prototype.nextPage = function (message) {
        // if a request is pending exit function
        if (this.busy)
            return;

        // if message comes in undefined the text field is empty, search for empty string
        if (message == undefined)
            message = '';

        // if message is different from previous enable inifinite scroller
        else if (this.previousSearch != message)
            this.noResult = false;

        // update previous message
        this.previousSearch = message;

        // set scroller as busy
        this.busy = true;

        formsService.searchForms(message, this.after, 15).then(function (result) {
            var objects = result.data.Forms;

            // no result from server disable inifinite scroller
            if (objects.length == 0) {
                this.noResult = true;
            }

            // get the total amount of forms
            this.totalForms = result.data.Count;

            // push new items into the array
            if (objects.length > 0) {

                // iterate through forms
                for (var i = 0; i < objects.length; i++) {

                    // apply filter to created date
                    for (var j = 0; j < objects[i].Notes.length; j++)
                        objects[i].Notes[j].CreatedDate = $filter('date')(objects[i].Notes[j].CreatedDate, 'MM/dd/y');

                    this.items.push(objects[i]);
                }

                // increment page
                this.after++;

                // scroller is no longer busy
                this.busy = false;
            }

            // add forms to the scope
            this.Scope.Forms = this.items;
        }.bind(this), function (error) {
            // log an error
            console.log("Error - Was not able to perform request for CForms!");

            // scroller is no longer busy
            this.busy = false;

            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    FormScroller.prototype.search = function (message) {
        this.after = 1;
        this.items = [];

        // if new search is performed enable infinite scroller
        this.noResult = false;

        this.busy = true;

        formsService.searchForms(message, this.after, 15).then(function (result) {
            var objects = result.data.Forms;
            this.totalForms = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    // apply filter to created date
                    for (var j = 0; j < objects[i].Notes.length; j++)
                        objects[i].Notes[j].CreatedDate = $filter('date')(objects[i].Notes[j].CreatedDate, 'MM/dd/y');
                    this.items.push(objects[i]);
                }
                this.after++;
                this.busy = false;
            }
            this.Scope.Forms = this.items;
        }.bind(this), function (error) {
            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            this.busy = false;
        });
        
    };

    return FormScroller;
});
