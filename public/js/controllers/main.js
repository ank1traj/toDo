angular.module('todoController', [])

    .controller('loginController', function ($scope, $location, AuthService) {
        $scope.user = {
            name: '',
            password: ''
        };

        $scope.authenticate = function () {
            AuthService.authenticate($scope.user).then(function (msg) {
                $location.path('/home');
            }, function (errMsg) {
                console.log(errMsg);
            });
        };
    })

    .controller('registerController', function ($scope, $location, AuthService) {
        $scope.user = {
            name: '',
            password: ''
        };

        $scope.register = function () {
            AuthService.register($scope.user).then(function (msg) {
                $location.path('/');
            }, function (errMsg) {
                console.log(errMsg);
            });
        };
    })

    .controller('homeController', function ($scope, $http, $location, Commands, AuthService) {
        $scope.list = {
            name: ''
        };
        $scope.note = {
            name: '',
            priority: '',
            checked: ''
        };

        $scope.selectedList = {};
        $scope.selectedNote = {};

        var getLists = function () {
            Commands.getLists().success(function (data) {
                $scope.lists = data;
                $scope.selectedList = {};
                $scope.list = {};
            });
        };
        var getNotes = function () {
            Commands.getNotes().success(function (data) {
                $scope.notes = data;
                $scope.selectedNote = {};
                $scope.note = {};
            });
        };

        $scope.currentList = function (list) {
            $scope.selectedList = list;
        }
        $scope.currentNote = function (note) {
            $scope.selectedNote = note;
        }


        $scope.addList = function () {
            Commands.addList($scope.list).then(function (msg) {
                getLists();
            }, function (errMsg) {
                console.log(errMsg);
            });
        };
        $scope.editList = function () {
            if (typeof $scope.list.name == 'undefined') {
                $scope.list.name = $scope.selectedList.name;
            }

            Commands.editList($scope.selectedList.listId, $scope.list).then(function (msg) {
                getLists();
            }, function (errMsg) {
                console.log(errMsg);
            });
        };
        $scope.deleteList = function () {
            Commands.deleteList($scope.selectedList.listId).then(function (msg) {
                getLists();
            }, function (errMsg) {
                console.log(errMsg);
            });
        };



        $scope.addNote = function () {
            Commands.addNote($scope.note, $scope.selectedList.listId).then(function (msg) {
                getNotes();
            }, function (errMsg) {
                console.log(errMsg);
            });
        };
        $scope.editNote = function () {
            if (typeof $scope.note.name == 'undefined') {
                $scope.note.name = $scope.selectedNote.name;
            }

            Commands.editNote($scope.selectedNote.noteId, $scope.note).then(function (msg) {
                getNotes();
            }, function (errMsg) {
                console.log(errMsg);
            });
        };
        $scope.deleteNote = function () {
            Commands.deleteNote($scope.selectedNote.noteId).then(function (msg) {
                getLists();
                getNotes();
            }, function (errMsg) {
                console.log(errMsg);
            });
        };

        // // Toggle note's true or false
        // $scope.checkNote = function (note) {
        //     if (note.checked) {
        //         note.checked = false;
        //     } else if (!note.checked) {
        //         note.checked = true;
        //     }
        //
        //     Commands.checkNote(note).then(function (msg) {
        //     }, function (errMsg) {
        //         console.log(errMsg);
        //     });
        // };

        $scope.logout = function () {
            AuthService.logout();
            $location.path('/');
        };

        $scope.sortNote = function (key) {
            $scope.sortNoteKey = key;
            $scope.noteReverse = !$scope.noteReverse;
        }

        $scope.sortList = function (key) {
            $scope.sortListKey = key;
            $scope.listReverse = !$scope.listReverse;
        }

        getLists();
        getNotes();
    });