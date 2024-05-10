import Konva from "konva";
import {stage, layer, tr, drawRect, drawPoint, drawPolygon, drawLine, drawVirtualPolygon, drawText, drawImage} from "./src/common.js";


let mode = ''
let isPaint = false
let lastLine
// 当前正在被绘画的元素
let drawingGraph
let drawingPoints = []
let cursorPoint //  选择画折线的时候的鼠标样式

let toolButtons = document.querySelectorAll('.tool-btn')
toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tr.nodes([])
        drawingGraph = null
        mode = btn.dataset.mode || ''
        drawingPoints = []
        removeShape('.auxiliary')
    })
})

let saveButton = document.getElementById('saveBtn')
saveButton.addEventListener('click', () => {
    let json = stage.toJSON()
    localStorage.setItem('result', json)
})

let importButton = document.getElementById('importBtn')
importButton.addEventListener('click', () => {
    let json = localStorage.getItem('result')
    stage = Konva.Node.create(json, 'app');

    // 还原 tr
    tr = new Konva.Transformer({
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
})


let clearButton = document.getElementById("clearBtn")
clearButton.addEventListener('click', () => {
    stage.find('.line').forEach(item => item.destroy())
    stage.find('.point').forEach(item => item.destroy())
})
let getInfoButton = document.getElementById("getInfoBtn")
getInfoButton.addEventListener('click', () => {
    console.log(stage.find('Transformer'))
})

function removeShape(name, ...args) {
    console.log(args)
    if (typeof (name) === 'string') {
        stage.find(name).forEach(i => i.destroy())
        if (args) {
            args.forEach(n => {
                stage.find(n).forEach(i => i.destroy())
            })
        }
    } else if (Array.isArray(name)) {
        name.forEach(n => {
            stage.find(n).forEach(i => i.destroy())
        })
    }
}

stage.on('mousedown touchstart', function (e) {
    console.log('mousedown', e.target.name())
    // if (e.target.name()) { 这个地方目前无法理解，为什么这么写的话 tr会无法移动
    if (['rect', 'polygon', 'text', 'image'].includes(e.target.name())) {
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
        } else if (mode === 'polygon' || mode === 'polygon-fill') {
            if (Math.abs(pos.x - drawingPoints[0]) <= 5 && Math.abs(pos.y - drawingPoints[1]) <= 5) {
                let point = drawPoint({x: drawingPoints[0], y: drawingPoints[1]})
                drawingPoints.push(drawingPoints[0], drawingPoints[1])
                layer.add(point)
                let polygon = drawPolygon(drawingPoints, mode === 'polygon' ? '' : '#00D2FF')
                layer.add(polygon)
                removeShape('.point', '.virtual-polygon')
                layer.draw()
                mode = ''
                isPaint = false
                drawingGraph = ''
            } else {
                let point = drawPoint({x: pos.x, y: pos.y})
                drawingPoints.push(pos.x, pos.y)
                layer.add(point)
                if (!drawingGraph) {
                    drawingGraph = drawVirtualPolygon(drawingPoints)
                    layer.add(drawingGraph)
                }
            }
            console.log(drawingPoints)
        } else if (mode === 'border') {
            function dragPointStart() {
                console.log(drawingGraph, drawingPoints)
            }

            cursorPoint = drawPoint({x: pos.x, y: pos.y, name: 'auxiliary'})
            layer.add(cursorPoint)
            if (!drawingGraph) { // 第一次点击
                let point = drawPoint({x: pos.x, y: pos.y, name: 'line-point'})
                layer.add(point)
                drawingPoints.push(pos.x, pos.y)
                drawingGraph = drawLine([drawingPoints])
                layer.add(drawingGraph)
            } else {
                let attach = true
                let newPoints
                if (attach) {
                    let similarPoint = []
                    let isFind = false
                    for (let i = 0; i < drawingPoints.length; i = i + 2) {
                        if (Math.abs(pos.x - drawingPoints[i]) <= 5 && Math.abs(pos.y - drawingPoints[i + 1]) <= 5) {
                            similarPoint.push(drawingPoints[i], drawingPoints[i + 1])
                            isFind = true
                            break
                        }
                    }
                    if (isFind) {
                        let point = drawPoint({x: similarPoint[0], y: similarPoint[1], name: 'line-point'})
                        drawingPoints.push(similarPoint[0], similarPoint[1])
                        layer.add(point)
                    } else {
                        drawingPoints.push(pos.x, pos.y)
                        let point = drawPoint({x: pos.x, y: pos.y, name: 'line-point'})
                        layer.add(point)
                    }
                    newPoints = drawingPoints.concat(similarPoint);
                } else {
                    newPoints = drawingPoints.concat([pos.x, pos.y]);
                }
                drawingGraph.points(newPoints);
            }
        } else if (mode === 'text') {
            drawingGraph = drawText({x: pos.x, y: pos.y, text: "hello world"})
            layer.add(drawingGraph)
            isPaint = false
        } else if (mode === 'image') {
            drawingGraph = drawImage({x: pos.x, y: pos.y, width: 80, height: 80})
        }
    }
});

stage.on('mouseup touchend', function () {
    console.log('mouseup')
    if (!['tr', 'polygon', 'virtual-polygon', 'polygon-fill', 'border'].includes(mode)) {
        isPaint = false;
        mode = ''
    }
});

// and core function - drawing
stage.on('mousemove touchmove', function (e) {
    console.log('mouseMove', mode, isPaint)
    if (!isPaint) {
        drawingGraph = ''
        return;
    }
    // prevent scrolling on touch devices
    e.evt.preventDefault();
    let pos = stage.getPointerPosition();

    if (mode === 'pen' || mode === 'eraser') {
        let newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
    } else if (mode === 'rect' || mode === 'rect-fill') {
        let startX = drawingGraph.attrs['x']
        let startY = drawingGraph.attrs['y']
        let width = pos.x - startX
        let height = pos.y - startY
        drawingGraph.setAttrs({
            width,
            height,
        })
    } else if (mode === 'polygon' || mode === 'polygon-fill') {
        let newPoints = drawingPoints.concat([pos.x, pos.y]);
        drawingGraph.points(newPoints);
    } else if (mode === 'border') {
        cursorPoint.setAttrs({x: pos.x, y: pos.y})
        // let newPoints = drawingPoints.concat([pos.x, pos.y]);
        // drawingGraph.points(newPoints);
    }
});

// add the layer to the stage
stage.add(layer);

// draw the image
layer.draw();
