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
        $scope.timeSpent = '';
        var dbRequest = null;

        const indexedDB = window.indexedDB;
        const databaseName = 'timerAppDb';
        const version = 1;

        var Db = {
            init: function () {
                const dbPromise = indexedDB.open(databaseName, version);
                dbPromise.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains('timeTable')) {
                        const objectStore = db.createObjectStore('timeTable', { keyPath: 'id', autoIncrement: true });
                        objectStore.createIndex('taskId', 'taskId', { unique: false });
                        objectStore.createIndex('startTimestamp', 'startTimestamp', { unique: false });
                        objectStore.createIndex('endTimeStamp', 'endTimeStamp', { unique: false });
                        objectStore.createIndex('timeSpent', 'timeSpent', { unique: false });
                    }
                };

                dbPromise.onsuccess = (event) => {
                    console.log('Database created successfully.');
                };

                dbPromise.onerror = (event) => {
                    console.error('Error creating database:', event.target.error);
                };
            },
            saveTask: function (taskId, startTimestamp, endTimeStamp, timeSpent) {
                const dbPromise = indexedDB.open(databaseName, version);
                dbPromise.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction('timeTable', 'readwrite');
                    const objectStore = transaction.objectStore('timeTable');

                    const newEntry = {
                        taskId,
                        startTimestamp,
                        endTimeStamp,
                        timeSpent,
                    };

                    objectStore.add(newEntry);

                    transaction.oncomplete = (event) => {
                        $scope.currentTask.id = Db.getAutoincrementedPrimaryKey();
                        console.log('Entry added successfully.');
                    };

                    transaction.onerror = (event) => {
                        console.error('Error adding entry:', event.target.error);
                    };
                };

                dbPromise.onerror = (event) => {
                    console.error('Error opening database:', event.target.error);
                };
            },
            getAllTasks: function () {
                const dbPromise = indexedDB.open(databaseName, version);

                return new Promise((resolve, reject) => {
                    dbPromise.onsuccess = (event) => {
                        const db = event.target.result;
                        const transaction = db.transaction('timeTable', 'readonly');
                        const objectStore = transaction.objectStore('timeTable');
    
                        const request = objectStore.getAll();
    
                        request.onsuccess = (event) => {
                            const entries = event.target.result;
                            $scope.allTasks = entries;
                            resolve(entries);
                        };
    
                        request.onerror = (event) => {
                            reject(new Error('Error retrieving entries:', event.target.error));
                        };
                    };
    
                    dbPromise.onerror = (event) => {
                        reject(new Error('Error opening database:', event.target.error));
                    };
                });
            },
            getTaskById: function (taskId) {
                const dbPromise = indexedDB.open(databaseName, version);

                return  new Promise((resolve, reject) => {
                    dbPromise.onsuccess = (event) => {
                        const db = event.target.result;
                        const transaction = db.transaction('timeTable', 'readonly');
                        const objectStore = transaction.objectStore('timeTable');
    
                        const request = objectStore.get(taskId);
    
                        request.onsuccess = (event) => {
                            const entry = event.target.result;
                            if (entry) {
                                resolve(entry);
                                console.log(`Entry with ID ${taskId}:`, entry);
                            } else {
                                reject(new Error(`Entry with ID ${taskId} not found.`));
                            }
                        };
    
                        request.onerror = (event) => {
                            reject(new Error(`Error retrieving entry with ID ${taskId}:`, event.target.error));
                        };
                    };
    
                    dbPromise.onerror = (event) => {
                        reject(new Error('Error opening database:', event.target.error));
                    };
                });
            },
            deleteAll: function () {
                const dbPromise = indexedDB.open(databaseName, version);

                dbPromise.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction('timeTable', 'readwrite');
                    const objectStore = transaction.objectStore('timeTable');

                    const request = objectStore.clear();

                    request.onsuccess = (event) => {
                        console.log('All entries deleted successfully.');
                    };

                    request.onerror = (event) => {
                        console.error('Error deleting entries:', event.target.error);
                    };
                };

                dbPromise.onerror = (event) => {
                    console.error('Error opening database:', event.target.error);
                };
            },
            deleteById: function (taskId) {
                const dbPromise = indexedDB.open(databaseName, version);

                dbPromise.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction('timeTable', 'readwrite');
                    const objectStore = transaction.objectStore('timeTable');

                    const request = objectStore.delete(taskId);

                    request.onsuccess = (event) => {
                        console.log(`Entry with ID ${taskId} deleted successfully.`);
                    };

                    request.onerror = (event) => {
                        console.error(`Error deleting entry with ID ${taskId}:`, event.target.error);
                    };
                };

                dbPromise.onerror = (event) => {
                    console.error('Error opening database:', event.target.error);
                };
            },
            updateTask: function (pkId, taskId, startTimestamp, endTimeStamp, timeSpent) {
                const dbPromise = indexedDB.open(databaseName, version);

                dbPromise.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction('timeTable', 'readwrite');
                    const objectStore = transaction.objectStore('timeTable');

                    const request = objectStore.put({
                        taskId: taskId,
                        startTimestamp: startTimestamp,
                        endTimeStamp: endTimeStamp,
                        timeSpent: timeSpent
                    }, pkId);

                    request.onsuccess = (event) => {
                        console.log(`Entry with ID ${taskId} updated successfully.`);
                    };

                    request.onerror = (event) => {
                        console.error(`Error updating entry with ID ${taskId}:`, event.target.error);
                    };
                };

                dbPromise.onerror = (event) => {
                    console.error('Error opening database:', event.target.error);
                };
            },
            getAutoincrementedPrimaryKey: function () {
                Db.getAllTasks().then((entries) => {
                    return $scope.allTasks[$scope.allTasks.length-1]['id'];
                  }).catch((error) => {
                    console.error('Error retrieving entries:', error);
                  });
                
            }
        };

        // Db.init();

        function getTimeString(milliseconds) {
            const seconds = Math.floor(milliseconds / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            const timeString = `${hours}:${minutes}:${seconds}`;

            return timeString;
        }

        /**
         * Save the task to the all tasks list and save to memory.
         */
        $scope.saveTask = function () {
            $scope.allTasks[$scope.currentTask.id] = $scope.currentTask;
            $scope.saveAllTasks();
            // if ($scope.currentTask.id) {
            //     Db.updateTask($scope.currentTask.id, $scope.currentTask.name, $scope.currentTask.startTime, $scope.currentTask.endTime, $scope.currentTask.timeSpent);
            // } else {
            //     Db.saveTask($scope.currentTask.name, $scope.currentTask.startTime, $scope.currentTask.endTime, $scope.currentTask.timeSpent);
            // }
        };

        /**
         * Get all the tasks from the memory if exists
         */
        $scope.getAllTasks = function () {
            chrome.storage.local.get(['tasks'], (result) => {
                if ('tasks' in result) {
                    $scope.allTasks = result.tasks;
                    $scope.$apply();
                }
            });
            // Db.getAllTasks();
        };

        /**
         * Save all the tasks to the memory.
         */
        $scope.saveAllTasks = function () {
            // return false;
            chrome.storage.local.set({
                tasks: $scope.allTasks
            });
            $scope.getAllTasks();
        }

        /**
         * Clear all the tasks from the memory.
         */
        $scope.clearAll = function () {
            $scope.allTasks = {};
            $scope.saveAllTasks();
            // Db.deleteAll();
            alert("memory cleared");
        };


        /**
         * on execution of this function, it will save the data to session/memory with its starting time.
         */
        $scope.startTimer = function () {
            //if there is current data, means timer is alrady running. on click, stop current timer.
            if ($scope.currentTask.id) {
                $scope.stopTimer();
                $scope.taskName = '';
                $interval.cancel(promise);
                return;
            }


            //create a new current task
            $scope.currentTask.id = Date.now();
            $scope.currentTask.startTime = Date.now();
            $scope.currentTask.name = $scope.name;
            promise = $interval(function () {
                $scope.currentTask.timeSpent = getTimeString(new Date().getTime() - $scope.currentTask.startTime);
            }, 1000);
            $scope.saveTask();

        };

        /**
         * on the execution of this function, it will stop the timer and remove data from the currentTask
         */
        $scope.stopTimer = function () {
            $scope.currentTask.endTime = Date.now();
            $scope.saveTask();
            $scope.currentTask = {
                id: null,
                name: '',
                startTime: '',
                endTime: '',
                timeSpent: ''
            };
        };

        $scope.getLastRunning


        $scope.getAllTasks();
    }]);