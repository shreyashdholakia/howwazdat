'use strict';

angular.module('angularPassportApp')
.factory('alertService', [
        function () {
            var errorCode;

            function displaySaveMessage(message) {
                toastr.options = {
                    "closeButton": true,
                    "positionClass": "toast-top-full-width"
                };
                if (message) {
                    toastr.success(message);
                } else {
                    toastr.success('Success!');
                }
            }

            function displayErrorMessage(message) {
                toastr.options = {
                    "closeButton": true,
                    "positionClass": "toast-top-full-width",
                    "timeOut": "0",
                    "extendedTimeOut": "0"
                };
                if (message) {
                    toastr.error(message);
                } else {
                    toastr.error('An unexpected error occurred, please contact the PS Operations team.');
                }
            }

            function displayWarningMessage(message) {
                toastr.options = {
                    "closeButton": true,
                    "positionClass": "toast-top-full-width"
                };
                toastr.warning(message);
            }

            function displayLoadingMessage(message) {
                toastr.options = {
                    "closeButton": false,
                    "positionClass": "toast-top-full-width",
                    "timeOut": "0",
                    "extendedTimeOut": "0"
                };
                toastr.warning(message);
            }

            function clearLastToast() {
                toastr.clear();
            }

            return {
                displaySaveMessage: displaySaveMessage,
                displayErrorMessage: displayErrorMessage,
                displayWarningMessage: displayWarningMessage,
                displayLoadingMessage: displayLoadingMessage,
                clearLastToast: clearLastToast
            };
        }
    ]);