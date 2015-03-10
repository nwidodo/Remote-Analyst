/**
 * Created by Nurwati on 3/10/15.
 */
"use strict";
angular.module('main').service('apiService', ['$http', function($http){
//API File PATH
  var urlFileMain = "http://54.200.152.58:8080/api/fileinfodata";
  var urlFileMainProc = "http://54.200.152.58:8080/api/FileProcessData";
  var urlFileTrend = "http://54.200.152.58:8080/api/FileTrendDataMultiDay";
  var urlFileTrendSingle = "http://54.200.152.58:8080/api/filetrenddata";

  //API Process PATH
  var urlProcMain = "http://54.200.152.58:8080/api/processinfodata";
  var urlProcMainTab = "http://54.200.152.58:8080/api/processfiledata"
  var urlProcTrend = "http://54.200.152.58:8080/api/processtrenddatamultiday";
  var urlProcTrendSingle = "http://54.200.152.58:8080/api/processtrenddata";

  this.loadFileData =function(cpuInfo){
    return $http.post(urlFileMain, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('File data retrieval failed.');
      });

  }

  this.loadFileTableData =function(cpuInfo){
    return $http.post(urlFileMainProc, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('File process table data retrieval failed.');
      });
  }

  this.loadFileTrendData =function(cpuInfo){
    return $http.post(urlFileTrend, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('File trend multi days retrieval failed.');
      });
  }

  this.loadFileTrendSingleData =function(cpuInfo){
    return $http.post(urlFileTrendSingle, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('File trend single day retrieval failed.');
      });
  }

  this.loadProcData =function(cpuInfo){
    return $http.post(urlProcMain, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('Proc data retrieval failed.');
      });

  }

  this.loadProcTableData =function(cpuInfo){
    return $http.post(urlProcMainTab, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('Proc file table retrieval failed.');
      });
  }

  this.loadProcTrendData =function(cpuInfo){
    return $http.post(urlProcTrend, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('Proc trend multi days retrieval failed.');
      });
  }

  this.loadProcTrendSingleData =function(cpuInfo){
    return $http.post(urlProcTrendSingle, cpuInfo)
      .then(function(response){
        return response.data;
      },
      function(data) {
        console.log('Proc trend single day retrieval failed.');
      });
  }
}]);
