const {
  select,
  json,
  scaleLinear,
  axisBottom,
  extent,
  min,
  max,
  format,
  scaleTime,
  timeFormat,
  axisLeft,
  scaleOrdinal,
  schemeSet1,
} = d3;

const svg = select("svg").attr("width", innerWidth).attr("height", innerHeight);

//
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 100, bottom: 20, left: 150, right: 20 };

const chartHeight = height - margin.top - margin.bottom;
const chartWidth = width - margin.left - margin.right;

// _________________
const chartMaker = (data) => {
  // console.log(data);
  //scale and Axis

  const chart = svg.append("g");

  svg
    .append("text")
    .attr("id", "title")
    .text("Doping in Professional Bicycling")
    .attr("y", margin.top - 15)
    .attr("x", chartWidth / 2);

  /*learnt about timeParse. Because 1994 was being interpreted as miliseconds 
  resulting in weird results.Cool! Not used though.
   format has multiple methods to remove that comma. 
  thanks to http://bl.ocks.org/zanarmstrong/raw/05c1e95bf7aa16c4768e/?raw=true for 
  nice format specifier tool. 
*/
  const xScale = scaleLinear()
    .domain([min(data, (d) => d["Year"] - 1), max(data, (d) => d["Year"] + 2)])
    .range([margin.left, chartWidth]);
  // console.log(xScale.domain());

  const xAxisG = chart
    .append("g")
    .call(
      axisBottom(xScale)
        .tickFormat(format(""))
        .tickSize(-chartHeight + 100)
        .tickPadding(10)
    )
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${chartHeight})`);
  //

  const yScale = scaleTime()
    .domain(extent(data, (d) => d.Time))
    .range([margin.top, chartHeight])
    .nice();

  const yAxisG = chart
    .append("g")
    .call(
      axisLeft(yScale)
        .tickFormat(timeFormat("%M:%S"))
        .tickSize(-chartWidth + 150)
        .tickPadding(10)
    )
    .attr("id", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`);

  yAxisG
    .append("text")
    .attr("fill", "black")
    .text("Time (MM:SS)")
    .attr("class", "axis-label")
    .attr("x", -chartHeight / 2)
    .attr("y", -70)
    .attr("transform", `rotate(-90)`);

  //   // Tooltip
  const tooltip = select("body").append("div").attr("id", "tooltip");

  const colorScale = scaleOrdinal()
    .domain([false, true])
    .range(["green", "red"]);

  chart
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d["Time"]))
    .attr("r", 10)
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time)
    /*
  So, if you have specified fill of an element in CSS, you can only use 
  .style() to override it. .attr() doesn't work in that case. 
  but if you comment out that in CSS and use attr() to set color, it will
   work. Cool !!
  */
    .style("fill", (d) => colorScale(d["Doping"] !== ""))
    // .style("fill", (d) => {
    //   return d["Doping"] ? "red" : "green";
    // })

    .on("mouseover", (e, d) => {
      //      {

      tooltip
        .attr("data-year", d["Year"])
        .html(
          `<p>${d["Name"]},${d["Nationality"]}</p><p>Year : ${
            d["Year"]
          }, Time : ${timeFormat("%M:%S")(d["Time"])}</p>
          </br> <p> ${d["Doping"]}</p>`
        )
        //style
        .style("left", e.clientX + 20 + "px")
        .style("top", e.clientY - 40 + "px");

      return tooltip.style("opacity", 0.9);
    })
    .on("mouseout", (e, d) => {
      return tooltip.style("opacity", 0);
    });
  ///legend
  let legendContainer = chart.append("g").attr("id", "legend");

  var legend = legendContainer
    .selectAll(".legend")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + (margin.top + i * 40 + 40) + ")";
    });

  legend
    .append("circle")
    .attr("cx", chartWidth - 30)
    .attr("cy", (d, i) => i)
    .attr("r", 15)
    // .attr("height", 18)
    .style("fill", colorScale);

  legend
    .append("text")
    .attr("x", chartWidth - 60)
    .attr("y", (d, i) => i + 8)
    .style("text-anchor", "end")
    .text(function (d) {
      if (d) {
        return "Riders with doping allegations";
      } else {
        return "No doping allegation";
      }
    });
};

//////fetch data && process
await json("data.json").then((data) => {
  data.forEach((d) => {
    let parsedTime = d.Time.split(":");
    d.Time = new Date(2021, 6, 3, 0, parsedTime[0], parsedTime[1]);
    // d["Doping"] = d["Doping"] === "" ? 0 : 1;
  });

  chartMaker(data);
});
