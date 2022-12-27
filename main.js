const default_date = '2018-04-15'
const default_month = 4
const default_opacity = 0.9

const url_ = 'https://raw.githubusercontent.com/Resurrectiontent/CarAccidents/master/'

const region_poly = `${url_}static/Regions.csv`
const accidents_month = `${url_}static/dtp2018_agg_month.csv`
const accidents_month_json = `${url_}static/dtp2018_agg_month.json`
const accidents_data = `${url_}static/dtp2018_agg.csv`
const accidents_json = `${url_}static/dtp2018_agg.json`
const name2id_data = `${url_}static/name2id.json`
const id2name_data = `${url_}static/id2name.json`
const dat = 0
const dat_description = 'Amount of fatalities per month'
const max_score_month = 490
const max_scores = [56, 14, 43, 97]

let projection = d3.geoMercator()
    .scale(250)
    .translate([150, 800])

let geoGenerator = d3.geoPath()
    .projection(projection);

let accidents = undefined
fetch(accidents_month_json)
    .then((response) => response.json())
    .then((json) => accidents = json)


const svg_map = d3
    .select("#cnt")
    .append("svg")
    .attr("width", 1500)
    .attr("height", 800)
    .append("g")

svg_map.append("g")
    .attr("transform", "translate(1000,30)")
    .append(() => Legend(
        d3.scaleSequential([0, max_score_month], d3.interpolateReds), {
            width: 500,
            ticks: 10,
            title: dat_description,
        }))

// const svg_map = svg_map_base.append("g")


draw_map(default_month)

function draw_map(month) {
    d3.csv(region_poly, function (data) {
        const id = data.ind
        const cls = `reg_${id}`
        const reg_name = data.reg_name
        const relative = accidents[month][reg_name] / max_score_month
        const fill = d3.interpolateReds(relative)
        const multipoly = JSON.parse(data.poly)

        for (const poly of multipoly) {
            // proj = projection(poly)
            svg_map
                .append('polyline')
                .attr('class', cls)
                .text(reg_name)
                .style('fill', fill)
                .attr('points', poly.map(x => projection(x)))
        }

        svg_map.selectAll('polyline')
            .attr('stroke', 'grey')
            // .attr('stroke-width', .05)
            .attr('opacity', default_opacity)
            // .enter()
            // .append('polyline')
            // .attr('d', geoGenerator)
            // .on('mouseover', mouseover)
            // .on('mousemove', mousemove)
            // .on('click', state_click)
            // .on('mouseleave', mouseleave)
    });

// перемещение карты после отрисовки
//     svg_map.attr('transform', 'translate(-20,-25)')
}