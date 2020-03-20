(function( $ ) {
    'use strict';

    /**
     * Data vars
     */
    var countriesHistoryData,
        countriesCurrentData,
        currentTotalData,
        countriesAllData = [],
        countriesAllCurrentData = [],
        lastStatisticsTime,
        todayDate = new Date(),
        todayDateUse = todayDate.getFullYear()+'-'+(todayDate.getMonth()+1)+'-'+todayDate.getDate(),
        svgMap;

    /**
     * This functions maps the countries for the apis
     */
    function mapData() {

        /**
         * Populate countriesAllData array
         */
        $.each(countriesHistoryData,function (countryName,countryDaysData) {

            /**
             * add/refresh today stats
             */
            $.each(countriesCurrentData.countries_stat,function (key,countryCurrentData) {

                /**
                 * If exact case and some mapping
                 */
                if (
                    (countryCurrentData.country_name === countryName) ||
                    (countryName === 'United Arab Emirates' && countryCurrentData.country_name === 'Saudi Arabia') ||
                    (countryName === 'US' && countryCurrentData.country_name === 'USA') ||
                    (countryName === 'Korea, South' && countryCurrentData.country_name === 'S. Korea') ||
                    (countryName === 'Taiwan*' && countryCurrentData.country_name === 'Taiwan') ||
                    (countryName === 'United Kingdom' && countryCurrentData.country_name === 'UK') ||
                    (countryName === 'Holy See' && countryCurrentData.country_name === 'Vatican City') ||
                    (countryName === 'Congo (Kinshasa)' && countryCurrentData.country_name === 'Congo') ||
                    (countryName === 'Congo (Brazzaville)' && countryCurrentData.country_name === 'Congo') ||
                    (countryName === 'The Bahamas' && countryCurrentData.country_name === 'Bahamas') ||
                    (countryName === 'Gambia, The' && countryCurrentData.country_name === 'Gambia') ||
                    (countryName === 'Saint Vincent and the Grenadines' && countryCurrentData.country_name === 'St. Vincent Grenadines')
                ){
                    countryDaysData[countryDaysData.length] = {
                        date: todayDateUse,
                        confirmed: parseInt(countryCurrentData.cases.replace(',','')),
                        deaths:  parseInt(countryCurrentData.deaths.replace(',','')),
                        recovered:  parseInt(countryCurrentData.total_recovered.replace(',','')),
                        new_deaths:  parseInt(countryCurrentData.new_deaths.replace(',','')),
                        new_cases:  parseInt(countryCurrentData.new_cases.replace(',','')),
                        serious_critical:  parseInt(countryCurrentData.serious_critical.replace(',','')),
                        active_cases:  parseInt(countryCurrentData.active_cases.replace(',','')),
                        total_cases_per_1m_population:  parseInt(countryCurrentData.total_cases_per_1m_population.replace(',',''))
                    };
                }
            });
            /**
             * Add full array to countriesAllCurrentData
             */
            countriesAllData[countryName] = countryDaysData;
        });

        /**
         * Create currentAllStats
         */

        countriesAllCurrentData['World'] = {
            date: todayDateUse,
            confirmed: parseInt(currentTotalData.total_cases.replace(',','')),
            deaths:  parseInt(currentTotalData.total_deaths.replace(',','')),
            recovered:  parseInt(currentTotalData.total_recovered.replace(',','')),
            new_deaths:  parseInt(currentTotalData.new_deaths.replace(',','')),
            new_cases:  parseInt(currentTotalData.new_cases.replace(',','')),
            serious_critical:  'N/A',
            active_cases:  'N/A',
            total_cases_per_1m_population:  'N/A'
        };
        countriesAllCurrentData['World'].active_cases = countriesAllCurrentData['World'].confirmed - countriesAllCurrentData['World'].deaths - countriesAllCurrentData['World'].recovered;
        countriesAllCurrentData['World'].total_cases_per_1m_population = parseInt(countriesAllCurrentData['World'].confirmed*1000000/7700000000);

        updatePanelData('World',countriesAllCurrentData['World']);
    }

    /**
     * This function initializes the map and its actions
     */

    function initMap(){

        /**
         * Init map var
         */
        svgMap = $('.mapWrapper > .svgMapWrapper > svg');

        /**
         * Paint map
         */
        $.each(svgMap.find('path'),function () {

            /**
             * Try exact match
             */
            var countryName = $(this).attr('title'),
                countryDaysData = countriesAllData[countryName];

            /**
             * Manual mapping
             */
            if (undefined === countryDaysData){

                if (countryName === 'Democratic Republic of Congo'){countryDaysData = countriesAllData['Congo'];}
                if (countryName === 'Republic of Congo'){countryDaysData = countriesAllData['Congo'];}
                if (countryName === 'Czech Republic'){countryDaysData = countriesAllData['Czechia'];}
                if (countryName === 'Macedonia'){countryDaysData = countriesAllData['North Macedonia'];}
                if (countryName === 'United States'){countryDaysData = countriesAllData['US'];}
            }

            /**
             * Paint country if we have data
             */
            if (undefined !== countryDaysData){

                var upto = 39;
                var max = 25000;
                if (countryDaysData[countryDaysData.length-1].confirmed < 500){
                    upto = 15;
                    max = 500;
                }
                else if(countryDaysData[countryDaysData.length-1].confirmed < 5000){
                    upto = 30;
                    max = 5000;
                }
                var colorScheme = ((upto * countryDaysData[countryDaysData.length-1].confirmed)/max);
                if (colorScheme > upto){colorScheme = upto;}
                colorScheme = 40 - colorScheme;

                $(this).css('fill','hsl('+colorScheme+',90%,60%)');
            }
        });
    }

    /**
     * Functions to load country charts data etc
     */
    function loadCountryStats(country){

        /**
         * Try exact match
         */
        var countryName = country,
            countryDaysData = countriesAllData[countryName];

        /**
         * Manual mapping
         */
        if (undefined === countryDaysData){

            if (countryName === 'Democratic Republic of Congo'){countryDaysData = countriesAllData['Congo'];}
            if (countryName === 'Republic of Congo'){countryDaysData = countriesAllData['Congo'];}
            if (countryName === 'Czech Republic'){countryDaysData = countriesAllData['Czechia'];}
            if (countryName === 'Macedonia'){countryDaysData = countriesAllData['North Macedonia'];}
            if (countryName === 'United States'){countryDaysData = countriesAllData['US'];}
        }

        /**
         * Load the stats
         */
        if (undefined !== countryDaysData){

            loadCharts(countryName,countryDaysData);
        }

        return countryDaysData;
    }

    /**
     * This function generates the charts
     * TODO better
     */
    var deathsChart,
        deathsCurrentChart,
        activeChart,
        activeCurrentChart,
        recoveredChart,
        recoveredCurrentChart;
    function loadCharts(countryName,data) {

        /**
         * Refresh Charts
         */
        if (deathsChart){
            deathsChart.destroy();
            deathsCurrentChart.destroy();
            activeChart.destroy();
            activeCurrentChart.destroy();
            recoveredChart.destroy();
            recoveredCurrentChart.destroy();
        }

        var dates = [];
        var active = [];
        var activeCurrent = [];
        var confirmed = [];
        var confirmedCurrent = [];
        var recovered = [];
        var recoveredCurrent = [];
        var deaths = [];
        var deathsCurrent = [];
        var currA = 0;
        var currC = 0;
        var currD = 0;
        var currR = 0;

        $.each(data,function (k,v) {

            dates.push(v.date);
            confirmed.push(v.confirmed);
            confirmedCurrent.push(v.confirmed - currC);
            deaths.push(v.deaths);
            deathsCurrent.push(v.deaths - currD);
            recovered.push(v.recovered);
            recoveredCurrent.push(v.recovered - currR);
            var activec = v.confirmed - v.deaths - v.recovered;
            active.push(activec);
            activeCurrent.push(activec - currA);

            currC = v.confirmed;
            currD = v.deaths;
            currR = v.recovered;
            currA = activec;
        });

        /**
         * Load the stats of that country to the info box
         */
        updatePanelData(countryName,data[data.length-1]);

        /**
         * chart same vars
         * TODO tooltips on first chart like we have to raise z index of activeChart
         *
         */
        var globarChartOptions = {
            type: 'bar',
            options: {
                elements: {
                    point:{
                        radius: 0
                    }
                },
                legend: {
                    labels: {
                        fontColor: "white",
                    }
                },
                scales: {
                    xAxes: [{
                        stacked: false,
                        ticks: {
                            fontColor: "white"
                        }
                    }],
                    yAxes: [{
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: "white"
                        },
                        gridLines: {
                            color: "rgba(255,255,255,0.05)"
                        }
                    }]
                },
                responsive:true,
            }
        };

        /**
         * Active cases
         */
        var activectx = document.getElementById('active').getContext('2d');
        activeChart = new Chart(activectx, {
            ...globarChartOptions,
            data: {
                labels: dates,
                datasets: [

                    {
                        label: 'Total Cases',
                        backgroundColor: 'rgba(250,200,0,0.0)',
                        hoverBackgroundColor : 'rgba(250,200,0,0.6)',
                        data: confirmed,
                    },
                    {
                        label: '',
                        data: confirmed,
                        backgroundColor: 'rgba(250,200,0,0.6)',
                        borderColor: '#fbc500',
                        type: 'line',
                        fill:true,
                    },
                    {
                        label: 'Active Cases',
                        backgroundColor: 'rgba(255, 106,0,0.0)',
                        hoverBackgroundColor : 'rgba(255, 106,0,0.6)',
                        data: active,
                    },
                    {
                        label: '',
                        data: active,
                        backgroundColor: 'rgba(255, 106,0,0.6)',
                        borderColor: '#ff6a00',
                        type: 'line',
                        fill:true
                    },

                ]
            },
        });

        /**
         * Confrimed every day
         */
        var activeCctx = document.getElementById('activeC').getContext('2d');
        activeCurrentChart = new Chart(activeCctx, {
            ...globarChartOptions,
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Confirmed Every Day',
                        backgroundColor: 'rgba(255,167,0,0)',
                        hoverBackgroundColor: 'rgba(255,167,0,0.6)',
                        borderColor: '#FF9400',
                        data: confirmedCurrent,
                    },
                    {
                        label: '',
                        data: confirmedCurrent,
                        backgroundColor: 'rgba(255,167,0,0.6)',
                        borderColor: '#FF9400',
                        type: 'line',
                        fill:true,
                    }
                ]
            },
        });

        /**
         * Total Recovered
         */
        var recoveredctx = document.getElementById('recovered').getContext('2d');
        recoveredChart = new Chart(recoveredctx, {
            ...globarChartOptions,
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Totan Recovered',
                        backgroundColor: "rgba(58,255,0,0)",
                        hoverBackgroundColor: "rgba(58,255,0,0.6)",
                        borderColor: '#3AFF00',
                        data: recovered,
                    },
                    {
                        label: '',
                        data: recovered,
                        backgroundColor: 'rgba(58,255,0,0.6)',
                        borderColor: '#3AFF00',
                        type: 'line',
                        fill:true,
                    }
                ]
            },
        });

        /**
         * Recovered every day
         */
        var recoveredCctx = document.getElementById('recoveredC').getContext('2d');
        recoveredCurrentChart = new Chart(recoveredCctx, {
            ...globarChartOptions,
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Recovered Every Day',
                        backgroundColor: "rgba(58,255,0,0)",
                        hoverBackgroundColor: "rgba(58,255,0,0.6)",
                        borderColor: '#3AFF00',
                        data: recoveredCurrent,
                    },
                    {
                        label: '',
                        data: recoveredCurrent,
                        backgroundColor: 'rgba(58,255,0,0.6)',
                        borderColor: '#3AFF00',
                        type: 'line',
                        fill:true,
                    }

                ]
            },
        });

        /**
         * Total Deaths
         */
        var deathsctx = document.getElementById('deaths').getContext('2d');
        deathsChart = new Chart(deathsctx, {
            ...globarChartOptions,
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Total Deaths',
                        backgroundColor: 'rgba(255,0,0,0)',
                        hoverBackgroundColor: "rgba(255,0,0,0.6)",
                        borderColor: '#ff0000',
                        data: deaths,
                    },
                    {
                        label: '',
                        data: deaths,
                        backgroundColor: 'rgba(255,0,0,0.6)',
                        borderColor: '#ff0000',
                        type: 'line',
                        fill:true,
                    }

                ]
            },
        });

        var deathsCctx = document.getElementById('deathsC').getContext('2d');
        deathsCurrentChart = new Chart(deathsCctx, {
            ...globarChartOptions,
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Deaths Every Day',
                        backgroundColor: 'rgba(255,0,0,0)',
                        hoverBackgroundColor: "rgba(255,0,0,0.6)",
                        borderColor: '#ff0000',
                        data: deathsCurrent,
                    },
                    {
                        label: '',
                        data: deathsCurrent,
                        backgroundColor: 'rgba(255,0,0,0.6)',
                        borderColor: '#ff0000',
                        type: 'line',
                        fill:true,
                    }

                ]
            },
        });




    }

    /**
     * This function updates the panel data on demand
     */
    function updatePanelData(countryName,lastStats){

        $('.timeFetched').text(lastStatisticsTime);
        $('.countryN').text(countryName);
        $('.totalC').text(lastStats.confirmed);
        $('.totalA').text(lastStats.active_cases);
        $('.totalR').text(lastStats.recovered);
        $('.totalD').text(lastStats.deaths);
        $('.newC').text(lastStats.new_cases);
        $('.newD').text(lastStats.new_deaths);
        $('.perM').text(lastStats.total_cases_per_1m_population);
    }

    /**
     * This is the main function that starts everything
     */
    function doTheInit() {

        /**
         * Wait for the data to be fetched
         */
        if (undefined === countriesHistoryData) {//we want it to match
            setTimeout(doTheInit,1);//wait 50 millisecnds then recheck
            return;
        }
        if (undefined === countriesCurrentData) {//we want it to match
            setTimeout(doTheInit,1);//wait 50 millisecnds then recheck
            return;
        }
        if (undefined === currentTotalData) {//we want it to match
            setTimeout(doTheInit,1);//wait 50 millisecnds then recheck
            return;
        }

        /**
         * Update time
         */
        lastStatisticsTime = countriesCurrentData.statistic_taken_at;

        /**
         * Map the data from apis to main array
         */
        mapData();

        /**
         * Initalize Map
         */
        initMap();

        /**
         * Document ready functions here
         */
        $(document).ready(function() {

            /**
             * Vars init
             */
            var body = $('body'),
                currentFillColor;

            /**
             * Toggle Open map
             */
            body.on('click','.openMap',function () {
                body.find('.mapWrapper').toggleClass('active');
                body.find('.openMap').toggleClass('active');
            });

            /**
             * Color change on Map functions
             */
            svgMap.on('mouseenter','path',function () {

                /**
                 * Try exact match
                 */
                var countryName = $(this).attr('title'),
                    countryDaysData = countriesAllData[countryName];

                /**
                 * Manual mapping
                 */
                if (undefined === countryDaysData){

                    if (countryName === 'Democratic Republic of Congo'){countryDaysData = countriesAllData['Congo'];}
                    if (countryName === 'Republic of Congo'){countryDaysData = countriesAllData['Congo'];}
                    if (countryName === 'Czech Republic'){countryDaysData = countriesAllData['Czechia'];}
                    if (countryName === 'Macedonia'){countryDaysData = countriesAllData['North Macedonia'];}
                    if (countryName === 'United States'){countryDaysData = countriesAllData['US'];}
                }

                /**
                 * Load the stats of that country to the info box
                 */
                if (undefined !== countryDaysData){

                    updatePanelData(countryName,countryDaysData[countryDaysData.length-1]);
                }else{
                    updatePanelData('World',countriesAllCurrentData['World']);
                }

            });

            /**
             * Update panel to world data when we are in no country
             */
            svgMap.on('mouseleave','path',function () {
                updatePanelData('World',countriesAllCurrentData['World']);
            });

            /**
             * On a country click load specific stats
             */
            svgMap.on('click','path',function () {

                var countryDaysData = loadCountryStats($(this).attr('title'));

                if (undefined !== countryDaysData) {
                    body.find('.mapWrapper').toggleClass('active');
                    body.find('.openMap').toggleClass('active');
                }
            });

            // var instance = new SVGPanZoom($('#worldMap')[0], {
            //     eventMagnet: '#SVGContainer'
            // });
            $('#worldMap').svgPanZoom();
        });
    }

    /**
     * HERE STARTS THE MAIN EXECUTION
     */

    /**
     * Get Historic Data
     */
    fetch("https://pomber.github.io/covid19/timeseries.json")
        .then(response => response.json())
        .then(data => {

            countriesHistoryData = data;

            fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php", {
                "method": "GET",
                "headers": {
                    "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
                    "x-rapidapi-key": "e82ca27984msh8b025242f55a82ep11ea41jsn3a36aa4e1d22"
                }
            })
                .then(response => response.json())
                .then(data => {

                    countriesCurrentData = data ;

                    fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php", {
                        "method": "GET",
                        "headers": {
                            "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
                            "x-rapidapi-key": "e82ca27984msh8b025242f55a82ep11ea41jsn3a36aa4e1d22"
                        }
                    })
                        .then(response => response.json())
                        .then(data => {

                            currentTotalData = data ;

                            doTheInit();
                        });
                });
        });
})( jQuery );