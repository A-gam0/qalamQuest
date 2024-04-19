const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 10;
ctx.lineCap = 'round';
const sliderCanvas = document.getElementById('sliderCanvas');
const sctx = sliderCanvas.getContext('2d');
let BaLetterPoints = [
    {sx: 415, sy:182},
    {sx:415, sy:182, cx1: 451, cy1:225, cx2: 428, cy2:261, ex:385, ey:276},
    {sx:385, sy:276, cx1: 271, cy1:317, cx2: 117, cy2:297, ex:199, ey:181}
];

let currentSegment = BaLetterPoints[1];
let point = {};
let currentSliderPosition = {};
let drawing = false;
let oldClosestT = -1;

function drawLetter(letterPoints) {
    const firstPoint = letterPoints[0];
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(firstPoint.sx, firstPoint.sy);
    for (let i = 1; i < letterPoints.length; i++) {
        ctx.bezierCurveTo(letterPoints[i].cx1, letterPoints[i].cy1, letterPoints[i].cx2, letterPoints[i].cy2, letterPoints[i].ex, letterPoints[i].ey);
    }
    ctx.stroke();
}
function drawSlider(x, y, color, radius) {
    sctx.beginPath();
    sctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    sctx.fillStyle = color;
    sctx.fill()
    currentSliderPosition.x = x;
    currentSliderPosition.y = y;
}
drawLetter(BaLetterPoints);
drawSlider(415, 182, "lightblue", 2);
drawSlider(415, 182, "white", 2);
// Drawing segments break points
// ctx.fillRect(415, 182, 10, 10);
// ctx.fillRect(385, 276, 10, 10);
// ctx.fillRect(199, 181, 10, 10);
function handleMove(mouseX, mouseY) {
    point = findClosestPointOnBezier(mouseX, mouseY, {x:currentSegment.sx, y:currentSegment.sy}, {x:currentSegment.cx1, y:currentSegment.cy1}, {x:currentSegment.cx2, y:currentSegment.cy2}, {x:currentSegment.ex, y:currentSegment.ey});
    const distance = calculateDistance(currentSliderPosition.x, currentSliderPosition.y, mouseX, mouseY);
    if (drawing && distance <= 20 && point.closestT > oldClosestT) {
        if (point.minDist <= 20) {
            // if (oldClosestT === -1) {
            //     oldClosestT = 0;
            // }
            oldClosestT = point.closestT;
            clearSliderCanvas();
            drawSlider(point.closestPoint.x, point.closestPoint.y, "lightblue", 2);
            drawSlider(point.closestPoint.x, point.closestPoint.y, "white", 2);
            // drawSegmentBezier(ctx, {x:currentSegment.sx, y:currentSegment.sy}, {x:currentSegment.cx1, y:currentSegment.cy1}, {x:currentSegment.cx2, y:currentSegment.cy2}, {x:currentSegment.ex, y:currentSegment.ey}, oldClosestT, point.closestT,'red');
            drawPartialBezier(ctx, {x:currentSegment.sx, y:currentSegment.sy}, {x:currentSegment.cx1, y:currentSegment.cy1}, {x:currentSegment.cx2, y:currentSegment.cy2}, {x:currentSegment.ex, y:currentSegment.ey}, oldClosestT, 'red');
            if (oldClosestT === 1) {
                currentSegment = BaLetterPoints[2];
                oldClosestT = -1;
                console.log('sgement done')
            }
        } else {
            drawing = false;
        }
    }
}
function findClosestPointOnBezier(mouseX, mouseY, P0, P1, P2, P3) {
    let minDist = Infinity;
    let closestPoint = null;
    let closestT = 0;

    for (let i = 0; i <= 1000; i++) {
        let t = i / 1000;
        let pt = getPointOnBezier(t, P0, P1, P2, P3);
        let dist = Math.sqrt((pt.x - mouseX)**2 + (pt.y - mouseY)**2);
        if (dist < minDist) {
            minDist = dist;
            closestPoint = pt;
            closestT = t;
        }
    }
    return { closestPoint, closestT, minDist };
}
function getPointOnBezier(t, P0, P1, P2, P3) {
    const x = (1-t)**3*P0.x + 3*(1-t)**2*t*P1.x + 3*(1-t)*t**2*P2.x + t**3*P3.x;
    const y = (1-t)**3*P0.y + 3*(1-t)**2*t*P1.y + 3*(1-t)*t**2*P2.y + t**3*P3.y;
    return {x, y};
}
function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
function clearSliderCanvas() {
    sctx.clearRect(0, 0, sliderCanvas.width, sliderCanvas.height);
}
function drawPartialBezier(ctx, P0, P1, P2, P3, t, color) {
    // Compute the points along the line at t using De Casteljau's algorithm
    function interpolate(p1, p2, t) {
        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
        };
    }

    // First generation of intermediate points
    let P01 = interpolate(P0, P1, t);
    let P12 = interpolate(P1, P2, t);
    let P23 = interpolate(P2, P3, t);

    // Second generation of intermediate points
    let P012 = interpolate(P01, P12, t);
    let P123 = interpolate(P12, P23, t);

    // Final point on the curve at t
    let P0123 = interpolate(P012, P123, t);

    // Draw the curve using the control points from P0 to P0123
    ctx.beginPath();
    ctx.moveTo(P0.x, P0.y);
    ctx.bezierCurveTo(P01.x, P01.y, P012.x, P012.y, P0123.x, P0123.y);
    ctx.strokeStyle = 'lightblue';
    ctx.stroke();

}
// function drawSegmentBezier(ctx, P0, P1, P2, P3, t1, t2, color) {
//     // Interpolates point between two points based on t
//     function interpolate(p1, p2, t) {
//         return {
//             x: p1.x + (p2.x - p1.x) * t,
//             y: p1.y + (p2.y - p1.y) * t
//         };
//     }

//     // Adjust t1 and t2 to be within the same curve segment
//     if (t1 > t2) {
//         let temp = t1;
//         t1 = t2;
//         t2 = temp;
//     }

//     // Apply De Casteljau's algorithm to find new control points for the subcurve between t1 and t2
//     // Split at t2
//     let A = interpolate(P0, P1, t2);
//     let B = interpolate(P1, P2, t2);
//     let C = interpolate(P2, P3, t2);
//     let D = interpolate(A, B, t2);
//     let E = interpolate(B, C, t2);
//     let F = interpolate(D, E, t2); // This is the point at t2

//     // Now split the segment [0, t2] at t1 / t2
//     let t = t1 / t2; // Adjust t1 to the new scale of the first segment
//     let G = interpolate(P0, A, t);
//     let H = interpolate(A, D, t);
//     let I = interpolate(D, F, t);
//     let J = interpolate(G, H, t);
//     let K = interpolate(H, I, t);
//     let L = interpolate(J, K, t); // This is the point at t1 on the subcurve from 0 to t2

//     // Now L to F is the segment from t1 to t2
//     ctx.beginPath();
//     ctx.moveTo(L.x, L.y);
//     ctx.bezierCurveTo(K.x, K.y, I.x, I.y, F.x, F.y);
//     ctx.strokeStyle = color;
//     ctx.stroke();
// }
function handleTouchMove(event) {
    event.preventDefault();  // Prevents scrolling and zooming on touch devices
    const touch = event.touches[0];
    const rect = sliderCanvas.getBoundingClientRect();
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    handleMove(mouseX, mouseY);
}
// Add event listeners for mouse and touch
sliderCanvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { drawing = true; }
});
sliderCanvas.addEventListener('mousemove', (event) => {
    if (drawing) {
        const rect = sliderCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        handleMove(mouseX, mouseY);
    }
});
sliderCanvas.addEventListener('mouseup', () => {
    drawing = false;
});
sliderCanvas.addEventListener('mouseout', () => {
    drawing = false;
});
sliderCanvas.addEventListener('touchstart', (event) => {
    if (event.touches.length == 1) { // Only start drawing if there is one touch
        drawing = true;
    }
});
sliderCanvas.addEventListener('touchmove', handleTouchMove);
sliderCanvas.addEventListener('touchend', () => {
    drawing = false;
});
sliderCanvas.addEventListener('touchcancel', () => {
    drawing = false;
});


