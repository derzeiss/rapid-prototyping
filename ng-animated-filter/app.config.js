'use strict';

angular.module('animatedFilter')
    .config(animatedFilterconfig);

animatedFilterconfig.$inject = ['$locationProvider', '$routeProvider'];

function animatedFilterconfig($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider
        .when('/', {
            template: '<box-list></box-list>'
        })
        .otherwise('/');

}