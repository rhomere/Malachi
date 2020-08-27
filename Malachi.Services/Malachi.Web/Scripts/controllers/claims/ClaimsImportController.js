MALACHIAPP.controller("ClaimsImportController", function ($rootScope, $parse, ngAuthSettings, $scope, $stateParams, $window, authService, claimsService, localStorageService) {

    $scope.$on("$viewContentLoaded", function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
    });

    $scope.importFile = null;
    $scope.Errors = [];

    $scope.getOrUploadTemplate = function (isUpload) {
        $scope.Errors = [];
        if ($scope.importFile == null || $scope.importFile == undefined) {
            $scope.Errors.push("Please upload a file before trying to initiate the import");
        }
        if ($scope.Errors.length > 0) return;

        claimsService.getSharedAccessSignature().then(function (result) {
            if (result.data) {
                console.log("This is the thing: " + result.data);
                $scope.blobUpload(result.data);
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    $scope.blobUpload = async function (uri) {
        var d = new Date();
        var anonymousCredential = new azblob.AnonymousCredential;
        const pipeline = new azblob.StorageURL.newPipeline(anonymousCredential);
        const serviceURL = new azblob.ServiceURL(uri, pipeline);
        const containerName = "claims-imports";
        const containerURL = new azblob.ContainerURL.fromServiceURL(serviceURL, "");
        const content = $scope.importFile;
        const blobName = "Claims Import File " + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() + ".xlsx";
        const blobURL = new azblob.BlobURL.fromContainerURL(containerURL, blobName);
        const blockBlobURL = new azblob.BlockBlobURL.fromBlobURL(blobURL);
        const uploadBlobResponse = await blockBlobURL.upload(
            azblob.Aborter.none,
            content,
            content.size
        );

        console.log(
            `Upload block blob ${blobName} successfully`,
            uploadBlobResponse.requestId
        );

        alert("The template has been received and is being processed. Please be patient, the results will be emailed to you.");
    };
    

    $scope.updateFile = function (files) {
        if (files.length == 0) {
            $scope.importFile = null;
        } else {
            $scope.importFile = files[0];
        }
    };

});