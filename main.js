const maxScoreMonth = 490
const defaultMonth = 4
const defaultRegion = 'all'
const defaultOpacity = 1
const hoverColor = '#7a7a7a'
const hoverColorHeatmap = '#000'
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
const accidentsMonthJson = `${url_}static/dtp2018_agg_month.json`
const accidentsJson = `${url_}static/dtp2018_agg0.json`

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


const datDescription = 'Amount of fatalities per month'
const hmDescription = 'Amount of fatalities per month'
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

d3.select('#map_cnt')
    .append('svg')
    .attr('width', 700)
    .attr('height', 80)
    .style('display', 'block')
    .style('margin', 'auto')
    .append('g')
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

d3.select('#map_cnt')
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


function onmouseover(_) {
    tooltip.style('visibility', 'visible')
    const cls = this.className.animVal

    d3.selectAll(`.${cls}`)
        .transition()
        .duration(500)
        .style('fill', hoverColor)
}

function onmouseleave(_) {
    tooltip.style('visibility', 'hidden')
    const cls = this.className.animVal

    d3.selectAll(`.${cls}`)
        .transition()
        .duration(500)
        .style('fill', this.getAttribute('fill'))
}

function onmousemove(d){
    const regName = this.getAttribute('reg-name')
    const score = this.getAttribute('fat')
    const month = getMonth(this.getAttribute('month'))

    tooltip
        .style('top', d.pageY + 10 + 'px')
        .style('left', d.pageX + 10 + 'px')
        .html(`${regName}<br/>${score} fatalities in ${month} 2018`)
}


function onmouseover_rect(_) {
    tooltip.style('visibility', 'visible')

    d3.select(this)

        .transition()
        .duration(500)
        .style('fill', hoverColorHeatmap)
}

function onmouseleave_rect(_) {
    tooltip.style('visibility', 'hidden')

    d3.select(this)
        .transition()
        .duration(500)
        .style('fill', this.getAttribute('fill'))
}

function onmousemove_rect(d){
    const date = this.getAttribute('date')
    const score = this.getAttribute('fat')
    const dow = this.getAttribute('dow')

    tooltip
        .style('top', d.pageY + 10 + 'px')
        .style('left', d.pageX + 10 + 'px')
        .html(`${dow} <b>${date}</b>: ${score} fatalities`)
}

function drawMap(month) {
    svgMap.selectAll('#polygroup')
        .attr('class', 'old')
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
                .attr('id', 'polygroup')
        }
        svgMap.selectAll('#polygroup.old').remove()

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

    d3.selectAll('#heatmap_cnt #polygroup').remove()
    let data
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
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const formatDay = d => days[d.getUTCDay()]
    const countDay = d => d.getUTCDay()
    const timeWeek = d3.utcSunday
    const max = Object.entries(data).reduce((a, b) => a[1] > b[1] ? a : b)[1]

    for (let i = 0; i < 7; i++){
        svgHeatmap
            .append('text')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', 475)
            .attr('y', 35 + cellSize * i)
            .text(days[i])
            .style('fill', 'wheat')
            .attr('id', 'polygroup')
    }

    for (const [key, value] of Object.entries(data)){
        const date = new Date(key)
        const fill = d3.interpolateReds(value / max)
        svgHeatmap
            .append('rect')
            .attr('width', cellSize - 7)
            .attr('height', cellSize - 7)
            .attr('x', 175 + timeWeek.count(d3.utcYear(date), date) * cellSize + 10)
            .attr('y', countDay(date) * cellSize + 0.5 + 20)
            .style('fill', fill)
            .attr('fill', fill)
            .attr('dow', formatDay(date))
            .attr('id', 'polygroup')
            .attr('date', key)
            .attr('fat', value)
    }
    svgHeatmap.selectAll('rect')
        .on('mouseover', onmouseover_rect)
        .on('mousemove', onmousemove_rect)
        .on('mouseleave', onmouseleave_rect)

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
        .attr('id', 'polygroup')
}
