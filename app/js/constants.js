'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('gemtc.constants', [])
    .constant('GEMTC_PATAVI_WS', 'ws://patavi.drugis.org/ws2');
});
