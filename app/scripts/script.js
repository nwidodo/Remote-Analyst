"use strict";
var app = angular.module('main', ['chartApp', 'tblApp', 'mainApp', 'routeApp']);

var chartApp = angular.module('chartApp', ['ngResource']);
var tblApp = angular.module('tblApp', ['smart-table']);
var mainApp = angular.module('mainApp', ['ngProgress']);
var routeApp = angular.module('routeApp',['ngRoute']);

app.config(function($routeProvider){
  $routeProvider.when("/process",
    {
      templateUrl: "../views/process.html",
      controller: "ProcCtrl"
    })
    // route for the about page
    .when('/file', {
      templateUrl : '../views/file.html',
      controller  : 'FileCtrl'
    })
    .otherwise({ redirectTo: '/process' });
});

