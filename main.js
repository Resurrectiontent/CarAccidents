const defaultDate = '2018-04-15'
const defaultMonth = 4
const defaultRegion = 'all'
const defaultOpacity = 1
const hoverOpacity = .65
const hoverColor = '#7a7a7a'
const defaultStroke = 'gray'
const months = {
    '4': 'April',
    '5': 'May',
    '6': 'June',
    '7': 'July',
    '8': 'August',
    '9': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
}
const getMonth = (i) => months[i.toString()]

const url_ = 'https://raw.githubusercontent.com/Resurrectiontent/CarAccidents/master/'

const regionPoly = `${url_}static/Regions.csv`
// const accidentsMonth = `${url_}static/dtp2018_agg_month.csv`
const accidentsMonthJson = `${url_}static/dtp2018_agg_month.json`
// const accidents = `${url_}static/dtp2018_agg.csv`
const accidentsJson = `${url_}static/dtp2018_agg0.json`
// const name2id_data = `${url_}static/name2id.json`
// const id2name_data = `${url_}static/id2name.json`

let accidentsMonthData = undefined
let accidentsData = undefined
fetch(accidentsMonthJson)
    .then((response) => response.json())
    .then((json) => accidentsMonthData = json)
    .then((_) => drawMap(defaultMonth))
fetch(accidentsJson)
    .then((response) => response.json())
    .then((json) => accidentsData = json)
    .then((_) => drawHeatmap(defaultRegion))


const dat = 0
const datDescription = 'Amount of fatalities per month'
const maxScoreMonth = 490
const maxScores = [56, 14, 43, 97]
const allRegs = 'Russia total'
const mapTitleText = 'Per-month car accident fatalities map'
const heatmapTitleText = 'Per-day car accident fatalities heatmap'

let projection = d3.geoEquirectangular()
    .scale(500)
    .translate([100, 750])

d3.select('#cnt')
    .append('div')
    .attr('id', 'map_cnt')
    .style('width', '100%')

d3.select('#cnt')
    .append('hr')
    .style('width', '90%')

d3.select('#cnt')
    .append('div')
    .attr('id', 'heatmap_cnt')
    .style('width', '100%')

const tooltip = d3
    .select('#map_cnt')
    .append('div')
    .style('display', 'block')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', '#262626B2')
    .style('opacity', '0.95')
    .style('border', 'solid')
    .style('border-color', 'black')
    .style('padding', '15px')
    .attr('id', 'tooltip')

d3.select('#map_cnt')
    .append('h2')
    .attr('id', 'map_title')
    .text(mapTitleText)

const slider = d3
    .sliderHorizontal()
    .min(4)
    .max(12)
    .value(defaultMonth)
    .step(1)
    .ticks(9)
    .width(500)
    .displayFormat(getMonth)
    .tickFormat(getMonth)
    .on('onchange', (month) => drawMap(month))

d3.select("#map_cnt")
    .append("svg")
    .attr("width", 700)
    .attr("height", 80)
    .style('display', 'block')
    .style('margin', 'auto')
    .append("g")
    .style('transform', 'translate(100px, 30px)')
    .call(slider);

const svgMap = d3
    .select('#map_cnt')
    .append('svg')
    .attr('width', '100%')
    .attr('height', 400)
    .append('g')
    .attr('id', 'polygroup')
    .style('display', 'block')
    .style('margin', 'auto')

d3.select("#map_cnt")
    .append('g')
    .attr('id', 'legend')
    .append(() => Legend(
        d3.scaleSequential([0, maxScoreMonth], d3.interpolateReds), {
            width: 500,
            ticks: 10,
            title: datDescription,
        }))
    .style('display', 'block')
    .style('margin', 'auto')

const heatmapTitle = d3
    .select('#heatmap_cnt')
    .append('h2')
    .attr('id', 'heatmap_title')

const svgHeatmap = d3
    .select('#heatmap_cnt')
    .append('svg')
    .attr('width', '100%')
    .attr('height', 200)
    .append('g')
    .style('display', 'block')
    .style('margin', 'auto')


function onmouseover(d) {
    tooltip.style("visibility", "visible")
    const cls = this.className.animVal

    d3.selectAll(`.${cls}`)
        .style("fill", hoverColor)
}

function onmouseleave(d) {
    tooltip.style("visibility", "hidden")
    const cls = this.className.animVal

    d3.selectAll(`.${cls}`)
        .style("fill", this.getAttribute('fill'))
}

function onmousemove(d){
    const regName = this.getAttribute('reg-name')
    const score = this.getAttribute('fat')
    const month = getMonth(this.getAttribute('month'))

    tooltip
        .style("top", d.pageY + 10 + "px")
        .style("left", d.pageX + 10 + "px")
        .html(`${regName}<br/>${score} fatalities in ${month} 2018`)
}

function drawMap(month) {
    svgMap.selectAll('#polygroup').remove()
    d3.csv(regionPoly, function (data) {
        const id = data.ind
        const cls = `reg_${id}`
        const regName = data.reg_name
        const score = accidentsMonthData[month.toString()][regName]
        const relative = score / maxScoreMonth
        const fill = d3.interpolateReds(relative)
        const multipoly = JSON.parse(data.poly)

        for (const poly of multipoly) {
            svgMap
                .append('polygon')
                .attr('class', cls)
                .attr('fat', score)
                .attr('month', month)
                .attr('reg-name', regName)
                .style('fill', fill)
                .attr('fill', fill)
                .attr('points', poly.map(x => projection(x)))
        }

        svgMap.selectAll('polygon')
            .attr('stroke', defaultStroke)
            .attr('opacity', defaultOpacity)
            .on('mouseover', onmouseover)
            .on('mousemove', onmousemove)
            .on('mouseleave', onmouseleave)
            .on('click', drawHeatmap)
    });
}

function drawHeatmap(d) {
    const labelHeatmap = t => heatmapTitle.text(`${heatmapTitleText} - ${t}`)

    svgHeatmap.selectAll('g').remove()
    let data = undefined
    if (d === 'all' || d3.select('#heatmap_title').text().endsWith(this.getAttribute('reg-name'))) {
        data = accidentsData['all']
        labelHeatmap(allRegs)
    }
    else {
        const regName = this.getAttribute('reg-name')
        data = accidentsData[regName]
        labelHeatmap(regName)
    }

    const cellSize = 25
    const formatDay = d => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()]
    const countDay = d => d.getUTCDay()
    const timeWeek = d3.utcSunday
    const max = Object.entries(data).reduce((a, b) => a[1] > b[1] ? a : b)[1]
    d3.select('#heatmap_cnt')
        .append('g')

    for (const [key, _] of Object.entries(data).slice(0, 7)){
        const date = new Date(key)
        svgHeatmap
            .append('text')
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", timeWeek.count(d3.utcYear(date), date) * cellSize + 10 - cellSize)
            .attr("y", countDay(date) * cellSize + 0.5 - cellSize)
            .text(formatDay(date))
    }

    for (const [key, value] of Object.entries(data)){
        const date = new Date(key)
        const fill = d3.interpolateReds(value / max)
        svgHeatmap
            .append('rect')
            .attr("width", cellSize - 7)
            .attr("height", cellSize - 7)
            .attr("x", timeWeek.count(d3.utcYear(date), date) * cellSize + 10)
            .attr("y", (countDay(date) * cellSize + 0.5))
            .style('fill', fill)
    }

    d3.select('#heatmap_cnt').append('g')
        .attr('id', 'legend')
        .append(() => Legend(
            d3.scaleSequential([0, max], d3.interpolateReds), {
                width: 250,
                ticks: 5,
                title: datDescription,
            }))
        .style('display', 'block')
        .style('margin', 'auto')
}
