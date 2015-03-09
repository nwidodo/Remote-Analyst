/**
 * Created by Nurwati on 3/3/15.
 */
"use strict";
angular.module('main').directive('stRatio', function () {
  return {
    link: function (scope, element, attr) {
      var ratio = +(attr.stRatio);

      element.css('width', ratio + '%');

    }
  };
});

angular.module('main').directive('targetBlank', function() {
  return {
    compile: function(element) {
      var elems = (element.prop("tagName") === 'A') ? element : element.find('a');
      elems.attr("target", "_blank");
    }
  };
});

angular.module('main').directive('specialDisabled',function() {
  return {
    restrict: 'A',
    scope:{specialDisabled: '='},
    link: function(scope, element, attrs) {
      scope.$watch(function(){return scope.specialDisabled}, function(){
        // set disabled attribute here
        element[0].disabled = !scope.specialDisabled;
      });
    }
  }
});
