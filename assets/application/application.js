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

        $scope.name = '';
        $scope.currentTask = {
            id: null,
            name: '',
            startTime: '',
            endTime: '',
            timeSpent: ''
        };
        $scope.allTasks = {};
        var promise;
        $scope.currentTimeSpentDisplay = '';

        /**
         * Using milliseconds calcualte time
         * @param {*} milliseconds 
         * @returns 
         */
        $scope.msToTime = function(milliseconds) {
            const hours = Math.floor(milliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
            return `${hours}:${minutes}:${seconds}`;
        }

        /**
         * Using start time and end time, calculate hours, minutes, seconds.
         * @param {*} startTime 
         * @param {*} endTime 
         * @returns 
         */
        $scope.getTimeString = function (startTime, endTime) {
            if (endTime != '') {
                const milliseconds = endTime - startTime;
                return $scope.msToTime(milliseconds);
            }
        }

        /**
         * Save the task to the all tasks list and save to memory.
         */
        $scope.saveTask = function () {
            $scope.allTasks[$scope.currentTask.id] = $scope.currentTask;
            $scope.saveAllTasks();
        };

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

        /**
         * Save all the tasks to the memory.
         */
        $scope.saveAllTasks = function () {
            chrome.storage.local.set({
                tasks: $scope.allTasks
            });
            $scope.getAllTasks();
        }

        /**
         * Clear all the tasks from the memory.
         */
        $scope.clearAll = function () {
            if (window.confirm('Are you really sure to delete all data?')) {
                $scope.allTasks = {};
                $scope.saveAllTasks();
                alert("memory cleared");
            }
        };


        /**
         * on execution of this function, it will save the data to session/memory with its starting time.
         */
        $scope.startTimer = function () {
            //if there is current data, means timer is alrady running. on click, stop current timer.
            if ($scope.currentTask.id) {
                $scope.stopTimer();
                $scope.name = '';
                $interval.cancel(promise);
                return;
            }

            //create a new current task
            $scope.currentTask.id = Date.now();
            $scope.currentTask.startTime = Date.now();
            $scope.currentTask.name = $scope.name;
            promise = $interval(function () {
                $scope.currentTimeSpentDisplay = $scope.getTimeString($scope.currentTask.startTime, new Date().getTime());
            }, 1000);
            $scope.saveTask();

        };

        /**
         * on the execution of this function, it will stop the timer and remove data from the currentTask
         */
        $scope.stopTimer = function () {
            $scope.currentTask.endTime = Date.now();
            $scope.currentTask.timeSpent = $scope.currentTask.endTime - $scope.currentTask.startTime;
            $scope.saveTask();
            $scope.currentTask = {
                id: null,
                name: '',
                startTime: '',
                endTime: '',
                timeSpent: ''
            };
        };

        /**
         * Set the last running time to continue from there.
         */
        $scope.getLastRunningTask = function () {
            var lastEntry = $scope.allTasks[Object.keys($scope.allTasks).pop()];
            if (lastEntry && !lastEntry.endTime) {
                $scope.currentTask = {
                    id: lastEntry.id,
                    name: lastEntry.name,
                    startTime: lastEntry.startTime,
                    endTime: lastEntry.endTime,
                    timeSpent: lastEntry.timeSpent
                }
                $scope.name = $scope.currentTask.name;
                promise = $interval(function () {
                    $scope.currentTimeSpentDisplay = $scope.getTimeString($scope.currentTask.startTime, new Date().getTime());
                }, 1000);
                $scope.$apply();
            }
        };

        /**
         * Get total time spent for all tasks
         * @returns 
         */
        $scope.getTotalTimeSpent = function () {
            var totalTime = 0;
            Object.entries($scope.allTasks).forEach(([key, value]) => {
                totalTime += (value.endTime - value.startTime);
            });
            return $scope.msToTime(totalTime);
        };

        $scope.getAllTasks().then(function () {
            $scope.getLastRunningTask();
        });

        /**
         * Get data by task name group
         * @returns 
         */
        $scope.getTasksByName = function () {
            var mergedData = {};

            for (var id in $scope.allTasks) {
                var taskData = $scope.allTasks[id];
                var name = taskData.name;

                if (!mergedData[name]) {
                    mergedData[name] = {
                        name,
                        timeSpent: 0,
                        count: 0
                    };
                }

                mergedData[name].timeSpent += taskData.timeSpent;
                mergedData[name].count++;
            }

            return mergedData;
        };

    }]);