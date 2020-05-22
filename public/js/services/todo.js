angular.module('todoService', [])

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })

    .service('AuthService', function ($q, $http, API_ENDPOINT) {
        var LOCAL_TOKEN_KEY = 'yourTokenKey';
        var isAuthenticated = false;
        var authToken;

        function loadUserCredentials () {
            var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
            if (token) {
                userCredentials(token);
            }
        }

        function storeUserCredentials (token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            userCredentials(token);
        }

        function userCredentials (token) {
            isAuthenticated = true;
            authToken = token;
            $http.defaults.headers.common.Authorization = authToken;
        }

        function destroyUserCredentials () {
            authToken = undefined;
            isAuthenticated = false;
            $http.defaults.headers.common.Authorization = undefined;
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        }

        var authenticate = function (user) {
            return $q(function (resolve, reject) {
                $http.post(API_ENDPOINT.url + '/authenticate', user).then(function (result) {
                    if (result.data.success) {
                        storeUserCredentials(result.data.token);
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        var register = function (user) {
            return $q(function (resolve, reject) {
                $http.post(API_ENDPOINT.url + '/signup', user).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        var logout = function () {
            destroyUserCredentials();
        };

        loadUserCredentials();

        return {
            authenticate: authenticate,
            register: register,
            logout: logout,
            isAuthenticated: function () {return isAuthenticated;},
        };
    })

    .factory('Commands', function ($q, $http, API_ENDPOINT) {
        var factory = [];

        factory.getLists = function () {
            return $http.get(API_ENDPOINT.url + '/list');
        };
        factory.getNotes = function () {
            return $http.get(API_ENDPOINT.url + '/note');
        };

        factory.addList = function (list) {
            return $q(function (resolve, reject) {
                $http.post(API_ENDPOINT.url + '/list', list).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        factory.addNote = function (note, listId) {
            return $q(function (resolve, reject) {
                $http.post(API_ENDPOINT.url + '/list/'+listId, note).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        factory.checkNote = function (note) {
            return $q(function (resolve, reject) {
                $http.put(API_ENDPOINT.url + '/note/'+note.noteId, note).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        factory.editList = function (listId, list) {
            return $q(function (resolve, reject) {
                $http.put(API_ENDPOINT.url + '/list/'+listId, list).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        factory.editNote = function (noteId, note) {
            return $q(function (resolve, reject) {
                $http.put(API_ENDPOINT.url + '/note/'+noteId, note).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        factory.deleteList = function (listId) {
            return $q(function (resolve, reject) {
                $http.delete(API_ENDPOINT.url + '/list/'+listId).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };
        factory.deleteNote = function (noteId) {
            return $q(function (resolve, reject) {
                $http.delete(API_ENDPOINT.url + '/note/'+noteId).then(function (result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        return factory;
    })

    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                }[response.status], response);
                return $q.reject(response);
            }
        };
    });

