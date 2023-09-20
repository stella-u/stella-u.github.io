import * as d3 from "d3";
//LABELS//
var createscatterLabels = function (
  screen,
  margins,
  graph,
  target,
  title,
  xtitle,
  ytitle,
  className
) {
  var labels = d3.select(target).append("g").classed("labelsPS", true);

  labels
    .append("text")
    .text(title)
    .classed("title" + className, true)
    .attr("text-anchor", "middle")
    .attr("x", margins.left + graph.width / 2)
    .attr("y", margins.top / 2);

  labels
    .append("text")
    .text(xtitle)
    .classed(className, true)
    .attr("text-anchor", "middle")
    .attr("x", margins.left + graph.width / 2)
    .attr("y", screen.height - 10);

  labels
    .append("g")
    .attr("transform", "translate(20," + (margins.top + graph.height / 2) + ")")
    .append("text")
    .text(ytitle)
    .classed(className, true)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)");
};

//AXES//
var createscatterAxes = function (
  screen,
  margins,
  graph,
  target,
  xScale,
  yScale,
  className
) {
  var xAxis = d3.axisBottom(xScale).ticks(5);
  var yAxis = d3.axisLeft(yScale).ticks(5);

  var axes = d3.select(target).append("g").classed(className, true);
  var xGroup = axes
    .append("g")
    .attr(
      "transform",
      "translate(" + margins.left + "," + (margins.top + graph.height) + ")"
    )
    .call(xAxis)
    .classed(className + "-x", true);

  axes
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
    .call(yAxis)
    .classed(className + "-y", true);
};

var createscatterPoints = function (
  target,
  data,
  xScale,
  yScale,
  xDiv,
  yDiv,
  worp
) {
  var circle = d3
    .select(target)
    .select(".graph")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle");
  if (worp === "perf") {
    circle
      .attr("cx", function (show) {
        return xScale(Number(show.totalPerformances) / xDiv);
      })
      .attr("cy", function (show) {
        return yScale(Number(show.money) / yDiv);
      });
  } else {
    circle
      .attr("cx", function (show) {
        return xScale(Number(show.counta) / xDiv);
      })
      .attr("cy", function (show) {
        return yScale(Number(show.money) / yDiv);
      });
  }
  var theatreClass = function (show) {
    return show.Theatre.replaceAll(" ", "_")
      .replaceAll("'", "")
      .replaceAll("(", "")
      .replaceAll(")", "");
  };
  circle.attr("r", 5).attr("opacity", ".4").attr("class", theatreClass);

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
    var numFormat = function (num) {
      if (num >= 1000)
        return ((num / 1000) % 1000).toFixed(0) + "," + (num % 1000);
      else return num;
    };
    //
    //trial class by theatre//

    //
    //
    //highlight circle//

    if (
      this.getAttribute("class") === "Musical" ||
      this.getAttribute("class") === "Play" ||
      this.getAttribute("class") === "Special"
    ) {
      d3.select(this).attr("opacity", "1");
    } else {
      d3.select(this).attr("opacity", "1").attr("fill", "yellow");
      d3.selectAll("." + this.getAttribute("class"))
        .attr("fill", "yellow")
        .attr("opacity", "1");
    }
    //tooltip//
    var xPos = event.pageX + 10;
    var yPos = event.pageY;
    /* if (worp === "perf") {
      var xLine = d3
        .select(".graph")
        .select("PXline")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", yPos)
        .attr("y2", 0);
      var yLine = d3
        .select(".graph")
        .append("PYline")
        .attr("x1", xPos)
        .attr("x2", 0)
        .attr("y1", yPos)
        .attr("y2", yPos);
    } else {
    }*/
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
      .text("Performances: " + numFormat(show.totalPerformances));
    tool.select("#showMoney").text(moneyFormat(Number(show.money)));
  };
  var offFcn = function (event, show) {
    if (
      this.getAttribute("class") === "Musical" ||
      this.getAttribute("class") === "Play" ||
      this.getAttribute("class") === "Special"
    ) {
      d3.select(this).attr("opacity", ".4");
    } else {
      d3.select(this).attr("opacity", ".4").attr("fill", "black");
      d3.selectAll("." + this.getAttribute("class"))
        .attr("fill", "black")
        .attr("opacity", ".4");
    }

    d3.select("#tooltip").classed("", false).classed("hidden", true);
  };
  circle.on("mouseenter", onFcn).on("mouseleave", offFcn);

  //color-code//
  var onClickColor = function () {
    d3.select("#key").classed("hidden", false);
    var perfCircles = d3
      .select("#scatterPerf")
      .select(".graph")
      .selectAll("circle")
      .attr("class", function (show) {
        return show.type;
      });
    var weekCircles = d3
      .select("#scatterWeek")
      .select(".graph")
      .selectAll("circle")
      .attr("class", function (show) {
        return show.type;
      });
  };

  d3.select("#colorButton").on("click", onClickColor);

  var onClickCircle = function (event) {
    console.log(this.getAttribute("class"));
    if (this.getAttribute("class") === "Musical") {
      d3.selectAll(".Musical").attr("opacity", "1");
      d3.selectAll(".Play").attr("opacity", ".1");
      d3.selectAll(".Special").attr("opacity", ".1");
    } else if (this.getAttribute("class") === "Play") {
      d3.selectAll(".Play").attr("opacity", "1");
      d3.selectAll(".Musical").attr("opacity", ".1");
      d3.selectAll(".Special").attr("opacity", ".1");
    } else {
      d3.selectAll(".Special").attr("opacity", "1");
      d3.selectAll(".Musical").attr("opacity", ".1");
      d3.selectAll(".Play").attr("opacity", ".1");
    }
  };
  var offClickCircle = function () {
    d3.selectAll("circle").attr("opacity", ".4");
  };
  circle.on("click", onClickCircle);
  d3.select("#resetButton").on("click", offClickCircle);
};

var initWScatter = function (target, scatterData) {
  var screen = { width: 500, height: 400 };

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
  var weekDiv = 1;
  var weeksMaps = scatterData.map(function (show) {
    return Number(show.counta);
  });
  var weekscatterScale = d3
    .scaleLog()
    .range([0, graph.width])
    .domain([d3.min(weeksMaps), d3.max(weeksMaps)]);

  createscatterAxes(
    screen,
    margins,
    graph,
    target,
    weekscatterScale,
    moneyscatterScale,
    "WSaxes"
  );
  createscatterLabels(
    screen,
    margins,
    graph,
    target,
    "Scatter Plot",
    "# of Weeks",
    "Money Made",
    "WSlabel"
  );
  createscatterPoints(
    target,
    scatterData,
    weekscatterScale,
    moneyscatterScale,
    weekDiv,
    moneyDivs,
    "week"
  );
};
var initScatter = function (target, scatterData) {
  var screen = { width: 500, height: 400 };

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
  var perfDivs = 1000;
  var perfMaps = scatterData.map(function (show) {
    if (Number(show.totalPerformances) > 0)
      return Number(show.totalPerformances) / perfDivs;
  });
  var perfscatterScale = d3
    .scaleLog()
    .range([0, graph.width])
    .domain([d3.min(perfMaps), d3.max(perfMaps)]);

  createscatterAxes(
    screen,
    margins,
    graph,
    target,
    perfscatterScale,
    moneyscatterScale,
    "PSaxes"
  );
  createscatterLabels(
    screen,
    margins,
    graph,
    target,
    "Scatter Plot",
    "Performances",
    "Money Made",
    "PSlabel"
  );
  createscatterPoints(
    target,
    scatterData,
    perfscatterScale,
    moneyscatterScale,
    perfDivs,
    moneyDivs,
    "perf"
  );
};

//promise//

var perfweek = d3.csv("../Data/finalData.csv");

var successscatterFcn = function (Data) {
  console.log("Yuh", Data);
  initScatter("#scatterPerf", Data);
  initWScatter("#scatterWeek", Data);
};
var failscatterFcn = function (badData) {
  console.log("Nuh", badData);
};
perfweek.then(successscatterFcn, failscatterFcn);
