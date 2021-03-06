'use strict';
var express = require('express');
var pataviTaskRouter = require('./pataviTaskRouter');
var modelHandlers = require('./modelHandlers');

module.exports = express.Router({
  mergeParams: true
})
  .get('/', modelHandlers.find)
  .post('/', modelHandlers.createModel)
  .get('/:modelId', modelHandlers.getModel)
  .post('/:modelId', modelHandlers.extendRunLength)
  .delete('/:modelId', modelHandlers.deleteModel)
  .get('/:modelId/result', modelHandlers.getResult)
  .get('/:modelId/baseline', modelHandlers.getBaseline)
  .put('/:modelId/baseline', modelHandlers.setBaseline)
  .put('/:modelId/setTitle', modelHandlers.setTitle)
  .put('/:modelId/setSensitivity', modelHandlers.setSensitivity)
  .post('/:modelId/attributes', modelHandlers.setAttributes)
  .post('/:modelId/funnelPlots', modelHandlers.addFunnelPlot)
  .get('/:modelId/funnelPlots', modelHandlers.queryFunnelPlots)
  .get('/:modelId/funnelPlots/:plotId', modelHandlers.getFunnelPlot)
  .use('/:modelId/task', pataviTaskRouter)
  ;
