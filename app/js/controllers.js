'use strict';

define([
  './controllers/modelController',
  './models/modelsController',
  './models/extendRunLengthController',
  './models/nodeSplitOverviewController',
  './models/createNodeSplitModelController',
  './models/createNetworkModelController',
  './models/addComparisonFunnelPlotController',
  './util/graphModalDirective/plotNavigationController',
  './models/setBaselineDistributionController',
  './analyses/editAnalysisTitleController',
  './models/editModelTitleController',
  'angular'
], function(
  ModelController,
  ModelsController,
  ExtendRunLengthController,
  NodeSplitOverviewController,
  CreateNodeSplitModelController,
  CreateNetworkModelController,
  AddComparisonFunnelPlotController,
  PlotNavigationController,
  SetBaselineDistributionController,
  EditAnalysisTitleController,
  EditModelTitleController,
  angular) {
    return angular.module('gemtc.controllers', [])
      .controller('ModelController', ModelController)
      .controller('ModelsController', ModelsController)
      .controller('ExtendRunLengthController', ExtendRunLengthController)
      .controller('NodeSplitOverviewController', NodeSplitOverviewController)
      .controller('CreateNodeSplitModelController', CreateNodeSplitModelController)
      .controller('CreateNetworkModelController', CreateNetworkModelController)
      .controller('AddComparisonFunnelPlotController', AddComparisonFunnelPlotController)
      .controller('PlotNavigationController', PlotNavigationController)
      .controller('SetBaselineDistributionController', SetBaselineDistributionController)
      .controller('EditAnalysisTitleController', EditAnalysisTitleController)
      .controller('EditModelTitleController', EditModelTitleController)
      ;
  });
