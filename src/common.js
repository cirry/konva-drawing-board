import Konva from "konva";


let width = window.innerWidth;
let height = window.innerHeight - 60;
// first we need to create a stage
let stage = new Konva.Stage({
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
let layer = new Konva.Layer();

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

function drawPoint({x, y, name = 'point', dragStartFun, dragEndFun}) {
    let circle = new Konva.Circle({
        x,
        y,
        radius: 4,
        fill: 'red',
        name,
        draggable: name === 'line-point'
    });
    circle.on('dragstart', function () {
        console.log('dragstart');
    });
    circle.on('dragend', function () {
        console.log('dragend');
    });
    return circle
}

function drawPolygon(points, fill = '') {
    let polygon = new Konva.Line({
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
    let polygon = new Konva.Line({
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

function drawText({x, y, text, fontSize = 18, fill = '', name = 'text'}) {
    let textNode = new Konva.Text({
        x,
        y,
        text,
        fontSize,
        fontFamily: 'Calibri',
        fill,
        name,
        draggable: true,
    });
    textNode.on('dblclick dbltap', () => {
        tr.nodes([])
        textNode.hide()
        // create textarea over canvas with absolute position

        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        var textPosition = textNode.getAbsolutePosition();

        // then lets find position of stage container on the page:
        var stageBox = stage.container().getBoundingClientRect();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
        };

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = textNode.width();

        textarea.focus();

        textarea.addEventListener('keydown', function (e) {
            // hide on enter
            if (e.keyCode === 13) {
                textNode.text(textarea.value);
                document.body.removeChild(textarea);
                textNode.show()
            }
        });
        textarea.addEventListener('blur', function (e) {
            // hide on enter
            textNode.text(textarea.value);
            document.body.removeChild(textarea);
            textNode.show()
        });
    });
    return textNode
}

function drawImage({x, y, width, height, name = 'image',}) {
    // let imageObj = new Image();
    // imageObj.onload = function () {
    //     let yoda = new Konva.Image({
    //         x: 50,
    //         y: 50,
    //         image: imageObj,
    //         width: 106,
    //         height: 118,
    //         draggable:true,
    //         name:'image'
    //     });
    //
    //     // add the shape to the layer
    //     layer.add(yoda);
    // };
    // imageObj.src = '/public/vite.svg';
    Konva.Image.fromURL('/public/vite.svg', function (darthNode) {
        darthNode.setAttrs({
            x,
            y,
            width,
            height,
            cornerRadius: 8,
            name,
            draggable: true,
        });
        layer.add(darthNode);
    });
}

export {
    drawRect,
    drawPoint,
    drawText,
    drawImage,
    drawPolygon,
    drawVirtualPolygon,
    drawLine,
    stage,
    layer,
    tr
}
