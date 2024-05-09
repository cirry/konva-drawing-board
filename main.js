import Konva from "konva";
import {stage, layer, tr, drawRect, drawPoint, drawPolygon} from "./src/common.js";


let mode = ''
let isPaint = false
let lastLine
// 当前正在被绘画的元素
let drawingGraph
let drawingPolygonPoint = []

const toolButtons = document.querySelectorAll('.tool-btn')
toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tr.nodes([])
        drawingGraph = null
        mode = btn.dataset.mode || ''
    })
})

const clearButton = document.getElementById("clearBtn")
clearButton.addEventListener('click', () => {
    stage.find('.line').forEach(item => item.destroy())
    stage.find('.point').forEach(item => item.destroy())
})
const getInfoButton = document.getElementById("getInfoBtn")
getInfoButton.addEventListener('click', () => {
    console.log(stage.find('Transformer'))
    layer.find()
})

stage.on('mousedown touchstart', function (e) {
    console.log('mousedown', e.target.name())
    // if (e.target.name()) { 这个地方目前无法理解，为什么这么写的话 tr会无法移动
    if (e.target.name() === 'rect') {
        tr.nodes([])
        isPaint = false
        mode = 'tr'
        tr.nodes([e.target])
        layer.add(tr)
        // layer.draw();
    } else {
        isPaint = true;
        let pos = stage.getPointerPosition();
        if (mode === 'pen' || mode === 'eraser') {
            lastLine = new Konva.Line({
                stroke: '#df4b26',
                strokeWidth: 5,
                globalCompositeOperation:
                    mode === 'pen' ? 'source-over' : 'destination-out',
                // round cap for smoother lines
                lineCap: 'round',
                lineJoin: 'round',
                // add point twice, so we have some drawings even on a simple click
                points: [pos.x, pos.y, pos.x, pos.y],
                name: 'line'
            });
            layer.add(lastLine);
        } else if (mode === 'rect' || mode === 'rect-fill') {
            drawingGraph = drawRect({x: pos.x, y: pos.y, width: 0, height: 0, fill: mode === 'rect' ? "" : "#fff",})
            layer.add(drawingGraph)
        } else if (mode === 'polygon') {
            if (pos.x - drawingPolygonPoint[0] < 10 && pos.y - drawingPolygonPoint[1] < 10) {
                let point = drawPoint({x: drawingPolygonPoint[0], y: drawingPolygonPoint[1]})
                drawingPolygonPoint.push(drawingPolygonPoint[0], drawingPolygonPoint[1])
                layer.add(point)
                let polygon = drawPolygon(drawingPolygonPoint)
                layer.add(polygon)
                mode = ''
                isPaint = false
            } else {
                let point = drawPoint({x: pos.x, y: pos.y})
                drawingPolygonPoint.push(pos.x, pos.y)
                layer.add(point)
            }
            console.log(drawingPolygonPoint)
        }
    }


});

stage.on('mouseup touchend', function () {
    if (mode === 'tr') {
        return
    } else {
        isPaint = false;
    }
});

// and core function - drawing
stage.on('mousemove touchmove', function (e) {
    console.log('mouseMove',)
    if (mode === 'tr') {
    }
    if (!isPaint) {
        return;
    }
    // prevent scrolling on touch devices
    e.evt.preventDefault();

    if (mode === 'pen' || mode === 'eraser') {
        const pos = stage.getPointerPosition();
        let newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
    } else if (mode === 'rect' || mode === 'rect-fill') {
        const pos = stage.getPointerPosition();
        let startX = drawingGraph.attrs['x']
        let startY = drawingGraph.attrs['y']
        let width = pos.x - startX
        let height = pos.y - startY
        drawingGraph.setAttrs({
            width,
            height,
        })
    }
});

// add the layer to the stage
stage.add(layer);

// draw the image
layer.draw();
