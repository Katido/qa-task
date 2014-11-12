angular.module('question', ['ngRoute', 'firebase'])
	//modele depends on ngRoute and firebase
	.constant('fbURL', 'https://amber-fire-2430.firebaseio.com/') 
	//firebase url
	.factory('Question', function ($firebase, fbURL) {
		//factory returning Questions Array which reads firebase
		return $firebase(new Firebase(fbURL)).$asArray();
	})
	.config(['$routeProvider', function($routeProvider) {
		//config depends on $routeProvider
		$routeProvider
		//it links hash urls, controllers and templates
			.when('/', {controller:ListController, templateUrl:'list.html'})
			//list of questions - index page
			.when('/question/:questionId', {controller:EditController, templateUrl:'question.html'})
			//question details and ability to add answers - opened on question name click
			.when('/edit/:questionId', {controller:EditController, templateUrl:'detail.html'})
			//edit question, the same controller as q.details - opened on pen click
			.when('/new', {controller:CreateController, templateUrl:'detail.html'})
			//create question (without answers) - opened on Add question button click
			.otherwise({redirectTo:'/'});
	}]);
 
function ListController($scope, Question) {
	//opens question list
	$scope.question = Question; //sets local scope to the synced from remote Question
	$scope.showFilter = 'all'; //search filter is All
	
	$scope.show = function(param) {
		//filtering by answered/unanswered
		$scope.showFilter = param;
	};
}
 
function CreateController($scope, $location, $timeout, Question) {
	//creates the question
	$scope.save = function() {
		//called on save button click
		$scope.question.answered = false; //not answered by default
		Question.$add($scope.question)
		//sync with firebase, returns a promise when it's done
			.then(function(ref) {
				//redirect to the main page
				$location.path('/');
			});
	}
}
 
function EditController($scope, $location, $routeParams, fbURL, $firebase) {
	//show specific question details, add answers, edit, delete question
	var sync = $firebase(new Firebase(fbURL + $routeParams.questionId));
	//read the question from firebase based on its id provided in the route
	$scope.question = sync.$asObject();
	//save as Object and put to the local scope
	
	$scope.isClean = function() {
		//returns true is local == remote data (so nothing is changed)
		//otherwise it's false and Save button should be enabled
		return angular.equals($scope.remote, $scope.question);
	}

	$scope.destroy = function() {
		var syncAll = $firebase(new Firebase(fbURL)).$asArray();
		//read all data from Firebase
		syncAll.$loaded().then(function(data) {
			//when it's loaded it returns a promise
			syncAll.$remove(syncAll.$getRecord($routeParams.questionId));
			//we remove item using its $id which is the same as route param
			// $id is $routeParams.questionId; syncAll.$getRecord($id) is item
			$location.path('/');
		})
		
	}

	$scope.save = function() {
		$scope.question.$save();
		//save in firebase
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
		//add info to $scope.question
		$scope.author = '';
		$scope.text = '';

		$scope.question.$save();
		//save in firebase
		$location.path('/');
	};
}