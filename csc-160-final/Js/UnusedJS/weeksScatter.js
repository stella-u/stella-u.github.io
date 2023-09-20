import * as d3 from "d3";

var createWSLabels = function (
  screen,
  margins,
  graph,
  target,
  title,
  xtitle,
  ytitle
) {
  var labels = d3.select(target).append("g").classed("labelsWS", true);

  labels
    .append("text")
    .text(title)
    .classed("title", true)
    .attr("text-anchor", "middle")
    .attr("x", margins.left + graph.width / 2)
    .attr("y", margins.top / 2);

  labels
    .append("text")
    .text(xtitle)
    .classed("labelWS", true)
    .attr("text-anchor", "middle")
    .attr("x", margins.left + graph.width / 2)
    .attr("y", screen.height - 10);

  labels
    .append("g")
    .attr("transform", "translate(20," + (margins.top + graph.height / 2) + ")")
    .append("text")
    .text(ytitle)
    .classed("labelWS", true)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)");
};

var createWSAxes = function (screen, margins, graph, target, xScale, yScale) {
  var xAxis = d3.axisBottom(xScale).ticks(5);
  var yAxis = d3.axisLeft(yScale).ticks(5);

  var axes = d3.select(target).append("g").classed("axesWS", true);
  var xGroup = axes
    .append("g")
    .attr(
      "transform",
      "translate(" + margins.left + "," + (margins.top + graph.height) + ")"
    )
    .call(xAxis)
    .classed("xaxisWS", true);

  axes
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
    .call(yAxis)
    .classed("yaxisWS", true);
};

var createWSPoints = function (target, data, xScale, yScale, xDiv, yDiv) {
  console.log("called");
  var circle = d3
    .select(target)
    .select(".graph")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle");

  circle
    .attr("cx", function (show) {
      return xScale(Number(show.counta) / xDiv);
    })
    .attr("cy", function (show) {
      return yScale(Number(show.money) / yDiv);
    })
    .attr("r", 5)
    .attr("opacity", ".4");
  //.style("fill", function (show) {
  //  return pointScale(show.type)
  //});

  //on and off fcns for tooltip//
  var onWSFcn = function (event, show) {
    var moneyFormat = function (money) {
      var bill = (money / 1000000000) % 1000000000;
      var mill = (money / 1000000) % 1000000;
      var thous = (money / 1000) % 1000;
      var hund = money % 1000;
      if (bill.toFixed(0) > 0)
        return (
          "$" +
          bill.toFixed(0) +
          "," +
          mill.toFixed(0) +
          "," +
          thous.toFixed(0) +
          "," +
          hund.toFixed(0)
        );
      else if (mill.toFixed(0) > 0 && bill.toFixed(0) <= 0)
        return (
          "$" + mill.toFixed(0) + "," + thous.toFixed(0) + "," + hund.toFixed(0)
        );
      else return "$" + thous.toFixed(0) + "," + hund.toFixed(0);
    };
    var perfFormat = function (weeks) {
      if (weeks >= 1000)
        return ((weeks / 1000) % 1000).toFixed(0) + "," + (weeks % 1000);
      else return weeks;
    };
    // circle.attr("opacity", "1");
    var xPos = event.pageX + 10;
    var yPos = event.pageY;
    var tool = d3.select("#tooltip");
    tool
      .classed("hidden", false)
      .classed("", true)
      .style("top", yPos + "px")
      .style("left", xPos + "px");
    tool.select("#showName").text(show.name);
    tool.select("#showType").text(show.type);
    tool.select("#showPerf").text("Weeks: " + perfFormat(show.counta));
    tool.select("#showMoney").text(moneyFormat(Number(show.money)));
  };
  var offWSFcn = function (event, show) {
    // circle.attr("opacity", ".4");
    d3.select("#tooltip").classed("", false).classed("hidden", true);
  };
  circle.on("mouseenter", onWSFcn).on("mouseleave", offWSFcn);

  //color-code//
  var onWSClick = function () {
    circle.attr("class", function (show) {
      return show.type;
    });
    // d3.select("#key").classed("hidden", false);
  };
  d3.select("#colorButton").on("click", onWSClick);
};

var initWScatter = function (target, scatterData) {
  var screen = { width: 500, height: 500 };

  //how much space will be on each side of the graph
  var margins = { top: 40, bottom: 70, left: 100, right: 40 };

  //generated how much space the graph will take up
  var graph = {
    width: screen.width - margins.left - margins.right,
    height: screen.height - margins.top - margins.bottom
  };

  //set the screen size
  d3.select(target).attr("width", screen.width).attr("height", screen.height);

  //create a group for the graph
  var g = d3
    .select(target)
    .append("g")
    .classed("graph", true)
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  //scales//
  var moneyDivs = 1000000;
  var moneyMaps = scatterData.map(function (show) {
    if (Number(show.money) > 0) return Number(show.money) / moneyDivs;
  });
  var moneyscatterScale = d3
    .scaleLog()
    .domain([d3.min(moneyMaps), d3.max(moneyMaps)])
    .range([graph.height, 0]);
  //console.log(d3.min(moneyMaps), d3.max(moneyMaps));

  //performances scales//
  var perfDivs = 1;
  var perfMaps = scatterData.map(function (show) {
    if (Number(show.totalPerformances) > 0)
      return Number(show.totalPerformances) / perfDivs;
  });
  var perfscatterScale = d3
    .scaleLog()
    .range([0, graph.width])
    .domain([d3.min(perfMaps), d3.max(perfMaps)]);
  var weeksMaps = scatterData.map(function (show) {
    return Number(show.counta);
  });
  var weekscatterScale = d3
    .scaleLog()
    .range([0, graph.width])
    .domain([d3.min(weeksMaps), d3.max(weeksMaps)]);

  createWSAxes(
    screen,
    margins,
    graph,
    target,
    weekscatterScale,
    moneyscatterScale
  );
  createWSLabels(
    screen,
    margins,
    graph,
    target,
    "Scatter Plot",
    "# of Weeks",
    "Money Made"
  );
  createWSPoints(
    target,
    scatterData,
    weekscatterScale,
    moneyscatterScale,
    perfDivs,
    moneyDivs
  );
};

//promise//
var totalWSData = d3.csv("../Data/totalData.csv");

var successWSFcn = function (Data) {
  console.log("Yuh", Data);
  initWScatter("#scatterWeek", Data);
};
var failWSFcn = function (badData) {
  console.log("Nuh", badData);
};
totalWSData.then(successWSFcn, failWSFcn);
