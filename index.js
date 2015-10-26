/**
 * Module to Access the browser local storage.
 */

! function(window, angular, undefined) {
    'use strict';

    var localStorageApp = angular.module('localStorage', []);

    localStorageApp.provider('$localStorage', function() {

        this.prefix = '__';
        this.timeline = 3600; //seconds

        //Set prefix for key with domain
        this.setPrefix = function(prefix) {
            if (prefix.substr(0) !== '_') {
                this.prefix = !!prefix ? '__' + prefix : '';
            }
            return this;
        };

        //Set timeline for key.Default is 60 mins.
        this.setStorageTimeline = function(timeline) {
            this.timeline = timeline;
            return this;
        };

        this.hasOwnProperty = Object.prototype.hasOwnProperty;

        this.$get = ['$rootScope', '$window', function($rootScope, $window) {
            var self = this;
            var prefix = self.prefix;
            var timeline = self.timeline;

            var isValidObj = function(obj) {
                if (angular.isUndefined(obj)) return true;
                if (obj == null) return true;
                if (obj.length > 0) return false;
                if (obj.length === 0) return true;
                for (var key in obj) {
                    if (hasOwnProperty.call(obj, key))
                        return false;
                }
                return false;
            };

            var checkExpiry = function(retrievedItem, key) {
                key = prefixKey(key);
                var storedTime = retrievedItem.time;
                var current_time = new Date();
                var retrivedTime = current_time.getTime();
                var time_difference = Math.floor((retrivedTime - storedTime) / 1000);
                if (time_difference > timeline) {
                    self.removeKeyFromLocalStorage(key);
                } else {
                    return retrievedItem;
                }
            };

            var prefixKey = function(key) {
                return prefix + key;
            };

            //Set the LocalStorage with key and value
            var setToLocalStorage = function(key, obj) {
                var storedTime = new Date();

                if (!isValidObj(obj)) {
                    obj.time = storedTime.getTime();
                    try {
                        localStorage.setItem(prefixKey(key), angular.toJson(obj));
                        return true;
                    } catch (e) {
                        console.log("Local Storge is not supported.Error : " + e);
                    }

                }
                return false;
            };

            //Get the value from LocalStorage using key
            var getFromLocalStorage = function(key) {
                try {
                    key = prefixKey(key);
                    var retrievedItem = angular.fromJson(localStorage.getItem(key));
                } catch (e) {
                    console.log("Local Storge is not supported.Error : " + e);
                    return null;
                }

                if (!isValidObj(retrievedItem)) {
                    var parsedRetrivedItem = retrievedItem;
                    return parsedRetrivedItem;
                } else {
                    removeKeyFromLocalStorage(key);
                }
            };

            var getItemWithExpireCheck = function(key) {
                try {
                    key = prefixKey(key);
                    var retrievedItem = angular.fromJson(localStorage.getItem(key));
                } catch (e) {
                    console.log("Local Storge is not supported.Error : " + e);
                }
                if (!isValidObj(retrievedItem)) {
                    var retrivedLocalStorage = checkExpiry(retrievedItem, key);
                    return retrivedLocalStorage;
                } else {
                    removeKeyFromLocalStorage(key);
                }

            };

            //Remove the Item from LocalStorage
            var removeKeyFromLocalStorage = function(key) {
                key = prefixKey(key);
                localStorage.removeItem(key);
            };

            var removeAllLocalStorage = function() {
                var prefixLength = prefix.length;
                for (var key in localStorage) {
                    try {
                        removeFromLocalStorage(key.substr(prefixLength));
                    } catch (e) {
                        console.log("Local Storge is not supported.Error : " + e);
                        return false;
                    }
                }
                return true;
            };

            //Execute the callback if Item is added to LocalStorage
            var addLocalstorageListener = function(callback) {
                window.addEventListener('storage', callback, false);
            };

            //Execute the callback if Item is removed from LocalStorage
            var removeLocalstorageListener = function(callback) {
                window.removeEventListener('storage', callback, false);
            };

            //Get the lenght of total keys stored in LocalStorage with domain name
            var lengthOfLocalStorage = function() {
                var count = 0;
                for (var i = 0; i < localStorage.length; i++) {
                    if (localStorage.key(i).indexOf(prefix) === 0) {
                        count++;
                    }
                }
                return count;
            };

            return {
                set: setToLocalStorage,
                get: getFromLocalStorage,
                removeOne: removeKeyFromLocalStorage,
                removeAll: removeAllLocalStorage,
                bind: addLocalstorageListener,
                unbind: removeLocalstorageListener,
                length: lengthOfLocalStorage
            };
        }];
    });
}(window, window.angular);
