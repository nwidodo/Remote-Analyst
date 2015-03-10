/**
 * Created by Nurwati on 3/10/15.
 */
"use strict";
angular.module('main').controller('FileCtrl', ['$scope','$filter', '$location','ngProgress','apiService', function ($scope, $filter, $location, ngProgress, apiService) {

  ngProgress.color("#8AB8E6");

  //PARSE URL PARAM
  $scope.ProcessName = $location.search()['ProcessName'];
  $scope.CPUNum = $location.search()['CPUNum'];
  $scope.SystemSerial = $location.search()['systemserial'];
  $scope.System = $location.search()['systemname'];
  $scope.starttime = $location.search()['starttime'] * 1000;
  $scope.FileName = $location.search()['FileName'];
  $scope.Pin = $location.search()['Pin'];

  $scope.AvailableDates = [];
  $scope.firstIntv = true;
  $scope.lastIntv = true;

  //DEFAULT CHART CONFIG
  var chartConfig = {
    chart: {
      zoomType: 'x',
      renderTo: 'container',
      alignTicks: false

    },
    subtitle: {
      text: '*Click to view detail',
      align: 'left',
      x: -10,
      style:{
        fontStyle: 'italic',
        fontSize: '10px'
      }
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        turboThreshold: 0,
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              loadData(this.x);

              //alert('Date: ' + Highcharts.dateFormat('%Y-%m-%d',this.x) + ', value: ' + this.y);
            }
          }
        }

      },
      line: {
        gapSize: 2
      },
      column: {
        gapSize: 2,
        stacking: true
      }

    },
    yAxis: [{
      min: 0,
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'ReadsWrites/Sec'
      },
      lineWidth: 2,
      opposite: false
    }, {
      min: 0,
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Opens'
      },
      lineWidth: 2,
      opposite: true
    }],
    xAxis: {
      labels: {autoRotation: [0]},
      gapGridLineWidth: 30,
      type: 'datetime',
      dateTimeLabelFormats: {
        second: '%d %b %Y<br/>%H:%M:%S',
        minute: '%d %b %Y<br/>%H:%M',
        hour: '%d %b %Y<br/>%H:%M',
        day: '%d %b %Y<br/>%H:%M'
      }
    },
    navigator: {
      enabled: true
    },
    scrollbar: {
      enabled: true
    },
    rangeSelector: {
      enabled: false
    },
    series: []


  };

  //TRAVERSE USING PREV AND NEXT BUTTON
  $scope.goIntv = function ($event, param) {

    var actIndex = $scope.AvailableDates.indexOf($scope.selectedDate);
    if (param < 0 && (actIndex > 0)) {
      $scope.selectedDate = $scope.AvailableDates[actIndex - 1];
      loadTrend(urlTrendSingle, $scope.selectedDate * 1000);
    }
    else if (param > 0 && actIndex < $scope.AvailableDates.length - 1) {
      $scope.selectedDate = $scope.AvailableDates[actIndex + 1];
      loadTrend(urlTrendSingle, $scope.selectedDate * 1000);
    }
    actIndex = $scope.AvailableDates.indexOf($scope.selectedDate);
    $scope.firstIntv = false;
    $scope.lastIntv = false;
    if (actIndex == 0) {
      $scope.firstIntv = true;
    }
    if (actIndex == $scope.AvailableDates.length - 1) {
      $scope.firstIntv = false;
    }

  };

  //TRAVERSE USING DROPDOWN
  $scope.goChartDay = function () {

    var timestamp = $scope.selectedDate;

    //ENABLED/DISABLED PREV AND NEXT BTN
    var actIndex = $scope.AvailableDates.indexOf($scope.selectedDate);
    $scope.firstIntv = false;
    $scope.lastIntv = false;
    if (actIndex == 0) {
      $scope.firstIntv = true;
    }
    if (actIndex == $scope.AvailableDates.length - 1) {
      $scope.firstIntv = false;
    }

    //UPDATE CHART BASED ON SELECTION
    loadTrend(urlTrendSingle, timestamp * 1000);

  };

  //CREATE IFRAME TO DOWNLOAD EXCEL FILE
  $scope.downloadFile = function () {
    var url = "https://www.remoteanalyst.com/NewBrowser/FileInfoExcel.aspx?systemSerial=" + $scope.SystemSerial + "&systemName=" + $scope.System + "&cpuNum=" + $scope.CPUNum + "&pin=" + $scope.Pin + "&tableName=" + $scope.TableName + "&interval=" + $scope.Interval + "&processName=" + $scope.ProcessName + "&startTime=" + $scope.StartTimeStr + "&stopTime=" + $scope.StopTimeStr + "&programFileName=" + $scope.FileName;
    $("body").append("<iframe src='" + url + "' style='display: none;' ></iframe>");
  };

  //RETRIEVE PROCESS INFO
  function loadData(date) {
    ngProgress.start();
    loadDataProc(date);
    $scope.showError = false;
    $scope.errorMsg = "";
    var timestamp = date/1000;
    var dataInfo = {
      SystemName: $scope.System,
      SystemSerial: $scope.SystemSerial,
      CPUNum: $scope.CPUNum,
      ProcessName: $scope.ProcessName,
      Pin: $scope.Pin,
      FileName: $scope.FileName,
      StartTime: timestamp
    };
    var i = 0;
    apiService.loadFileData(dataInfo).then(function (result) {
      var data = result;
      $scope.AvailableDates = data.AvailableDates;
      $scope.selectedDate = -1;
      for (i; i < $scope.AvailableDates.length-1; i += 1) {
        if ($scope.AvailableDates[i] <= timestamp && $scope.AvailableDates[i + 1] > timestamp) {
          $scope.selectedDate = $scope.AvailableDates[i];
          i = $scope.AvailableDates.length;
        }
      }

      if ($scope.selectedDate == -1)$scope.selectedDate = $scope.AvailableDates[$scope.AvailableDates.length-1];

      $scope.FileName = data.FileName;
      $scope.Opens = data.Opens;
      $scope.LockWait = parseFloat(data.LockWait);
      $scope.Reads = parseFloat(data.Reads);
      $scope.Writes = parseFloat(data.Writes);
      $scope.ProcessName = data.ProcessName;
      $scope.TimePerIO = data.TimePerIO;
      $scope.Cpu = data.CPUNum;
      $scope.Pin = data.Pin;
      $scope.Openers = data.Openers;
      $scope.RecordsAccessed = parseFloat(data.RecordsAccessed);
      $scope.RecordsUsed = parseFloat(data.RecordsUsed);
      $scope.System = data.SystemName;
      $scope.SystemSerial = data.SystemSerial;
      $scope.StartTimeStr = data.StartTime;
      $scope.FromTimestamp = data.UnixStartTime * 1000;
      $scope.TableName = data.TableName;
      $scope.StopTimeStr = data.StopTime;
      $scope.Interval = data.Interval;
      var tempDate = new Date($scope.FromTimestamp);
      $scope.FromTimestampStr = new Date(
        tempDate.getUTCFullYear(),
        tempDate.getUTCMonth(),
        tempDate.getUTCDate(),
        tempDate.getUTCHours(),
        tempDate.getUTCMinutes(),
        tempDate.getUTCSeconds());
      $scope.ToTimestamp = data.UnixStopTime * 1000;
      tempDate = new Date($scope.ToTimestamp);
      $scope.ToTimestampStr = new Date(
        tempDate.getUTCFullYear(),
        tempDate.getUTCMonth(),
        tempDate.getUTCDate(),
        tempDate.getUTCHours(),
        tempDate.getUTCMinutes(),
        tempDate.getUTCSeconds());


      $scope.showContent = true;
      ngProgress.complete();
      loadTrend(date);
    });

  }

  //RETRIEVE FILE TABLE INFO
  function loadDataProc(date) {
    //ngProgress.start();
    $scope.showError = false;
    $scope.errorMsg = "";
    var dataInfo = {
      SystemName: $scope.System,
      SystemSerial: $scope.SystemSerial,
      CPUNum: $scope.CPUNum,
      ProcessName: $scope.ProcessName,
      Pin: $scope.Pin,
      FileName: $scope.FileName,
      StartTime: date / 1000
    };
    apiService.loadFileTableData(dataInfo).then(function (result) {
      $scope.dataset = result;
    });

  }

  //RETRIEVE TREND INFO AND CREATE CHART
  function loadTrend(datez) {
    $scope.read = [];
    $scope.write = [];
    $scope.count = [];
    var j = 0;

    var chartTrend = $('#container').highcharts();
    chartTrend.showLoading();

    var cpuInfo = {
      SystemName: $scope.System,
      SystemSerial: $scope.SystemSerial,
      CPUNum: $scope.CPUNum,
      ProcessName: $scope.ProcessName,
      Pin: $scope.Pin,
      FileName: $scope.FileName,
      StartTime: datez / 1000
    };
    apiService.loadFileTrendSingleData(cpuInfo).then(function (result)  {
      var data = result;
      $scope.chartLoading = "";
      var dataLength = data.length,
        i = 0;


      var date = 0;
      for (i; i < dataLength; i += 1) {
        date = data[i].UnixFromTimestamp * 1000;
        $scope.read.push([
          date, // the date
          data[i].Reads
        ]);

        $scope.write.push([
          date, // the date
          data[i].Writes
        ]);

        $scope.count.push([
          date, // the date
          data[i].Opens
        ]);
      }
      while (chartTrend.series.length > 0)chartTrend.series[0].remove(true);

      $('#container').highcharts('StockChart', chartConfig);
      chartTrend = $('#container').highcharts();
      chartTrend.addSeries({
        type: 'column',
        name: "Reads",
        id: "read",
        color: Highcharts.getOptions().colors[0], // same as onSeries
        data: $scope.read,
        yAxis: 0,
        gapSize: 5,
        threshold: null,
        tooltip: {
          valueDecimals: 2
        }
      });

      chartTrend.addSeries({
        type: 'column',
        name: "Writes",
        color: "#CC6699",
        id: "write",
        data: $scope.write,
        yAxis: 0,
        gapSize: 5,
        threshold: null,
        tooltip: {
          valueDecimals: 2
        }
      });
      chartTrend.addSeries({
        type: 'line',
        name: "Opens",
        id: "count",
        color: Highcharts.getOptions().colors[2], // same as onSeries
        data: $scope.count,
        yAxis: 1,
        gapSize: 5,
        threshold: null
      });

      chartTrend.addSeries({
        type: 'flags',
        id: "Tag",
        name: "Selected Interval",
        data: [{
          x: datez,
          title: 'X',
          text: 'Shape: "circlepin"'
        }],
        color: Highcharts.getOptions().colors[2], // same as onSeries
        fillColor: Highcharts.getOptions().colors[2],
        width: 16,
        style: {// text style
          color: 'black'
        },
        enableMouseTracking: false

      });
      chartTrend.hideLoading();

      var actIndex = $scope.AvailableDates.indexOf($scope.selectedDate);
      $scope.firstIntv = false;
      $scope.lastIntv = false;

      if (actIndex == 0) {
        $scope.firstIntv = true;
      }
      if (actIndex == $scope.AvailableDates.length - 1) {
        $scope.lastIntv = true;
      }
    });


  }

//ENTRY POINT: Initialize chart and load data
  $('#container').highcharts('StockChart', chartConfig);
  loadData($scope.starttime);


}]);

