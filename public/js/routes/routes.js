angular.module('todoRoute', ['ngRoute'])

    .config(function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/login.html',
            controller : 'loginController'
        });
        $routeProvider.when('/signup', {
            templateUrl: 'views/register.html',
            controller : 'registerController'
        });

        $routeProvider.when('/home', {
            templateUrl: 'views/home.html',
            controller : 'homeController'
        });

        $routeProvider.otherwise({
            redirectTo : '/'
        });
    })

    .run(function ($rootScope, $location, AuthService) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {

            if (!AuthService.isAuthenticated()) {
                console.log("not " + $location.path());
                if ($location.path() !== '/' && $location.path() !== '/signup') {
                    $location.path('/');
                   // event.preventDefault();
                }
            } else {
                console.log("is " + $location.path());
                if ($location.path() == '/' || $location.path() == '/signup') {
                    $location.path('/home');
                   // event.preventDefault();
                }
            }
        });
    });