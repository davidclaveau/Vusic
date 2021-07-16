import React, { useEffect } from 'react';
import * as d3d from 'd3';
import * as HexbinPlot from 'd3-hexbin';
import { select } from 'd3';
import { Button } from 'react-bootstrap';
import useWindowDimensions from '../helpers/userWindowDimensions';
import './HexagonGraph.scss';

//manually combine d3-hexbin into d3
const d3 = {
  ...d3d,
  hexbin: HexbinPlot.hexbin
}
export default function HexagonGraph(props) {
  const { height, width } = useWindowDimensions();

  //generate random int which is used to show photoes in hexagons
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  // Added top artists to grab the images from the data
  const data = props.graphData.topArtists

  //future dynamic data update feature with useEffect
  useEffect(() => {
    select("#plot-area").selectAll("*").remove();

    //initilization
    const MapColumns = 20;
    const MapRows = 20;
    const hexRadius = 100;
    const hexbin = d3.hexbin();
    hexbin.radius = hexRadius;

    //Calculate the center positions of each hexagon
    const points = [];
    for (let i = 0; i < MapRows; i++) {
      for (let j = 0; j < MapColumns; j++) {
        let x = hexRadius * j * Math.sqrt(3);
        if (i % 2 === 1) x += (hexRadius * Math.sqrt(3)) / 2;
        let y = hexRadius * i * 1.5;
        points.push([x, y]);
      }
    };

    //Create SVG element
    const svg = d3
      .select("#plot-area")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "50 50 1500 1000")
      .classed("svg-content-responsive", true)
      .append("g");

    //add all photoes into the web page
    for (let i = 0; i < data.length; i++) {
      svg.append('svg:defs')
        .append("svg:pattern")
        .style("fill-opacity", 1)
        .attr("id", 'a'.repeat(i))
        .attr("width", 200)
        .attr("height", 200)
        .attr("x", -60)
        .attr("y", -50)
        .append("svg:image")
        .attr("xlink:href", data[i].images[2].url)
        .attr("width", 200)
        .attr("height", 200);
    };

    //Start drawing the hexagons
    svg.selectAll(".hexagons")
      .data(hexbin(points))
      .enter()
      .append("path")
      .attr("class", "hexagon")
      .attr("d", function (d) {
        return "m" + d.x + "," + d.y + hexbin.hexagon();
      })
      .attr("stroke", '#292929')
      .attr("stroke-width", "172px")
      .on("click", function () {
        window.location.href = "http://localhost:4000/login";
      })
      .on('mouseover', function (d) {
        d3.select(this)
          .transition()
          .duration(700)
          .style("cursor", "pointer")
          .style('stroke-opacity', 1)
          .style("stroke", `url(#${'a'.repeat(getRandomInt(data.length))}`);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .transition()
          .duration(3000)
          .style("stroke-opacity", 0);
      })
  });

  //create tag to show
  return (
    <>
      <div id="plot-area"></div>
      <div id="login-welcome">
        <img id="brand" src="/vusic_icon.png" alt="vusic-icon"></img>
        <Button
          variant="login-button"
          href="http://localhost:4000/login"
        >
          View it!
        </Button>
      </div>
    </>
  );
}
