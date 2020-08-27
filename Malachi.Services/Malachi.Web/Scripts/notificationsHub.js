'use strict';
MALACHIAPP.factory('notificationsHub', ['$http', 'localStorageService', 'toaster', function ($http, localStorageService, toaster) {
    var factory = {};
    //  Methods
    var _clear = function () {
        toaster.clear();
    };

    var _showProgress = function (title, template, data) {
        // Show On toaster
        toaster.pop({
            type: 'info',
            title: title,
            body: template,
            bodyOutputType: 'template',
            data: data,
            timeout: 0
        });
    }

    var _showErrors = function (title, messages) {
        // Show On toaster
        var message = '<ul>';
        for (var i = 0; i < messages.length; i++) {
            message = '<li>' + messages[i] + '</li>';
        }
        message += '</ul>';
        toaster.error(title, message);
        // Save in cache
        addToCache('error', title, message);
    }

    var _showError = function (title, message) {
        // Show On toaster
        toaster.error(title, message);
        // Save in cache
        addToCache('error', title, message);
    }

    var _showWarning = function (title, message) {
        // Show On toaster
        toaster.warning(title, message);
        // Save in cache
        addToCache('warning', title, message);
    }

    var _showSuccess = function (title, message) {
        // Show On toaster
        toaster.success(title, message);
        // Save in cache
        addToCache('success', title, message);
    }

    var _showInfo = function (title, message) {
        // Show On toaster
        toaster.info(title, message);
        // Save in cache
        addToCache('info', title, message);
    }

    var _getNotifications = function () {
        var notifications = localStorageService.get('notifications');
        if (notifications) {
            return notifications;
        }
        return [];
    }

    function addToCache(type, title, message) {
        var notifications = localStorageService.get('notifications');
        var dateTime = new Date().toLocaleString();
        if (notifications) {
            notifications.unshift({
                dateTime: dateTime,
                type: type,
                title: title,
                message: message
            });
            if (notifications.length > 20) {
                notifications.pop();
            }
        } else {
            notifications = [];
            notifications.unshift({
                dateTime: dateTime,
                type: type,
                title: title,
                message: message
            });
        }
        // Get List if it exists
        localStorageService.set('notifications', notifications);
    }

    // Assign  
    factory.clear = _clear;
    factory.showProgress = _showProgress;
    factory.showError = _showError;
    factory.showErrors = _showErrors;
    factory.showWarning = _showWarning;
    factory.showInfo = _showInfo;
    factory.showSuccess = _showSuccess;
    factory.getNotifications = _getNotifications;

    return factory;

}]);