import * as d3 from "d3";

var createbarLabels = function (
  screen,
  margins,
  graph,
  target,
  title,
  xtitle,
  ytitle
) {
  var labels = d3.select(target).append("g").classed("labelsBar", true);

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
    .classed("labelBar", true)
    .attr("text-anchor", "middle")
    .attr("x", margins.left + graph.width / 2)
    .attr("y", screen.height - 10);

  labels
    .append("g")
    .attr("transform", "translate(20," + (margins.top + graph.height / 2) + ")")
    .append("text")
    .text(ytitle)
    .classed("labelBar", true)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)");
};

var createbarAxes = function (screen, margins, graph, target, xScale, yScale) {
  var xAxis = d3.axisBottom(xScale).tickPadding(5);
  var yAxis = d3.axisLeft(yScale);

  var axes = d3.select(target).append("g").classed("axesBar", true);
  var xGroup = axes
    .append("g")
    .attr(
      "transform",
      "translate(" + margins.left + "," + (margins.top + graph.height) + ")"
    )
    .call(xAxis)
    .classed("xaxisBar", true);

  axes
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
    .call(yAxis)
    .classed("yaxisBar", true);

  d3.select(".xaxisBar").selectAll(".tick").remove();
};

var drawbarChart = function (target, data, margin, graph, xScale, yScale) {
  var rect = d3
    .select(target)
    .select(".graph")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (place) {
      return xScale(place.theatre);
    })
    .attr("y", function (place) {
      return yScale(place.potential);
    })
    .attr("height", function (place) {
      return graph.height - yScale(place.potential);
    })
    .attr("width", function (range) {
      return xScale.bandwidth();
    })
    .attr("id", function (place) {
      return place.theatre
        .replaceAll(" ", "_")
        .replaceAll("'", "")
        .replaceAll("(", "")
        .replaceAll(")", "");
    })
    .attr("fill", "#509dce");

  var nameBarOn = function (event, place) {
    var xPos = event.pageX + 10;
    var yPos = event.pageY;
    var box = d3.select("#banner").select("#theatreName").text(place.theatre);

    d3.select(this).attr("fill", "yellow");
    d3.selectAll("." + this.getAttribute("id"))
      .attr("fill", "yellow")
      .attr("opacity", "1");
  };

  var nameBarOff = function (event, show) {
    d3.select(this).attr("fill", "#509dce");
    d3.selectAll("." + this.getAttribute("id"))
      .attr("fill", "black")
      .attr("opacity", ".4");
    d3.select("#nameBox").classed("", false).classed("hidden", true);
  };
  rect.on("mouseenter", nameBarOn).on("mouseleave", nameBarOff);
};

var initBar = function (target, Data) {
  var screen = { width: 1000, height: 500 };

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
  var theatreMap = Data.map(function (place) {
    return place.theatre;
  });
  var theatrebarScale = d3
    .scaleBand()
    .domain(theatreMap)
    .range([0, graph.width]);

  var potentialbarScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([graph.height, 0]);

  //call functions//
  createbarAxes(
    screen,
    margins,
    graph,
    target,
    theatrebarScale,
    potentialbarScale
  );
  createbarLabels(
    screen,
    margins,
    graph,
    target,
    "Bar Graph",
    "Theatres",
    "%GP"
  );
  drawbarChart(
    target,
    Data,
    margins,
    graph,
    theatrebarScale,
    potentialbarScale
  );
};

//promise//
var barData = d3.csv("../Data/theatreData.csv");

var successFcn = function (data) {
  console.log("Affirmative Cap'n", data);

  initBar("#barChart", data);
};
var failFcn = function (badData) {
  console.log("nope", badData);
};
barData.then(successFcn, failFcn);
