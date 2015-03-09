"use strict";
angular.module('main').controller('ProcCtrl', function ($scope, $http, $filter, $location, ngProgress) {


  var data = [];
  $scope.dataset = [];
  //PARSE URL PARAM
  $scope.ProcessName = $location.search()['ProcessName'];
  $scope.CPUNum = $location.search()['CPUNum'];
  $scope.SystemSerial = $location.search()['systemserial'];
  $scope.System = $location.search()['systemname'];
  $scope.starttime = $location.search()['starttime'] * 1000;
  $scope.ProgramFileName = $location.search()['ProgramFileName'];
  $scope.FileName = $location.search()['FileName'];
  $scope.Pin = $location.search()['Pin'];

  ngProgress.color("#8AB8E6");
  $scope.firstIntv = true;
  $scope.lastIntv = true;

  //Chart Default Config
  var chartConfig = {
    chart: {
      zoomType: 'x',
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
        animation: false
      },
      line: {
        gapSize: 2
      },
      scatter: {
        lineWidth: 1
      }
    },
    yAxis: [{
      min: 0,
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Busy(%)'
      },
      lineWidth: 2,
      opposite: false
    },
      {
        min: 0,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Memory(MB)'
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
        day: '%d %b %Y<br/>%H:%M',
        week: '%d %b %Y',
        month: '%b %Y',
        year: '%Y'
      }
    },
    rangeSelector: {
      buttons: [{
        type: 'hour',
        count: 3,
        text: '3h'
      }, {
        type: 'day',
        count: 1,
        text: '1d'
      }, {
        type: 'week',
        count: 1,
        text: '1w'
      }, {
        type: 'all',
        text: 'All'
      }],
      inputEnabled: false
    },
    series: []


  };

  //API PATH
  var urlMain = "http://54.200.152.58:8080/api/processinfodata";
  var urlMainTab = "http://54.200.152.58:8080/api/processfiledata"
  var urlTrend = "http://54.200.152.58:8080/api/processtrenddatamultiday";
  var urlTrendSingle = "http://54.200.152.58:8080/api/processtrenddata";


  //TRAVERSE INTERVAL
  $scope.goIntv = function ($event, param) {

    var chart = $('#container').highcharts();
    var timestamp = $scope.FromTimestamp;

    var xData = chart.xAxis[0].series[0].xData;
    var actIndex = xData.indexOf(timestamp);
    if (param < 0 && (actIndex > 0)) {
      chart.get("Tag").data[0].update({x: xData[actIndex - 1]});
      loadData(xData[actIndex - 1]);
      timestamp = xData[actIndex - 1];
    }
    else if (param > 0 && actIndex < xData.length - 1) {
      chart.get("Tag").data[0].update({x: xData[actIndex + 1]});
      loadData(xData[actIndex + 1]);
      timestamp = xData[actIndex + 1];
    }
    actIndex = xData.indexOf(timestamp);
    $scope.firstIntv = false;
    $scope.lastIntv = false;
    if (actIndex == 0) {
      $scope.firstIntv = true;
    }
    if (actIndex == xData.length - 1) {
      $scope.lastIntv = true;
    }
  }

  //TOGGLE AXIS MAX VAL
  $scope.toggleAxis = function ($event, axisName) {
    var chart = $('#container').highcharts();
    var checkbox = $event.target;
    if (axisName == 'cpu') {
      if (!checkbox.checked) chart.yAxis[0].setExtremes(0, null);
      else chart.yAxis[0].setExtremes(0, 100);
    }
    else {
      if (!checkbox.checked) chart.yAxis[1].setExtremes(0, null);
      else chart.yAxis[1].setExtremes(0, $scope.TotalMemory);
    }

  };

  //RETRIEVE PROCESS INFO
  function loadData(date) {
    ngProgress.start();
    $scope.showError = false;
    $scope.errorMsg = "";
    loadDataProc(date);
    var dataInfo = {
      SystemName: $scope.System,
      SystemSerial: $scope.SystemSerial,
      CPUNum: $scope.CPUNum,
      ProcessName: $scope.ProcessName,
      Pin: $scope.Pin,
      ProgramFileName: $scope.ProgramFileName,
      StartTime: date / 1000
    };

    var res = $http.post(urlMain, dataInfo);
    res.success(function (result) {
      data = result;
      $scope.ProcessName = data.ProcessName;
      $scope.TotalMemory = parseFloat(data.TotalMemory);
      $scope.cpuBusy = parseFloat(data.CPUBusy);
      $scope.Memory = parseFloat(data.Memory);
      $scope.MemPct = parseFloat(data.Memory) / parseFloat(data.TotalMemory) * 100;
      $scope.Program = data.Program;
      $scope.Priority = data.Priority;
      $scope.Cpu = data.CPUNum;
      $scope.Pin = data.Pin;
      $scope.Ancestor = data.Ancestor;
      $scope.AncestorProgramName = data.AncestorProgramName;
      $scope.AncestorCPU = data.AncestorCPU;
      $scope.AncestorPin = data.AncestorPin;
      $scope.Messages = parseFloat(data.Messages);
      $scope.Displatches = parseFloat(data.Displatches);
      $scope.PageFaults = parseFloat(data.PageFaults);
      $scope.System = data.SystemName;
      $scope.SystemSerial = data.SystemSerial;
      $scope.FromTimestamp = data.UnixStartTime * 1000;
      $scope.StartTimeStr = data.StartTime;
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
    });
    res.error(function (data, status, headers, config) {
      $scope.showError = true;
      $scope.data = data || "Request failed";
      $scope.errorMsg += "Info :<br>Error " + status + ": <br/>" + JSON.stringify({data: data}) + "<br/>";
    });

  }

  //RETRIEVE PROCESS INFO
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
      ProgramFileName: $scope.ProgramFileName,
      StartTime: date / 1000
    };
    var res = $http.post(urlMainTab, dataInfo);
    res.success(function (result) {
      data = result;
      $scope.dataset = data;

    });
    res.error(function (data, status, headers, config) {
      $scope.showError = true;
      $scope.data = data || "Request failed";
      $scope.errorMsg += "Info Table :<br>Error " + status + ": <br/>" + JSON.stringify({data: data}) + "<br/>";
    });
  }

  //CREATE CHART
  function loadTrend(httpPath) {
    $scope.date = [];
    $scope.cpu = [];
    $scope.mem = [];
    var cpuInfo = {
      SystemName: $scope.System,
      SystemSerial: $scope.SystemSerial,
      CPUNum: $scope.CPUNum,
      ProcessName: $scope.ProcessName,
      Pin: $scope.Pin,
      ProgramFileName: $scope.ProgramFileName,
      StartTime: $scope.starttime / 1000
    };
    var chartTrend = $('#container').highcharts();
    chartTrend.showLoading("Loading...");

    //RETRIEVE TREND INFO
    var resT = $http.post(httpPath, cpuInfo);
    resT.success(function (result) {
      var data = result;
      var dataLength = data.length,
        i = 0;
      if (dataLength > 0) {
        var date = 0, prevDate = 0;
        for (i; i < dataLength; i += 1) {
          date = data[i].UnixFromTimestamp * 1000;
          $scope.date[i] = date;
          $scope.cpu.push([
            date, // the date
            data[i].CPUBusy // busy
          ]);

          $scope.mem.push([
            date, // the date
            data[i].MemUsed // mem used
          ]);
          prevDate = date;
        }

        chartTrend.addSeries({
          type: 'area',
          name: "CPU Busy",
          id: "cpu",
          data: $scope.cpu,
          yAxis: 0,
          gapSize: 5,
          events: {
            click: function (event) {
              this.chart.get('Tag').data[0].update({
                x: event.point.x
              });
              loadData(event.point.x);
            }

          },
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          threshold: null,
          tooltip: {
            valueDecimals: 2
          }
        });

         chartTrend.addSeries({
         type: 'line',
         name: "Memory (MB)",
         id: "mem",
         data: $scope.mem,
         yAxis: 1,
         gapSize: 5,
         events: {
         click: function (event) {
         this.chart.get('Tag').data[0].update({
         x: event.point.x
         });
         loadData(event.point.x);
         }

         },

         threshold: null,
         tooltip: {
         valueDecimals: 2
         }
         });

        chartTrend.addSeries({
          type: 'flags',
          id: "Tag",
          name: "Selected Interval",
          data: [{
            x: $scope.FromTimestamp,
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

        if (chartTrend.series.length > 0) {

          var xData = chartTrend.xAxis[0].series[0].xData;
          var actIndex = xData.indexOf($scope.FromTimestamp);
          $scope.firstIntv = false;
          $scope.lastIntv = false;
          if (actIndex == 0) {
            $scope.firstIntv = true;
          }
          if (actIndex == xData.length - 1) {
            $scope.lastIntv = true;
          }
        }
      }
      chartTrend.hideLoading();

    });
    resT.error(function (data, status, headers, config) {
      $scope.showError = true;
      $scope.data = data || "Request failed";
      $scope.errorMsg += "Trend :<br>Error  " + status + ": <br>" + JSON.stringify({data: data}) + "<br/>";
    });
  }

 //CREATE IFRAME TO DOWNLOAD EXCEL FILE
  $scope.downloadFile = function () {
    var url = "https://www.remoteanalyst.com/NewBrowser/ProcessInfoExcel.aspx?systemSerial=" + $scope.SystemSerial + "&systemName=" + $scope.System + "&cpuNum=" + $scope.CPUNum + "&pin=" + $scope.Pin + "&tableName=" + $scope.TableName + "&interval=" + $scope.Interval + "&processName=" + $scope.ProcessName + "&startTime=" + $scope.StartTimeStr + "&stopTime=" + $scope.StopTimeStr + "&programFileName=" + $scope.ProgramFileName;
    $("body").append("<iframe src='" + url + "' style='display: none;' ></iframe>");

  }

  //INIT CHART, LOAD MAIN PROC INFO AND LOAD OVERALL TREND DATA
  $('#container').highcharts('StockChart', chartConfig);
  loadData($scope.starttime);
  loadTrend(urlTrend);
});

angular.module('main').controller('FileCtrl', function ($scope, $http, $filter, $location, ngProgress) {

//API PATH
  var urlMain = "http://54.200.152.58:8080/api/fileinfodata";
  var urlMainProc = "http://54.200.152.58:8080/api/FileProcessData";
  var urlTrend = "http://54.200.152.58:8080/api/FileTrendDataMultiDay";
  var urlTrendSingle = "http://54.200.152.58:8080/api/filetrenddata";

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
    var res = $http.post(urlMain, dataInfo);
    res.success(function (result) {
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
      loadTrend(urlTrendSingle, date);
    });
    res.error(function (data, status, headers, config) {
      $scope.showError = true;
      $scope.data = data || "Request failed";
      $scope.errorMsg += "Info :<br>Error " + status + ": <br/>" + JSON.stringify({data: data}) + "<br/>";
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
    var res = $http.post(urlMainProc, dataInfo);
    res.success(function (result) {
      var data = result;
      $scope.dataset = data;

    });
    res.error(function (data, status, headers, config) {
      $scope.showError = true;
      $scope.data = data || "Request failed";
      $scope.errorMsg += "Info Table :<br>Error " + status + ": <br/>" + JSON.stringify({data: data}) + "<br/>";
    });

  }

  //RETRIEVE TREND INFO AND CREATE CHART
  function loadTrend(httpPath, datez) {
    $scope.read = [];
    $scope.write = [];
    $scope.count = [];
    var j = 0;

    var chartTrend = $('#container').highcharts();
    chartTrend.showLoading();
    // var datesLength = $scope.AvailableDates.length;
//for(j;j<datesLength;j+=1) {
    var cpuInfo = {
      SystemName: $scope.System,
      SystemSerial: $scope.SystemSerial,
      CPUNum: $scope.CPUNum,
      ProcessName: $scope.ProcessName,
      Pin: $scope.Pin,
      FileName: $scope.FileName,
      StartTime: datez / 1000
    };
    var resT;
    //RETRIEVE TREND INFO
    resT = $http.post(httpPath, cpuInfo);
    resT.success(function (result) {
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
      //chartConfig.series=[];
      //chartConfig.xAxis[0].type='datetime';
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


//}
      //chartConfig.series = [];
      //$('#container').highcharts('StockChart', chartConfig);

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
    resT.error(function (data, status, headers, config) {
      $scope.showError = true;
      $scope.data = data || "Request failed";
      $scope.errorMsg += "Trend :<br>Error  " + status + ": <br>" + JSON.stringify({data: data}) + "<br/>";
    });


  }

//ENTRY POINT: Initialize chart and load data
  $('#container').highcharts('StockChart', chartConfig);
  loadData($scope.starttime);


});

angular.module('main').controller('pipeCtrl', ['$scope', '$http', function ($scope, $http) {

  var self = this;
}]);







