import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import useWindowDimensions from '../helpers/userWindowDimensions';
import { select } from 'd3';

export default function BubblesGraph(props) {
  const { height, width } = useWindowDimensions();
  const [data, setData] = useState()
  const [domain, setDomain] = useState({min: 0, max: 150})

  // Generating random colors for stroke
  const random = () => {
    return (`rgb(${(Math.floor(Math.random() * 100) + 75)}, ${(Math.floor(Math.random()*100) + 155)}, ${(Math.floor(Math.random() * 100) + 75)})`);
  }

  useEffect(() => {
    // Initilization
    const graphData = (props.graphData.topArtists ? props.graphData.topArtists : props.graphData.topTracks)

    const arr = [];
    graphData.forEach((element) => {arr.push(element.numbers)})
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    setDomain({
      min: min,
      max: max
    })
    setData(graphData)
  }, [props.graphData.topArtists, props.graphData.topTracks])

  // Constructing the chart in the return
  const createChart = () => {
    // For setting the radius of bubbles
    let radiusScale = d3.scaleLinear().domain([0, 130]).range([0, 110])
    if (domain.max > 100) {
      console.log("hello")
      radiusScale = d3.scaleSqrt().domain([domain.min, domain.max]).range([0, 110]);
    }

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .classed("svg-content-responsive", true)
      .append("g")
      .attr("transform", "translate(0,0)");

    // Animation
    const simulation = d3.forceSimulation()
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("collide", d3.forceCollide((d) => {
        return radiusScale(d.numbers) + 3;
      }))
      .nodes(data)

    // Start drawing
    svg.append("defs")
      .selectAll(".artist-pattern")
      .data(data)
      .enter()
      .append("pattern")
      .attr("class", "artist-pattern")
      .attr("id", function (data) {
        return data.id
      })
      .attr("height", '100%')
      .attr("width", '100%')
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("height", 1)
      .attr("width", 1)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", function (data) { return data.images[0].url })

    // Bubble graph circles
    const circles = svg.selectAll(".artist")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "artist")
      .style("stroke", random())
      .attr("stroke-width", "3px")
      .style("cursor", "pointer")
      .attr("id", (data) => {
        return data.id
      })
      .on("click", function (event, d) {
        props.onClick(
          d.id,
          d.name,
          d.images,
          d.external_urls
          );
        })
        .attr("r", (data) => {
        return radiusScale(data.numbers)
      })
      .attr("fill", function (data) {
        return `url(#${data.id})`;
      })
      .on("mouseover", function(e, d){
        select(this)
          .attr("stroke-width", "5px")
          .style("stroke", "#fff");
        })
      .on("mouseout", function(e, d){
        select(this)
        .attr("stroke-width", "3px")
        .style("stroke", random());
      })


    // Move circle into position
    const ticked = () => {
      circles
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    };

    // Animation start
    simulation
      .nodes(data)
      .on('tick', ticked);
  }

  return (
    <div>
      <div id="chart">
        {data && domain && createChart()}
      </div>
    </div>
  );
};
