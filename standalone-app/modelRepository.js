'use strict';
var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  _ = require('lodash'),
  db = require('./db')(dbUtil.connectionConfig),
  columnString = 'title, analysisId, linearModel,' +
  ' burn_in_iterations, inference_iterations, ' +
  ' thinning_factor, modelType, likelihood, link,' +
  ' outcome_scale, heterogeneity_prior, regressor,' +
  ' sensitivity, archived, archived_on';

module.exports = {
  create: createModel,
  get: getModel,
  update: update,
  findByAnalysis: findByAnalysis,
  setTaskUrl: setTaskUrl,
  setArchive: setArchive
};

function mapModelRow(modelRow) {
  var model = {
    id: modelRow.id,
    title: modelRow.title,
    linearModel: modelRow.linearmodel,
    analysisId: modelRow.analysisid,
    taskUrl: modelRow.taskurl,
    modelType: modelRow.modeltype,
    burnInIterations: modelRow.burn_in_iterations,
    inferenceIterations: modelRow.inference_iterations,
    thinningFactor: modelRow.thinning_factor,
    likelihood: modelRow.likelihood,
    link: modelRow.link,
    heterogeneityPrior: modelRow.heterogeneity_prior,
    regressor: modelRow.regressor,
    sensitivity: modelRow.sensitivity,
    archived: modelRow.archived,
    archivedOn: modelRow.archived_on
  };

  if (modelRow.outcome_scale) {
    model.outcomeScale = modelRow.outcome_scale;
  }

  return model;
}

function findByAnalysis(analysisId, callback) {
  logger.debug('modelRepository.findByAnalysis, where analysisId = ' + analysisId);
  db.query(
    ' SELECT id, taskUrl, ' + columnString +
    ' FROM model WHERE analysisId=$1', [analysisId],
    function(error, result) {
      if (error) {
        logger.error('error finding models by analysisId, error: ' + error);
        callback(error);
      } else {
        logger.debug('find models by analysisId completed, result = ' + JSON.stringify(result.rows));
        callback(error, _.map(result.rows, mapModelRow));
      }
    });
}

function createModel(analysisId, newModel, callback) {

  db.query(
    ' INSERT INTO model (' + columnString + ') ' +
    ' VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id', [
      newModel.title,
      analysisId,
      newModel.linearModel,
      newModel.burnInIterations,
      newModel.inferenceIterations,
      newModel.thinningFactor,
      newModel.modelType,
      newModel.likelihood,
      newModel.link,
      newModel.outcomeScale,
      newModel.heterogeneityPrior,
      newModel.regressor,
      newModel.sensitivity,
      false, // is archived
      null // archived on
    ],
    function(error, result) {
      if (error) {
        logger.error('error creating model, error: ' + error);
        callback(error);
      } else {
        callback(error, result.rows[0].id);
      }
    });
}

function getModel(modelId, callback) {
  db.query(
    ' SELECT id, taskUrl, ' + columnString +
    ' FROM model WHERE id=$1', [modelId],
    function(error, result) {
      if (error) {
        logger.error('error retrieving model, error: ' + error);
        callback(error);
      } else {
        logger.debug('ModelRepository.getModel return model = ' + JSON.stringify(result.rows[0]));
        callback(error, mapModelRow(result.rows[0]));
      }
    });
}

function setTaskUrl(modelId, taskUrl, callback) {
  db.query('UPDATE model SET taskUrl=$2 WHERE id = $1', [modelId, taskUrl], function(error) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error);
    } else {
      callback();
    }
  });
}

function setArchive(modelId, isArchived, archivedOn, callback) {
  db.query('UPDATE model SET archived=$2, archived_on=$3  WHERE id = $1', [modelId, isArchived, archivedOn],
    function(error) {
      if (error) {
        logger.error('error setting model.archived, error: ' + error);
        callback(error);
      } else {
        callback();
      }
    });
}


function update(newModel, callback) {
  db.query('UPDATE model SET burn_in_iterations=$2, inference_iterations=$3, thinning_factor=$4, taskUrl=NULL where id = $1', [
    newModel.id,
    newModel.burnInIterations,
    newModel.inferenceIterations,
    newModel.thinningFactor
  ], function(error) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error);
    } else {
      callback();
    }
  });
}
