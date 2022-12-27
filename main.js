const default_date = '2018-04-01'
const default_opacity = 0.9

const url_ = 'https://raw.githubusercontent.com/Resurrectiontent/CarAccidents/master/'

const region_poly = `${url_}static/Regions.csv`
const accidents_data = `${url_}static/dtp2018_agg.csv`
const accidents_json = `${url_}static/dtp2018_agg.json`
const name2id_data = 'static/name2id.json'
const id2name_data = 'static/id2name.json'
const dat = 0
const dat_description = 'Amount of fatalities per day'

const max_scores = [56, 14, 43, 97]

let accidents
fetch(accidents_json)
    .then((response) => response.json())
    .then((json) => accidents = JSON.parse(json));


const svg_map = d3
    .select(".div_map_slider")
    .append("svg")
    .attr("width", 800)
    .attr("height", 400)
    .append("g");

svg_map.append("g")
    // .attr("transform", "translate(555,30)")
    .append(() => Legend(
        d3.scaleSequential([0, max_scores[dat]], d3.interpolateReds), {
            width: 250,
            ticks: 15,
            title: dat_description,
            tickFormat: "%"
        }));


draw_map(default_date)

function draw_map(date) {
    d3.csv(region_poly, function (data) {
        const id = data.ind
        const cls = `reg_${id}`
        const reg_name = data.reg_name
        const relative = accidents[reg_name][date][dat] / max_scores[dat]
        const fill = d3.interpolateReds(relative)
        const poly = JSON.parse(data.poly)
            // if (data.type !== 'multipolygon') {
                svg_map
                    .append('polyline')
                    .attr('class', cls)
                    .style('fill', fill)
                    .text(reg_name)
                    .attr('points', poly)
            // } else {
            //     for (let i = 0; i < state_points.length; i += 1) {
            //         svg_map
            //             .append('polyline')
            //             .attr('class', state_name)
            //             .text(data.state)
            //             .style('fill', red_fill)
            //             .attr('points', state_points[i])
            //     }
            // }
        svg_map.selectAll('polyline')
            .attr('stroke', 'grey')
            .attr('opacity', default_opacity)
            // .on('mouseover', mouseover)
            // .on('mousemove', mousemove)
            // .on('click', state_click)
            // .on('mouseleave', mouseleave)
    });

// перемещение карты после отрисовки
    svg_map.attr('transform', 'translate(-20,-25)')
}