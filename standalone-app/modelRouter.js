'use strict';
var logger = require('./logger'),
  express = require('express'),
  httpStatus = require('http-status-codes'),
  _ = require('lodash'),
  async = require('async'),
  modelRepository = require('./modelRepository'),
  modelService = require('./modelService'),
  pataviTaskRouter = require('./pataviTaskRouter'),
  pataviTaskRepository = require('./pataviTaskRepository'),
  funnelPlotRepository = require('./funnelPlotRepository'),
  modelBaselineRepository = require('./modelBaselineRepository');

module.exports = express.Router({
  mergeParams: true
})
  .get('/', find)
  .post('/', createModel)
  .get('/:modelId', getModel)
  .post('/:modelId', extendRunLength)
  .get('/:modelId/result', getResult)
  .get('/:modelId/baseline', getBaseline)
  .put('/:modelId/baseline', setBaseline)
  .post('/:modelId/attributes', setAttributes)
  .post('/:modelId/funnelPlots', addFunnelPlot)
  .get('/:modelId/funnelPlots', queryFunnnelPlots)
  .get('/:modelId/funnelPlots/:plotId', getFunnelPlot)
  .use('/:modelId/task', pataviTaskRouter);

function decorateWithRunStatus(modelsResult, pataviResult) {
  var pataviTasks = _.keyBy(pataviResult, 'id');
  return _.map(modelsResult, function(model) {
    return _.extend(model, {
      runStatus: pataviTasks[model.taskUrl].runStatus
    });
  });
}

function find(request, response, next) {
  logger.debug('modelRouter.find');

  var analysisId = request.params.analysisId;
  modelRepository.findByAnalysis(analysisId, function(error, modelsResult) {

    if (error) {
      return next({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error
      });
    }

    var modelsWithTasks = _.filter(modelsResult, function(model) {
      return model.taskUrl !== null && model.taskUrl !== undefined;
    });
    var modelsWithoutTasks = _.filter(modelsResult, function(model) {
      return model.taskUrl === null || model.taskUrl === undefined;
    });
    if (modelsWithTasks.length) {
      var taskUrls = _.map(modelsWithTasks, 'taskUrl');
      pataviTaskRepository.getPataviTasksStatus(taskUrls, function(error, pataviResult) {
        if (error) {
          next({
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            message: error
          });
        } else {
          var decoratedResult = decorateWithRunStatus(modelsWithTasks, pataviResult);
          response.json(decoratedResult.concat(modelsWithoutTasks));
        }
      });
    } else {
      response.json(modelsResult);
    }

  });
}

function getResult(request, response, next) {
  logger.debug('modelRouter.getResult');
  logger.debug('request.params.analysisId' + request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);
  var modelCache;

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelCache = model;
      if (model.taskUrl === null || model.taskUrl === undefined) {
        callback({
          statusCode: httpStatus.NOT_FOUND,
          message: 'attempt to get results of model with no task'
        });
      } else {
        callback();
      }
    },
    function(callback) {
      pataviTaskRepository.getResult(modelCache.taskUrl, callback);
    },
    function(pataviResult) {
      response.status(httpStatus.OK);
      response.json(pataviResult);
    }
  ], function(error) {
    if (error) {
      response.status(httpStatus.NOT_FOUND).send({
        error: 'no result found for model with id ' + modelId
      });
    } else {
      next();
    }
  });
}

function createModel(request, response, next) {
  logger.debug('create model.');
  logger.debug('request.params.analysisId' + request.params.analysisId);
  var analysisId = Number.parseInt(request.params.analysisId);
  async.waterfall([
    function(callback) {
      modelRepository.create(analysisId, request.body, callback);
    },
    function(createdId) {
      response
        .location('/analyses/' + analysisId + '/models/' + createdId)
        .status(httpStatus.CREATED)
        .json({
          id: createdId
        });
    }
  ], function(error) {
    if (error) {
      next(error);
    }
  });
}

function extendRunLength(request, response, next) {
  logger.debug('extend model runlength.');
  logger.debug('analysisId ' + request.params.analysisId);
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);

  var modelCache;
  var newModel = request.body;

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelCache = model;
      checkCoordinates(analysisId, modelCache, callback);
    },
    function(callback) {
      modelService.update(modelCache, newModel, callback);
    },
    function(callback) {
      pataviTaskRepository.deleteTask(modelCache.taskUrl, callback);
    },
    function() {
      response.sendStatus(httpStatus.OK);
    }
  ], next);
}

function addFunnelPlot(request, response, next) {
  logger.debug('add funnel plot');
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      checkCoordinates(analysisId, model, callback);
    },
    function(callback) {
      funnelPlotRepository.create(modelId, request.body, callback);
    },
    function() {
      response.sendStatus(httpStatus.CREATED);
    }
  ], next);
}


function queryFunnnelPlots(request, response, next) {
  var modelId = Number.parseInt(request.params.modelId);
  getFunnelPlotsById(request, response, next, funnelPlotRepository.findByModelId, modelId);
}

function getFunnelPlot(request, response, next) {
  var plotId = Number.parseInt(request.params.plotId);
  getFunnelPlotsById(request, response, next, funnelPlotRepository.findByPlotId, plotId);
}


function getFunnelPlotsById(request, response, next, getter, id) {
  getter(id, function(error, result) {
    if (error) {
      next({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error
      });
    } else {
      response.json(result);
    }
  });
}

function getBaseline(request, response, next) {
  var modelId = Number.parseInt(request.params.modelId);
  modelBaselineRepository.get(modelId, function(error, result) {
    if (error) {
      next({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error
      });
    } else {
      response.json(result);
    }
  });
}

function setBaseline(request, response, next) {
  logger.debug('set model baseline');
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);
  var baseline = request.body;
  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      checkCoordinates(analysisId, model, callback);
    },
    function(callback) {
      modelBaselineRepository.set(modelId, baseline, callback);
    },
    function() {
      response.sendStatus(httpStatus.OK);
    }
  ], next);
}

function setAttributes(request, response, next) {
  logger.debug('set model attributes');
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);
  var isArchived = request.body.archived;
  var modelToSet;
  var archivedOn = isArchived ? new Date() : null;
  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelToSet = model;
      checkCoordinates(analysisId, model, callback);
    },
    function(callback) {
      modelRepository.setArchive(modelToSet.id, isArchived, archivedOn, callback);
    },
    function() {
      response.sendStatus(httpStatus.OK);
    }
  ], next);
}

function getModel(request, response, next) {
  var modelId = Number.parseInt(request.params.modelId);
  modelRepository.get(modelId, function(error, result) {
    if (error) {
      next({
        statusCode: httpStatus.NOT_FOUND,
        message: error
      });
    } else {
      response.json(result);
    }
  });
}

function checkCoordinates(analysisId, model, callback) {
  logger.debug('check analysisId = ' + analysisId + ' and model.analysisId = ' + model.analysisId);
  if (analysisId !== model.analysisId) {
    callback({
      statusCode: httpStatus.NOT_FOUND,
      message: 'analysis/model combination not found'
    });
  } else {
    callback();
  }
}
