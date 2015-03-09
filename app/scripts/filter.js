/**
 * Created by Nurwati on 3/3/15.
 */
"use strict";
angular.module('main').filter('to_trusted', ['$sce', function ($sce) {
  return function (text) {
    return $sce.trustAsHtml(text);
  };
}]);

angular.module('main').filter('urlEncode', [function() {
  return window.encodeURIComponent;
}]);

angular.module('main').filter('printdate', function() {
  return function(tempDate) {
    tempDate = tempDate * 1000;
    return tempDate === 0 ? 'N/A' : tempDate;
  };
});
