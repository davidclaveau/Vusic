import React, { useState, useEffect, useCallback } from "react";
import * as d3 from 'd3';
import useWindowDimensions from '../helpers/userWindowDimensions'

import "./HeatMap.scss";
import { select } from "d3";

export default function HeatMap(props) {
  const { height, width } = useWindowDimensions();
  const [info, setInfo] = useState([null])
  const [data, setData] = useState({
    base: 0,
    albumCount: [
      {
        albums: []
      }
    ]
  })

  let xScale;
  let yScale;

  let minYear;
  let maxYear;

  let padding = width / 10;

  let graphWidth = width / 1.3
  let graphHeight = height / 1.3

  let cellInfo = d3.select("#cell-info")
  let albums = d3.select("#albums")

  let canvas = d3.select('#canvas')
  canvas.attr('width', graphWidth)
  canvas.attr('height', graphHeight)

  const defs = canvas.append("defs")

  useEffect(() => {
    // Combine all artists from the two queries
    const allArtists = [...props.dataGraphFirst.topTrackOffset, ...props.dataGraphSecond.topTrackOffset]


    // Create an array of the year and month of each release data
    const albumYearMonth = [];
    const fullInfo = [];
    allArtists.forEach((artist) => {
      const obj = {}
      albumYearMonth.push(artist.album.release_date.slice(0, 7))
      obj.date = (artist.album.release_date.slice(0, 7))
      obj.artist = (artist.artists[0].name)
      obj.track = (artist.name)
      obj.image = (artist.album.images[0].url)
      fullInfo.push(obj)
    })

    // From the release dates, find the count of each
    // eg. number of times 1982-02 appears
    // create an object of the year/month and the count
    const countOccurrences = arr => arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
    const eachOccurence = countOccurrences(albumYearMonth)


    // Data format for graph
    // Base is number of albums for that year/month
    // And array of each year/month in the
    const dateData = {
      base: 0,
      albumCount: [
        // {
          // year:
          // month:
          // count:
          // albums: [
            // {
              // date:
              // artist:
              // image:
              // track:
            // }
          // ]
        // }
      ]
    }

    // For each item in the object, create an object of
    // the year, month, and count to push into albumCount
    // Some albums don't have release months, so choose 1
    for (const album in eachOccurence) {
      const objCount = {};
      objCount.year = Number(album.slice(0, 4))
      objCount.month = Number("" === album.slice(5, 7) ? 1 : album.slice(5, 7))
      objCount.count = Number(eachOccurence[album])

      // Find which dates correspond to which artist's album
      const albumsArr = [];
      for (const item of fullInfo) {
        if (album.slice(0, 7) === item.date) {
          albumsArr.push(item)
        }
      }
      objCount.albums = albumsArr
      dateData.albumCount.push(objCount)
    }


    setInfo(fullInfo)
    setData(dateData)
  }, [props.dataGraphFirst, props.dataGraphSecond])

  const appendDefs = () => {
    defs.selectAll(".artist-pattern")
      .data(info)
      .enter().append("pattern")
      .attr("class", "artist-pattern")
      .attr("id", (item) => {
        return item.track.toLowerCase().replace(/ /g, "-").replace(/'/g, "-").replace(/"/g, "-").replace(/,/g, "-").replace(/./g, "-").replace(/&/g, "-").replace(/"/g, "-")
      })
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("height", 1)
      .attr("width", 1)
      .attr("preserveAspectRatio", "none")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attr("xlink:href", function (d) {
        return d.image
      })
  }

  const createChart = () => {
    // Add defs to reference images
    appendDefs()

    // Find the minimum year in our data
    minYear = d3.min(data.albumCount, (item) => {
      return item['year']
    })

    // Find the maximum year in our data
    maxYear = d3.max(data.albumCount, (item) => {
      return item['year']
    })

    // Setting scales for the graph ----------------
    // x-axis scale
    xScale = d3.scaleLinear()
              .domain([minYear, maxYear + 1])
              .range([padding, graphWidth - padding])

    // y-axis scale
    yScale = d3.scaleTime()
              .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
              .range([padding, graphHeight - padding])

    // Creating the cells in the graph ----------------
    // Each rectangle generated by data
    canvas
      .selectAll('rect')
      .data(data.albumCount)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('stroke', '#000')
      .attr('stroke-width', '1px')
      .attr('fill', (item) => {
        const albumCount = item['count']
        if (albumCount === 0) {
          // return '#D6F2C1'
        } else if (albumCount === 1) {
          return '#CBF4AD'
        } else if (albumCount === 2) {
          return '#B3F783'
        } else if (albumCount === 3) {
          return '#95F952'
        } else if (albumCount === 4) {
          return '#66FC02'
        } else if (albumCount === 5) {
          return '#53EA02'
        } else if (albumCount === 6) {
          return '#45CC02'
        } else if (albumCount === 7) {
          return '#39A801'
        } else if (albumCount > 8) {
          return '#306B00'
        }
      })
      .attr('data-year', (item) => {
        return item['year']
      })
      .attr('data-month', (item) => {
        return item['month'] - 1
      })
      .attr('data', (item) => {
        return item['albumCount']
      })
      .attr('height', `${(graphHeight - (padding * 2)) / 12}`)
      .attr('y', (item) => {
        return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0 ))
      })
      .attr('width', (item) => {
        let numberOfYears = maxYear - minYear
        return (graphWidth - (padding * 2)) / numberOfYears
      })
      .attr('x', (item) => {
        return xScale(item['year'])
      })
      .on("click", function (event, item, index) {
        // Remove any previous info divs and styling
        cellInfo.transition()
                .style("visibility", "hidden")
        albums.transition()
              .style("visibility", "hidden")
        albums.selectAll('div')
              .remove()

        // Reset all cells to black borders
        canvas.selectAll('rect')
              .attr("stroke", "black")
              .attr("stroke-width", "1px")

        // Highlight this specific cell
        select(this).attr("stroke", "white")
                    .attr("stroke-width", "2px")

        cellInfo.transition()
                .style("visibility", "visible")
        albums.transition()
                .style("visibility", "visible")

        const months = {
          1: "January",
          2: "February",
          3: "March",
          4: "April",
          5: "May",
          6: "June",
          7: "July",
          8: "August",
          9: "September",
          10: "October",
          11: "November",
          12: "December"
        }


        cellInfo.text(`${months[item['month']]} ${item['year']}: ${item['count']} Track${item['count'] === 1 ? "" : 's' }`)
        cellInfo.attr('data-year', item['year'])

        albums.selectAll('div')
              .data(item.albums)
              .enter()
              .append('div')
              .attr('class', 'album')
              .text((item) => {
                return (`"${item['track']}" by ${item['artist']}`)
              })

              // Somehow this should work to show album art
              // stores in the defs. Currently, fill doesn't do anything

              // .append('span')
              // .attr("fill", (item) => {
              //   return `url(#${item.track.toLowerCase().replace(/ /g, "-").replace(/'/g, "-").replace(/"/g, "-").replace(/,/g, "-").replace(/&/g, "-").replace(/"/g, "-")}`;
              // })
      })

    // Creating the axes in the graph ----------------
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'))

    let yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat('%b'))

    canvas.append('g')
          .call(xAxis)
          .attr('id', 'x-axis')
          .attr('transform', `translate(0, ${graphHeight - padding})`)
          .attr("stroke-width", "2px")

    canvas.append('g')
          .call(yAxis)
          .attr('id', 'y-axis')
          .attr('transform', `translate(${padding}, 0)`)
          .attr("stroke-width", "2px")
  }

  return (
    <div id="main">

      {data && createChart()}
      <svg id="canvas"></svg>
      <div id="info">
        <div id="cell-info"></div>
        <div id="albums"></div>
      </div>
    </div>
  );
}
