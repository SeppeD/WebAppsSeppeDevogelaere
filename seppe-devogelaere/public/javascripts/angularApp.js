var app = angular.module('flapperNews', ['ui.router', 'ngAnimate']);
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: 'partials/home',
        controller: 'MainCtrl',
        resolve: { 
            postPromise: ['posts', '$location', function(posts, $location) {
                console.log("resolving http " + $location.path());
                return posts.getAll();
            }]
        }

    });

    $stateProvider
    .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/partials/comments',
        controller: 'PostCtrl',
        resolve: { 
            post: ['$stateParams', 'posts', '$location', '$state', '$timeout', 
            function($stateParams, posts, $locaton, $state, $timeout) {
                if($stateParams.id) {
                    return posts.get($stateParams.id);
                } else {
                    return $timeout(function() {
                        $state.go('home'); 
                    }, 0);
                }
            }]
        }
    })
    .state('login', { 
        url: '/login', 
                templateUrl: '/partials/login2',                                    //veranderen naar login of login2
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth) { 
                    if(auth.isLoggedIn()) {
                        $state.go('home'); 
                    }
                }]
            })
    .state('register', { 
        url: '/register', 
                templateUrl: '/partials/register2',                                 //veranderen naar register of register2
                controller: 'AuthCtrl', 
                onEnter: ['$state', 'auth', function($state, auth) { 
                    if(auth.isLoggedIn()) { 
                        $state.go('home'); 
                    }
                }]
            });

    $urlRouterProvider.otherwise('/home');
}]);
app.factory('posts', ['$http', '$state', 'auth', function($http, $state, auth) {

    var o = {
        posts: []
    };

    o.getAll = function() { 
        return $http.get('/posts').success(function(data) {
            console.log(data);
            angular.copy(data, o.posts);
        });
    };

    o.create = function(post) { 
        return $http.post('/posts', post, {
            headers: {Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            o.posts.push(data);
        });
    };

    o.upvote = function(post) { 
       return $http.put('/posts/' + post._id + '/upvote', null, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data) { 
        post.upvotes += 1; 
    }).error(function(err) {
        console.log(err) ;
    });
};

o.get = function(id) {
   return $http.get('/posts/' + id).then(function(data) {
       console.log(data);
       return data.data;
   }, function(errStat) {
    console.log(errStat); 
    var t =4;
    $state.go('home');
    var t3 = 4; 
});
};

o.addComment = function(id, comment) { 
   return $http.post('/posts/' + id + '/comments', comment, {
    headers: {Authorization: 'Bearer ' + auth.getToken() }
});
};

o.upvoteComment = function(post, comment) { 
   return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvotes', null, {
    headers: {Authorization: 'Bearer ' + auth.getToken() }
}).success(function(data) {
    comment.upvotes += 1;
});
};

return o;
}]);
app.factory('auth', ['$http', '$window', function($http, $window) {
    var auth = {}; 
    var key = 'flappy-key'; 
    auth.saveToken = function(token) { 
        $window.localStorage.setItem(key,token);
    };

    auth.getToken = function() { 
        return $window.localStorage.getItem(key);
    };

    auth.isLoggedIn = function() { 
        var token = auth.getToken(); 
        
        if(token) { 
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000; 
        } else { 
            return false; 
        }
    }; 

    auth.currentUser = function() { 
        if(auth.isLoggedIn()) {
            var token = auth.getToken(); 
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username; 
        }
    };
    
    auth.register = function(user) { 
        return $http.post('/register', user).success(function(data) { 
            auth.saveToken(data.token); 
        });
    };

    auth.logIn = function(user) { 
        return $http.post('/login', user).success(function(data) { 
            auth.saveToken(data.token); 
        }); 
    }; 

    auth.logOut = function(){
      $window.localStorage.removeItem(key);
  };
  return auth; 
}]);
app.controller('AuthCtrl', [
    '$scope', 
    '$state', 
    'auth',
    function($scope, $state, auth) { 
        $scope.user = {}; 

        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error; 
            }).then(function() {
                $state.go('home'); 
            });
        }; 

        $scope.logIn = function() { 
            auth.logIn($scope.user).error(function(error) { 
                $scope.error = error; 
            }).then(function() { 
                $state.go('home');
            });
        }; 
    }]);
app.controller('MainCtrl', ['$scope', 'posts', 'auth', function($scope, posts, auth) {
    $scope.isLoggedIn = auth.isLoggedIn; 
    $scope.posts = posts.posts; 

    $scope.addPost = function() {
        if(!$scope.title || $scope.title === '') return;
        posts.create({
            title: $scope.title, 
            link: $scope.link,
            author: auth.currentUser()
        });
        $scope.title = '';
        $scope.link = '';
    };
    $scope.incrementUpvotes = function(post) {
       posts.upvote(post); 
   };
}]);
app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth) { 
    $scope.isLoggedIn = auth.isLoggedIn; 
    $scope.currentUser = auth.currentUser; 
    $scope.logOut = auth.logOut; 
}]);
app.controller('PostCtrl', ['$scope', 'post', 'posts', '$state', '$q', 'auth', 
    function($scope, post, posts, $state, $q, auth) {


        $scope.images=[{src:'img1.png',title:'Pic 1'},{src:'img2.jpg',title:'Pic 2'},{src:'img3.jpg',title:'Pic 3'},{src:'img4.png',title:'Pic 4'},{src:'img5.png',title:'Pic 5'}]; 


            //redirect if user ever tries to get acces to undefined / comment
            //$state.go('home');
            $scope.isLoggedIn = auth.isLoggedIn; 
            $scope.post = post;       
            $scope.incrementUpvotes = function(comment) {
                posts.upvoteComment(post, comment);
            };
            $scope.addComment = function() {
                if($scope.author === '' || $scope.body === '') return;
                posts.addComment(post._id, {
                    author: $scope.author,
                    body: $scope.body,
                })
                .success(function(comment) {
                    $scope.post.comments.push(comment);     
                });
                $scope.author = '';
                $scope.body = '';
            };
        }]);

app.directive('slider', function ($timeout) {
  return {
    restrict: 'AE',
    replace: true,
    scope:{
        images: '='
    },
    link: function (scope, elem, attrs) {

        scope.currentIndex=0;

        scope.next=function(){
            scope.currentIndex<scope.images.length-1?scope.currentIndex++:scope.currentIndex=0;
        };
        
        scope.prev=function(){
            scope.currentIndex>0?scope.currentIndex--:scope.currentIndex=scope.images.length-1;
        };
        
        scope.$watch('currentIndex',function(){
            scope.images.forEach(function(image){
                image.visible=false;
            });
            scope.images[scope.currentIndex].visible=true;
        });

        var timer;
        var sliderFunc = function() {
          timer = $timeout(function() {
            scope.next();
            timer = $timeout(sliderFunc, 500);
        }, 5000);
      };

      sliderFunc();

      scope.$on('$destroy', function() {
  $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
});

  },
  templateUrl: 'partials/slider'
}
});
