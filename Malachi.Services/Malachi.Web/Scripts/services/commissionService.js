"use strict";
MALACHIAPP.factory("commissionService", function ($http, ngAuthSettings, localStorageService) {

    // Bass URI
    var api = ngAuthSettings.commissionApi;
    var factory = {};

    // Get 15 recently updated policies
    factory.getCommissionReports = function () {
        //Get from API
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
            return $http.get(api + 'api/commissionuw/getrecentreports').then(function (results) {
            Metronic.unblockUI();
            return results;
        });
    };

    factory.canSeeCommission = function (claim) {
        return true;
    };

    factory.months = [
        'None',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    factory.downloadReport = function (report) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });

        var date = new Date(report.reportDate);
        var month = date.getMonth() + 1;

        var endpoint = api + "api/commissionuw/downloadreport/" + report.underwriterId + '/' + date.getFullYear() + "/" + month;
        var fileName = "Commission Report - " + factory.months[date.getMonth() + 1] + "/" + date.getFullYear() + ".xlsx";

        var xhr = new XMLHttpRequest();
        xhr.open('GET', endpoint, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {

            Metronic.unblockUI();
            if (this.status === 200) {
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(blob, filename);
                }
                else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);
                        
                    var a = document.createElement("a");

                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    }
                    else {
                        a.href = downloadUrl;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                    }
                    setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                }
                return [];
            }
            else return ["Couldn't download the report. Please contact IT."];
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        xhr.send();
    };

    return factory;
});