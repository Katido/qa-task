angular.module('question', ['firebase']).
	value('fbURL', 'https://ksenia-q-a-firebase.firebaseio.com/').
	factory('Question', function(angularFireCollection, fbURL) {
		return angularFireCollection(fbURL);
	}).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller:ListCtrl, templateUrl:'list.html'}).
			when('/question/:questionId', {controller:EditCtrl, templateUrl:'question.html'}).
			when('/edit/:questionId', {controller:EditCtrl, templateUrl:'detail.html'}).
			when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
			otherwise({redirectTo:'/'});
	});
 
function ListCtrl($scope, Question) {
	$scope.question = Question;
	$scope.showFilter = 'all';
	
	$scope.show = function(param) {
		$scope.showFilter = param;
	};
}
 
function CreateCtrl($scope, $location, $timeout, Question) {
	$scope.save = function() {
		$scope.question.answered = false;
		Question.add($scope.question, function() {
			$timeout(function() { $location.path('/'); });
		});
	}
}
 
function EditCtrl($scope, $location, $routeParams, angularFire, fbURL) {
	angularFire(fbURL + $routeParams.questionId, $scope, 'remote', {}).
	then(function() {
		$scope.question = angular.copy($scope.remote);
		$scope.question.$id = $routeParams.questionId;
		$scope.isClean = function() {
			return angular.equals($scope.remote, $scope.question);
		}
		$scope.destroy = function() {
			$scope.remote = null;
			$location.path('/');
		};
		$scope.save = function() {
			$scope.remote = angular.copy($scope.question);
			$location.path('/');
		};
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

			$scope.remote = angular.copy($scope.question);
			$location.path('/');
		};
	});
}