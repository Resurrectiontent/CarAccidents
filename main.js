const defaultDate = '2018-04-15'
const defaultMonth = 4
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
const accidentsMonth = `${url_}static/dtp2018_agg_month.csv`
const accidentsMonthJson = `${url_}static/dtp2018_agg_month.json`
const accidentsData = `${url_}static/dtp2018_agg.csv`
const accidentsJson = `${url_}static/dtp2018_agg.json`
// const name2id_data = `${url_}static/name2id.json`
// const id2name_data = `${url_}static/id2name.json`

let accidents = undefined
fetch(accidentsMonthJson)
    .then((response) => response.json())
    .then((json) => accidents = json)

const dat = 0
const datDescription = 'Amount of fatalities per month'
const maxScoreMonth = 490
const maxScores = [56, 14, 43, 97]

let projection = d3.geoMercator()
    .scale(300)
    .translate([150, 800])

d3.select('#cnt')
    .append('div')
    .attr('id', 'map_cnt')

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

const slider = d3
    .sliderHorizontal()
    .min(4)
    .max(12)
    .value(defaultMonth)
    .step(1)
    .ticks(9)
    .width(500)
    .displayFormat(d3.format(".0f"))
    .tickFormat(d3.format(".0f"))
    .on('onchange', (month) => drawMap(month))

const slider_svg = d3
    .select("#map_cnt")
    .append("svg")
    .attr("width", 1100)
    .attr("height", 80)
    .append("g")
    .attr("transform", "translate(500,0)")
    .call(slider);

const svgMap = d3
    .select('#map_cnt')
    .append('svg')
    .attr('width', 1500)
    .attr('height', 800)
    .append('g')

svgMap.append('g')
    .attr('transform', 'translate(1000,30)')
    .attr('id', 'legend')
    .append(() => Legend(
        d3.scaleSequential([0, maxScoreMonth], d3.interpolateReds), {
            width: 500,
            ticks: 10,
            title: datDescription,
        }))

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
    svgMap.selectAll().remove()
    d3.csv(regionPoly, function (data) {
        const id = data.ind
        const cls = `reg_${id}`
        const regName = data.reg_name
        const score = accidents[month.toString()][regName]
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
            // .on('click', state_click)
    });
}

drawMap(defaultMonth)