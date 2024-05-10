import Konva from "konva";


let width = window.innerWidth;
let height = window.innerHeight - 60;
// first we need to create a stage
const stage = new Konva.Stage({
    container: 'app',   // id of container <div>
    width,
    height,
});

let tr = new Konva.Transformer({
    borderStroke: '#000', // 虚线颜色
    borderStrokeWidth: 2, //虚线大小
    nodes: [],
    rotateEnabled: false,
    keepRatio: false,
    boundBoxFunc: (oldBox, newBox) => {
        const {x, y, width, height} = newBox
        return newBox
    }
})

// then create layer
const layer = new Konva.Layer();

function drawRect({x, y, width, height, fill}) {
    let rect = new Konva.Rect({
        x,
        y,
        width,
        height,
        fill,
        stroke: 'black',
        strokeWidth: 1,
        draggable: true,
        name: 'rect'
    })
    // 设置当元素移动的时候鼠标样式
    rect.on('mouseenter', function () {
        stage.container().style.cursor = 'move';
    });
    rect.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
    });

    return rect
}

function drawPoint({x, y}) {
    var circle = new Konva.Circle({
        x,
        y,
        radius: 4,
        fill: 'red',
        name: 'point'
    });
    return circle
}

function drawPolygon(points, fill = '') {
    var polygon = new Konva.Line({
        points,
        fill,
        stroke: 'black',
        strokeWidth: 2,
        draggable: true,
        closed: true,
        name: 'polygon'
    });
    // 设置当元素移动的时候鼠标样式
    polygon.on('mouseenter', function () {
        stage.container().style.cursor = 'move';
    });
    polygon.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
    });
    return polygon
}

function drawLine(points) {
    let lastLine = new Konva.Line({
        stroke: '#df4b26',
        strokeWidth: 2,
        // round cap for smoother lines
        lineCap: 'round',
        lineJoin: 'round',
        // add point twice, so we have some drawings even on a simple click
        points,
        name: 'line'
    });
    return lastLine
}



function drawVirtualPolygon(points) {
    var polygon = new Konva.Line({
        points,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 5,
        opacity: 0.2,
        draggable: true,
        closed: true,
        name: 'virtual-polygon'
    });
    return polygon
}

export {
    drawRect,
    drawPoint,
    drawPolygon,
    drawVirtualPolygon,
    drawLine,
    stage,
    layer,
    tr
}
