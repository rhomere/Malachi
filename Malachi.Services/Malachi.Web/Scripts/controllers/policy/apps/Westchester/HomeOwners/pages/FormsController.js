'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_FormsController', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'authService', 'notificationsHub', 'settings', 'policyService', 'toolsService', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, authService, notificationsHub, settings, policyService, toolsService, ngAuthSettings, localStorageService) {
    $scope.parent = $scope.$parent;

    $scope.parent.LoadingPage = true;
    $scope.AppId = $scope.parent.AppId;
    $scope.PolicyId = $scope.parent.PolicyId;
    $scope.ErrorMessage = '';
    $scope.WarningMessage = '';
    $scope.canDeleteForm = $.inArray("Admin Form Removal", authService.authentication.roles) > -1;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.loadingOptionalForms = true;
    $scope.activeRiskCompanies = {};

    $scope.FilteredForms = [];
    $scope.PolicyForms = [];
    $scope.Forms = [];

    if ($scope.PolicyId) {
        loadForms();
    }
    else {
        $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
    }

    setTimeout(function () {
        var focusedRiskCompany = $.grep($scope.parent.RiskCompanies,
            function (riskCompany) {
                return riskCompany.Id == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId;
            })[0];
        if (focusedRiskCompany == null) return;
        var selector = "li[heading='" + focusedRiskCompany.Name + "']";
        $(selector).addClass("focused-riskcompany");
    }, 0);
    $.each($scope.parent.RiskCompanies,
        function (index, riskCompany) {
            $scope.activeRiskCompanies[riskCompany.Id] = false;
            if (riskCompany.Id == $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId)
                $scope.activeRiskCompanies[riskCompany.Id] = true;
        });


    function loadForms() {
        $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
        $scope.parent.LoadingPage = false;

        if ($scope.parent.canModify()) {
            policyService.getForms($scope.PolicyId).then(function (result) {
                if (result.data.Result.Success) {
                    $scope.Forms = result.data.Forms;
                    $scope.loadingOptionalForms = false;

                    $scope.FilterForms();
                } else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }


        for (var k = 0; k < $scope.parent.RiskCompanies.length; k++) {
            var company = $scope.parent.RiskCompanies[k];

            if (company.ContractId == null) {
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var comps = $.grep($scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts, function (x) { return (x.RiskCompanyId == company.Id); });
                    if (comps.length > 0) {
                        company.ContractId = comps[0].ContractId;
                    }
                }
            }

            if (company.ContractId == null) {
                company.ContractId = company.Contracts[0].Id;
            }
        }
    }

    $scope.isCentury = function (riskCompanyId) {
      return riskCompanyId == '48b1a26b-713f-4344-8470-5bfb9e25017c' || riskCompanyId == 'be7a9234-5ba5-49e5-acc0-deec3ff2ead0'
    };

    $scope.addForm = function (riskCompany) {
        var modalInstance = $modal.open({
            templateUrl: 'formAddModelContent.html',
            controller: 'test_Homeowners_formAddCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                forms: function () {
                    return $scope.FilteredForms;
                },
                policyForms: function () {
                    return $scope.parent.Policy.CurrentVersion.Forms;
                },
                policy: function () {
                    return $scope.parent.Policy;
                },
                riskCompanyId: function () {
                    return riskCompany.Id;
                }
            }
        });

        modalInstance.result.then(function (formId) {
            if (location != 'cancel') {
                policyService.addForm($scope.PolicyId, formId, riskCompany.Id).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.parent.Policy.CurrentVersion.Forms.push(result.data.Form);

                        $scope.FilterForms();

                        if (result.data.Form.RequireUserInput) {
                            $scope.editForm(result.data.Form);
                        }
                        notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
                    }
                    else {
                        notificationsHub.showErrors('Quote', result.data.Result.Errors);
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });

            }
        });
    }

    $scope.editForm = function (form) {
        var modalInstance = $modal.open({
            templateUrl: 'formUpdateModelContent.html',
            controller: 'test_Homeowners_formUpdateCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                form: function () {
                    return form;
                },
                locations: function () {
                    return $scope.Locations;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (form) {
            if (location != 'cancel') {
                policyService.updateForm($scope.PolicyId, form).then(function (result) {
                    if (result.data.Result.Success) {

                        $scope.parent.Policy.ValidateQuote = result.data.ValidateQuote;
                        $scope.parent.Policy.ValidateBind = result.data.ValidateBind;

                        notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });

            }
        });
    }

    $scope.addBackDeletedForm = function (form) {
        policyService.addBackRemovedForm($scope.parent.Policy.Id, form.Id).then(function (result) {
            if (result.data.Result.Success) {
                form.IsRemoved = false;
                form.AddedBackByUserName = result.data.Form.AddedBackByUserName;
                form.AddedBackDate = result.data.Form.AddedBackDate;
                notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.deleteForm = function (form) {
        if (form.IsMandatory) {
            $scope.Errors = ["This is a mandatory form you can not remove"];
            return;
        }
        policyService.deleteForm($scope.parent.Policy.Id, form.Id).then(function (result) {
            if (result.data.Result.Success) {
                form.IsRemoved = result.data.Form.IsRemoved;
                form.RemovedByUserName = result.data.Form.RemovedByUserName;
                form.RemovedDate = result.data.Form.RemovedDate;
                notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


    $scope.FilterForms = function () {
        $scope.FilteredForms = [];

        for (var i = 0; i < $scope.Forms.length; i++) {
            var optionalForm = $scope.Forms[i];

            if (optionalForm.AllowMultiple) {
                $scope.FilteredForms.push(optionalForm);
            } else {
                var alreadyExists = false;
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Forms.length; j++) {
                    var policyForm = $scope.parent.Policy.CurrentVersion.Forms[j];

                    if (policyForm.Number == optionalForm.Number) {
                        alreadyExists = true;
                        break;
                    }
                }

                if (!alreadyExists) {
                    $scope.FilteredForms.push(optionalForm);
                }
            }
        }
    }

    $scope.attachFormToQuoteDocument = function (form) {
        var policyId = $scope.parent.Policy.Id;

        policyService.attachFormToQuoteDocument(policyId, form).then(function (result) {
            if (result.data.Result.Success) {
                var formNumber = result.data.Form.Number;
                var isAttached = result.data.Form.IsAttachedToQuoteDocument;
                console.log("Form " + formNumber + " is" + ((isAttached) ? " " : " not ") + "attached.");
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            console.log(error);
        });
    }

    $scope.downloadPolicyForm = function (riskCompanyId, form) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST',window.documentServiceBase + 'api/document/DownloadPolicyForm', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "PolicyForm.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, RiskCompanyId: riskCompanyId, FormId: form.Id }));
    }


    $scope.FilterForms = function () {
        $scope.FilteredForms = [];

        for (var i = 0; i < $scope.Forms.length; i++) {
            var optionalForm = $scope.Forms[i];

            if (optionalForm.AllowMultiple) {
                $scope.FilteredForms.push(optionalForm);
            } else {
                var alreadyExists = false;
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Forms.length; j++) {
                    var policyForm = $scope.parent.Policy.CurrentVersion.Forms[j];

                    if (policyForm.Number == optionalForm.Number && policyForm.RiskCompanyId == $scope.parent.Policy.CurrentVersion.RiskCompanyId) {
                        alreadyExists = true;
                        break;
                    }
                }

                if (!alreadyExists) {
                    $scope.FilteredForms.push(optionalForm);
                }
            }
        }
    }
}]);


MALACHIAPP.controller('test_Homeowners_formAddCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'formsService', 'forms', 'policyForms', 'policy', 'riskCompanyId', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, formsService, forms, policyForms, policy, riskCompanyId) {
    $scope.Errors = [];
    $scope.Policy = policy;
    $scope.PolicyForms = policyForms.filter(x => x.RiskCompanyId == riskCompanyId);
    $scope.Forms = forms.filter(x => x.RiskCompanyId == riskCompanyId);
    $scope.Selected = {};

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.addForm = function () {
        $scope.Errors = [];

        var form = $scope.Selected.Form;
        if (form == null) {
            $scope.Errors.push("Please select a form to add.")
            return;
        }

        var canAddForm = $scope.PolicyForms.every(x => form.Number != x.Number) || form.AllowMultiple;
        if (!canAddForm) {
            $scope.Errors.push("Form " + form.Number + " has already been included on this policy.")
            return;
        }

        $modalInstance.close(form.Id);
    }

    $scope.refreshForms = function (name) {

    };
}]);


MALACHIAPP.controller('test_Homeowners_formUpdateCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'form', 'locations', 'parent', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, form, locations, parent) {
    $scope.Policy = policy;
    $scope.OriginalForm = form;
    $scope.Form = $.extend(true, {}, form);
    $scope.Locations = [];
    $scope.LocationFields = [];
    $scope.PropertyFields = [];
    $scope.parent = parent;

    for (var i = 0; i < locations.length; i++) {
        var loc = locations[i];
        var shortLoc = {
            LocationId: loc.Id,
            LocationNumber: loc.LocationNumber,
            Address: loc.Address,
            Properties: []
        };
        for (var j = 0; j < loc.Properties.length; j++) {
            var prop = loc.Properties[j];
            var shortProp = {
                PropertyId: prop.Id,
                LocationId: loc.Id,
                LocationNumber: loc.LocationNumber,
                BuildingNumber: prop.BuildingNumber
            };
            shortLoc.Properties.push(shortProp);
        }
        $scope.Locations.push(shortLoc);
    }

    function setupField(field) {
        if (field.FieldType === "Locations" || field.FieldType === "PerLocationText" || field.FieldType === "PerLocationMultilineText") {
            createLocationField(field);
        } else if (field.FieldType === "Properties" || field.FieldType === "PerPropertyText" || field.FieldType === "PerPropertyMultilineText") {
            createPropertyField(field);
        }
    }

    function createLocationField(field) {
        $scope.LocationFields[field.Id] = [];

        for (var i = 0; i < $scope.Locations.length; i++) {
            var loc = $scope.Locations[i];

            var locField = field.Locations.find(function (x) { return x.LocationId === loc.LocationId; });
            var selected = locField != undefined;
            var fieldValue = (locField != undefined) ? locField.FieldValue : null;

            $scope.LocationFields[field.Id][loc.LocationId] = {
                Selected: selected,
                FieldValue: fieldValue
            };
        }
    }

    function createPropertyField(field) {
        $scope.PropertyFields[field.Id] = [];

        for (var i = 0; i < $scope.Locations.length; i++) {
            var loc = $scope.Locations[i];

            for (var j = 0; j < loc.Properties.length; j++) {
                var prop = loc.Properties[j];

                var propField = field.Locations.find(function (x) { return x.PropertyId === prop.PropertyId; });
                var selected = propField != undefined;
                var fieldValue = (propField != undefined) ? propField.FieldValue : null;

                $scope.PropertyFields[field.Id][prop.PropertyId] = {
                    Selected: selected,
                    FieldValue: fieldValue
                };
            }
        }
    }

    for (var i = 0; i < $scope.Form.Fields.length; i++) {
        var field = $scope.Form.Fields[i];
        setupField(field);
    }

    for (var i = 0; i < $scope.Form.Tables.length; i++) {
        var table = $scope.Form.Tables[i];
        for (var j = 0; j < table.Rows.length; j++) {
            var tableRow = table.Rows[j];
            for (var k = 0; k < tableRow.Fields.length; k++) {
                var field = tableRow.Fields[k];
                setupField(field);
            }
        }
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.checkCharacterLimit = function (field) {
        //if (field.Value.length > field.CharacterLimit) {
        //    field.Value = field.Value.substring(0, field.CharacterLimit);
        //}
    }

    $scope.updateForm = function () {
        $.extend($scope.OriginalForm, $scope.Form);

        // Update all fields
        for (var i = 0; i < $scope.Form.Fields.length; i++) {
            var field = $scope.Form.Fields[i];
            $scope.updateField(field);
        }

        // Update all tables
        for (var i = 0; i < $scope.Form.Tables.length; i++) {
            var table = $scope.Form.Tables[i];
            $scope.updateTable(table);
        }

        $modalInstance.close($scope.Form);
    }

    $scope.updateTable = function (table) {
        for (var i = 0; i < table.Rows.length; i++) {
            var row = table.Rows[i];
            for (var j = 0; j < row.Fields.length; j++) {
                var field = row.Fields[j];
                $scope.updateField(field);
            }
        }
    }

    function getLocation(id) {
        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];
            if (location.LocationId === id)
                return location;
        }
        return null;
    }

    function getProperty(id) {
        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];
                if (property.PropertyId === id)
                    return property;
            }
        }
        return null;
    }

    function updateLocationField(field) {
        if ($scope.LocationFields[field.Id] == undefined) return;

        field.Locations = [];

        var locKeys = Object.keys($scope.LocationFields[field.Id]);
        for (var i = 0; i < locKeys.length; i++) {
            var locationId = locKeys[i];
            var locField = $scope.LocationFields[field.Id][locationId];
            if (locField.Selected) {
                var loc = getLocation(locationId);
                field.Locations.push({
                    FieldId: field.Id,
                    LocationId: loc.LocationId,
                    LocationNumber: loc.LocationNumber,
                    Value: locField.FieldValue
                });
            }
        }
    }

    function updatePropertyField(field) {
        if ($scope.PropertyFields[field.Id] == undefined) return;

        field.Locations = [];

        var propKeys = Object.keys($scope.PropertyFields[field.Id]);
        for (var i = 0; i < propKeys.length; i++) {
            var propertyId = propKeys[i];
            var propField = $scope.PropertyFields[field.Id][propertyId];
            if (propField.Selected) {
                var prop = getProperty(propertyId);
                field.Locations.push({
                    FieldId: field.Id,
                    LocationId: prop.LocationId,
                    PropertyId: prop.PropertyId,
                    LocationNumber: prop.LocationNumber,
                    BuildingNumber: prop.BuildingNumber,
                    Value: propField.FieldValue
                });
            }
        }
    }

    $scope.updateField = function (field) {
        if (field.FieldType === "Locations" || field.FieldType === "PerLocationText" || field.FieldType === "PerLocationMultilineText") {
            updateLocationField(field);
        } else if (field.FieldType === "Properties" || field.FieldType === "PerPropertyText" || field.FieldType === "PerPropertyMultilineText") {
            updatePropertyField(field);
        }
    }
}]);

