angular.module('timerApp', [])
    .controller('timerController', ['$scope', '$interval', function ($scope, $interval) {

        $scope.application = {
            name: 'Time Tracker',
            author: 'Savan Koradia',
            description: '',
            url: 'https://savankoradia.com',
            footer: {
                copyright: 'Savan',
                url: 'https://savankoradia.com'
            }
        };

        $scope.allTasks = {};

        function msToTime (milliseconds) {
            const hours = Math.floor(milliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
            return `${hours}:${minutes}:${seconds}`;
        }

        $scope.getTimeString = function (startTime, endTime) {
            if (endTime != '') {
                const milliseconds = endTime - startTime;
                return msToTime(milliseconds);
            }
        }

        /**
         * Get all the tasks from the memory if exists
         */
        $scope.getAllTasks = function () {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['tasks'], (result) => {
                    if ('tasks' in result) {
                        $scope.allTasks = result.tasks;
                        $scope.$apply();
                        resolve(result.tasks);
                    }
                });
            });
        };

        $scope.getTotalTimeSpent = function () {
            var totalTime = 0;
            Object.entries($scope.allTasks).forEach(([key, value]) => {
               totalTime += (value.endTime - value.startTime); 
            });
            return msToTime(totalTime);
        }

        $scope.getAllTasks();


    }]);