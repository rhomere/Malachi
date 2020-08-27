
var app = angular.module('app', ['ui.bootstrap', 'ui.select', 'ngSanitize']);

app.controller('controller', function ($scope) {
    $scope.Contract = Contract;
    $scope.Characteristics = Characteristics;
    $scope.CharacteristicModelValues = CharacteristicModelValues;
    $scope.ContractCharacteristicModelValues = ContractCharacteristicModelValues;
    $scope.Characteristic = null;
    $scope.ErrorMessage = null;


    for (var i = 0; i < $scope.Characteristics.length; i++) {
        var characteristic = $scope.Characteristics[i];
        characteristic.ModelValues = []
        for (var j = 0; j < $scope.CharacteristicModelValues.length; j++) {
            var model = $scope.CharacteristicModelValues[j];
            if (characteristic.Name == model.CharacterName) {
                characteristic.ModelValues.push(model);
            }
        }

        for (var j = 0; j < characteristic.Values.length; j++) {
            var value = characteristic.Values[j];

            for (var k = 0; k < $scope.ContractCharacteristicModelValues.length; k++) {
                var modelValue = $scope.ContractCharacteristicModelValues[k];

                if (value.Id == modelValue.CharacteristicValueId) {
                    value.ModelId = modelValue.CharacteristicModelValueId;
                }
            }
        }
    }

    $scope.save = function () {
        var contractCharacteristicModelValues = [];

        for (var i = 0; i < $scope.Characteristics.length; i++) {
            var characteristic = $scope.Characteristics[i];
            for (var j = 0; j < characteristic.Values.length; j++) {
                var value = characteristic.Values[j];

                if (value.ModelId && value.ModelId > 0) {
                    contractCharacteristicModelValues.push({ ContractId: 0, CharacteristicValueId: value.Id, CharacteristicModelValueId: value.ModelId });
                }
            }

        }

        $.ajax({
            type: "POST",
            url: "/Contracts/SaveModelMapping",
            data: JSON.stringify({ contractId: $scope.Contract.Id, contractCharacteristicModelValues: contractCharacteristicModelValues }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                if (data.Success) {
                    $scope.cancel();
                }
                else {
                    unblockUI('#form-body');
                    alert('Error. Please improve this error message.');
                }
            },
            error: function () {
                unblockUI('#form-body');
                alert('Error. Please improve this error message.');
            }
        });
    }


    $scope.cancel = function () {
        window.location.href = '/Contracts';
    }
});


app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().startsWith(text) || item[prop].toString().replace("$", "").toLowerCase().startsWith(text)) {
                        itemMatches = true;
                        break;
                    }
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});
