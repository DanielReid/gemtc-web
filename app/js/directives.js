'use strict';
define(['angular', 'underscore', 'jQuery', 'd3', 'nvd3'], function(angular, _, $, d3, nv) {

  var directives = angular.module('gemtc.directives', []);

  function parsePx(str) {
    return parseInt(str.replace(/px/gi, ''));
  }

  var getParentDimension = function(element) {
    var width = parsePx($(element[0].parentNode).css('width'));
    var height = parsePx($(element[0].parentNode).css('height'));

    return {
      width: width,
      height: height
    };
  };

  directives.directive('gemtcRankPlot', function() {
    return {
      restrict: 'E',
      scope: {
        stacked: '@',
        value: '='
      },
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0]).append("svg")
          .attr("width", "100%")
          .attr("height", "100%");

        var dim = getParentDimension(element);

        var rankGraphData = function(data) {
          var result = [];
          _.each(_.pairs(data), function(el) {
            var key = el[0];
            var values = el[1];
            for (var i = 0; i < values.length; i++) {
              var obj = result[i] || {
                key: "Rank " + (i + 1),
                values: []
              };
              obj.values.push({
                x: key,
                y: values[i]
              });
              result[i] = obj;
            }
          });
          return result;
        };

        scope.$watch('value', function(newVal, oldVal) {
          if (!newVal) return;
          nv.addGraph(function() {
            var chart = nv.models.multiBarChart().height(dim.height).width(dim.width);
            var data = rankGraphData(newVal);

            chart.yAxis.tickFormat(d3.format(',.3f'));
            chart.stacked(attrs.stacked);
            chart.reduceXTicks(false);
            chart.staggerLabels(true);
            chart.tooltips(false);

            svg.datum(data)
              .transition().duration(100).call(chart);

            nv.utils.windowResize(chart.update);
          });
        }, true);
      }
    };
  });
});