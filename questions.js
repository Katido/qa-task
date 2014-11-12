angular.module('question', ['ngRoute', 'firebase'])
	.constant('fbURL', 'https://amber-fire-2430.firebaseio.com/')
	.factory('Question', function ($firebase, fbURL) {
		return $firebase(new Firebase(fbURL)).$asArray();
	})
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {controller:ListController, templateUrl:'list.html'})
			.when('/question/:questionId', {controller:EditController, templateUrl:'question.html'})
			.when('/edit/:questionId', {controller:EditController, templateUrl:'detail.html'})
			.when('/new', {controller:CreateController, templateUrl:'detail.html'})
			.otherwise({redirectTo:'/'});
	}]);
 
function ListController($scope, Question) {
	$scope.question = Question;
	$scope.showFilter = 'all';
	
	$scope.show = function(param) {
		$scope.showFilter = param;
	};
}
 
function CreateController($scope, $location, $timeout, Question) {
	$scope.save = function() {
		$scope.question.answered = false;
		Question.$add($scope.question)
			.then(function(ref) {
				$location.path('/');
			});
	}
}
 
function EditController($scope, $location, $routeParams, fbURL, $firebase) {
	var sync = $firebase(new Firebase(fbURL + $routeParams.questionId));
	$scope.question = sync.$asObject();
	$scope.question.$id = $routeParams.questionId;
	
	$scope.isClean = function() {
		return angular.equals($scope.remote, $scope.question);
	}

	$scope.destroy = function() {
		var syncAll = $firebase(new Firebase(fbURL)).$asArray();
		syncAll.$loaded().then(function(data) {
			syncAll.$remove(syncAll.$getRecord($routeParams.questionId));
			$location.path('/');
		})
		
	}

	$scope.save = function() {
		$scope.question.$save();
		$location.path('/');
	}

	$scope.saveAnswer = function() {
		$scope.question.answered = true;
		if (!$scope.question.answers || !angular.isArray($scope.question.answers)) {
			$scope.question.answers = [];
		}
		$scope.question.answers.push({
			author: $scope.author,
			text: $scope.text
		});
		$scope.author = '';
		$scope.text = '';

		$scope.question.$save();
		$location.path('/');
	};
}