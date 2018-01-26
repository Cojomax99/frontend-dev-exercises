'use strict';

angular.module('rtiApp.home', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home.html',
    controller: 'homeCtrl'
  });
}])

.controller('homeCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    // Load for 1.5 seconds after completion of calculations to obtain graph data
    // to show full animation
    // Loading animation from https://codepen.io/alexerlandsson/pen/yOVdvj
    $scope.loading = true;

    $scope.multi_data = [];
    $scope.edu_data = [];
    $scope.race_data = [];

    // Options for the education levels vs income graph
    $scope.edu_options = {
        chart: {
            type: 'multiBarHorizontalChart',
            height: 450,
            showValues: true,
            duration: 500,
            margin: {top: 30, right: 20, bottom: 50, left: 225},
            xAxis: {
                axisLabel: 'Education Level',
                axisLabelDistance: 125
            },
            yAxis: {
                axisLabel: '%',
                axisLabelDistance: 0
            },
            yDomain: [0, 100],
            stacked: true,
            barColor: function(d, i){
                if (d.key === "false") {
                    return d3.scale.category20().range()[6];  // red
                } else {
                    return d3.scale.category20().range()[0];  // blue
                }
            }
        },
        title: {
            enable: true,
            text: '% Per Education Level With Income > 50k'
        }
    };

    // Options for the race vs income graph
    $scope.race_options = {
        chart: {
            type: 'multiBarHorizontalChart',
            height: 450,
            showValues: true,
            duration: 500,
            margin: {top: 30, right: 20, bottom: 50, left: 225},
            xAxis: {
                axisLabel: 'Race',
                axisLabelDistance: 125
            },
            yAxis: {
                axisLabel: '%',
                axisLabelDistance: 0
            },
            yDomain: [0, 100],
            stacked: true,
            barColor: function(d, i){
                if (d.key === "false") {
                    return d3.scale.category20().range()[6];  // red
                } else {
                    return d3.scale.category20().range()[0];  // blue
                }
            }
        },
        title: {
            enable: true,
            text: '% Per Race With Income > 50k'
        }
    };

    // Options for the race amounts per education level vs income graph
     $scope.multi_options = {
        chart: {
            type: 'multiBarHorizontalChart',
            height: 450,
            showValues: true,
            duration: 500,
            margin: {top: 30, right: 20, bottom: 50, left: 225},
            xAxis: {
                axisLabel: 'Education Level',
                axisLabelDistance: 125
            },
            yAxis: {
                axisLabel: '%',
                axisLabelDistance: 0
            },
            yDomain: [0, 100],
            stacked: true
        },
        title: {
            enable: true,
            text: '% Per Education Level w/Race Breakdown With Income > 50K'
        }
    };

    // Read the census csv file from disk
    // NOTE: This would cause issues in production. Look into manual file loading
    //       to get around this in production
    d3.csv("../../census.csv", function(data) {
        // Store counts of race per education level
        var edu_race_map = {};

        // Cache of races present for easy access later
        var race_list = [];

        data.forEach(function(d) {
            // Convert all numeric values from strings to number
            d.age = +d.age;
            d.count = +d.count;
            d.over_50k = +d.over_50k;

            // Gather all races present
            if (!race_list.includes(d.race)) {
                race_list.push(d.race)
            }

            // Get counts of race per education level
            if (!edu_race_map[d.education_level]) {
                edu_race_map[d.education_level] = {};
            }

            // Only add to count of race per education level if the person makes
            // over 50k per year
            if (d.over_50k) {
                if (edu_race_map[d.education_level][d.race]) {
                    edu_race_map[d.education_level][d.race]++;
                } else {
                    edu_race_map[d.education_level][d.race] = 1;
                }
            }
        })

        function is_over_50(b) {
            return b.over_50k;
        }

        // Holds the data that will eventually be set to the scope variable to draw
        // the chart
        var final_dual_data = [];

        // Use d3 to organize the data
        // Keys: education levels
        // Values: % of people with that education level that make over 50k
        var edu_level_percents = d3.nest()
          .key(function(d) { return d.education_level; })
          .rollup(
            function(v) {
                return v.filter(is_over_50).length / v.length * 100
            })
          .entries(data);

        // Use d3 to organize the data
        // Keys: races
        // Values: % of people with that race that make over 50k
        var race_percents = d3.nest()
          .key(function(d) { return d.race; })
          .rollup(
            function(v) {
                return v.filter(is_over_50).length / v.length * 100
            })
          .entries(data);

        var final_edu_data = [];
        var final_race_data = [];

        // Populate graph data for education levels
        // Use true to represent people who make over 50k
        // and false to represent those who make under 50k
        for (var bool of [true, false]) {
            var values = [];
            for (var entry of edu_level_percents) {
                var edu_level = entry['key'];
                var percent = entry['values'];

                // If bool is true, meaning we're accounting for users who make
                // over 50k, just include the percent we already calculated.
                // Otherwise, use 100 - that percent to account for those who
                // make under 50k.
                values.push({
                    "x": edu_level,
                    "y": bool ? percent : 100 - percent
                });
            }

            final_edu_data.push({
                "key": bool.toString(),
                "values": values
            });
        }

        // Populate graph data for races
        // Use true to represent people who make over 50k
        // and false to represent those who make under 50k
        for (var bool of [true, false]) {
            var values = [];
            for (var entry of race_percents) {
                var race = entry['key'];
                var percent = entry['values'];

                // If bool is true, meaning we're accounting for users who make
                // over 50k, just include the percent we already calculated.
                // Otherwise, use 100 - that percent to account for those who
                // make under 50k.
                values.push({
                    "x": race,
                    "y": bool ? percent : 100 - percent
                });
            }

            // Put the race data into the final data structure
            final_race_data.push({
                "key": bool.toString(),
                "values": values
            });
        }


        // Populate graph data for education levels
        for (var entry of edu_level_percents) {
            // Get % of total the education level comprises
            var percent = entry['values'];
            var races = edu_race_map[entry['key']];
            var edu_level = entry['key'];

            var total_people = 0;
            for (var race of Object.keys(races)) {
                total_people += races[race];
            }

            var race_array = [];

            for (var race of Object.keys(races)) {
                // Amount race present in the total bar for people who make over 50k
                var percent_of_sub_total = races[race] / total_people;
                var percent_total = percent * percent_of_sub_total;

                // Replace values in the edu level to race map with percentages
                // of the total for people making over 50k
                edu_race_map[edu_level][race] = percent_total;
            }
        }

        // Populate the dual data list by iterating through all races
        // then adding in an entry for each education level and its
        // relative percentage per race
        for (var race of race_list) {
            var values = [];
            for (var edu_level of Object.keys(edu_race_map)) {
                values.push({
                    "x": edu_level,
                    "y": edu_race_map[edu_level][race]
                })
            }
            var datum = {
                "key": race,
                "values": values
            }
            final_dual_data.push(datum);
        }

        // Fill in remaining data to illustrate the percent of people
        // in each bracket that make under 50k
        var values = [];
        for (var i = 0; i < Object.keys(edu_race_map).length; i++) {
            var edu_level = Object.keys(edu_race_map)[i];
            values.push({
                "x": edu_level,
                "y": 100 - edu_level_percents[i].values
            })
        }

        // Plop in an extra dataset to fill in the remaining column space
        // to represent those who make under 50k / yr
        final_dual_data.push({
            "key": "Under 50k",
            "values": values
        })

        // Trigger a digest to populate the scope with the fully calculated data
        $scope.$apply(function() {
            $scope.multi_data = final_dual_data;
            $scope.edu_data = final_edu_data;
            $scope.race_data = final_race_data;
            $timeout(function() {
                $scope.loading = false;
            }, 1500)
        })
    }) // End of d3.csv
}])
