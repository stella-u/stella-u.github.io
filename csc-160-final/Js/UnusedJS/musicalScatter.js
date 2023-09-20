import * as d3 from "d3";

var createscatterMLabels = function (
  screen,
  margins,
  graph,
  target,
  title,
  xtitle,
  ytitle
) {
  var labels = d3.select(target).append("g").classed("labels", true);

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
    .classed("label", true)
    .attr("text-anchor", "middle")
    .attr("x", margins.left + graph.width / 2)
    .attr("y", screen.height - 10);

  labels
    .append("g")
    .attr("transform", "translate(20," + (margins.top + graph.height / 2) + ")")
    .append("text")
    .text(ytitle)
    .classed("label", true)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)");
};

var createscatterMAxes = function (
  screen,
  margins,
  graph,
  target,
  xScale,
  yScale
) {
  var xAxis = d3.axisBottom(xScale).ticks(5);
  var yAxis = d3.axisLeft(yScale).ticks(5);

  var axes = d3.select(target).append("g").classed("axes", true);
  var xGroup = axes
    .append("g")
    .attr(
      "transform",
      "translate(" + margins.left + "," + (margins.top + graph.height) + ")"
    )
    .call(xAxis)
    .classed("xaxis", true);

  axes
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
    .call(yAxis)
    .classed("yaxis", true);
};

var createscatterMPoints = function (target, data, xScale, yScale, xDiv, yDiv) {
  console.log("called");
  var circle = d3
    .select(target)
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle");

  circle
    .attr("cx", function (show) {
      return xScale(Number(show.totalPerformances) / xDiv);
    })
    .attr("cy", function (show) {
      return yScale(Number(show.money) / yDiv);
    })
    .attr("r", 5)
    .attr("opacity", ".4")
    .classed("Musical", true);
  //.style("fill", function (show) {
  //  return pointScale(show.type)
  //});

  //on and off fcns for tooltip//
  var onFcn = function (event, show) {
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
    var perfFormat = function (perf) {
      if (perf >= 1000)
        return ((perf / 1000) % 1000).toFixed(0) + "," + (perf % 1000);
      else return perf;
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
    tool
      .select("#showPerf")
      .text("Performances: " + perfFormat(show.totalPerformances));
    tool.select("#showMoney").text(moneyFormat(Number(show.money)));
  };
  var offFcn = function (event, show) {
    // circle.attr("opacity", ".4");
    d3.select("#tooltip").classed("", false).classed("hidden", true);
  };
  circle.on("mouseenter", onFcn).on("mouseleave", offFcn);
};

var initScatterMus = function (target, scatterMData) {
  var screen = { width: 900, height: 600 };

  //how much space will be on each side of the graph
  var margins = { top: 40, bottom: 70, left: 90, right: 40 };

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
  var moneyMaps = scatterMData.map(function (show) {
    if (Number(show.money) > 0) return Number(show.money) / moneyDivs;
  });
  var moneyscatterMScale = d3
    .scaleLinear()
    .domain([d3.min(moneyMaps), d3.max(moneyMaps)])
    .range([graph.height, 0]);
  //console.log(d3.min(moneyMaps), d3.max(moneyMaps));

  //performances scales//
  var perfDivs = 1000;
  var perfMaps = scatterMData.map(function (show) {
    if (Number(show.totalPerformances) > 0)
      return Number(show.totalPerformances) / perfDivs;
  });
  var perfscatterMScale = d3
    .scaleLinear()
    .range([0, graph.width])
    .domain([d3.min(perfMaps), d3.max(perfMaps)]);
  var weeksMaps = scatterMData.map(function (show) {
    return Number(show.counta);
  });
  var weekscatterMScale = d3
    .scaleLinear()
    .range([graph.height, 0])
    .domain([d3.min(weeksMaps), d3.max(weeksMaps)]);

  createscatterMAxes(
    screen,
    margins,
    graph,
    target,
    perfscatterMScale,
    moneyscatterMScale
  );
  createscatterMLabels(
    screen,
    margins,
    graph,
    target,
    "Scatter Plot",
    "Performances",
    "Money Made"
  );
  createscatterMPoints(
    ".graph",
    scatterMData,
    perfscatterMScale,
    moneyscatterMScale,
    perfDivs,
    moneyDivs
  );
};

//promise//
var musicalData = d3.csv("../Data/musicalData.csv");

var successscatterMFcn = function (Data) {
  console.log("Yuh", Data);
  initScatterMus("#edaScatterMus", Data);
};
var failscatterMFcn = function (badData) {
  console.log("Nuh", badData);
};
musicalData.then(successscatterMFcn, failscatterMFcn);
