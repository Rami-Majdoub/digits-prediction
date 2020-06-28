const lineW = 5;
const bgColor = 0; // black
const penColor = 255; // white

// the number of squares the image is divided to (look at the training data)
const nbSquare = 8;
const maxNbPixelsInSquare = 10;
const edge = nbSquare * maxNbPixelsInSquare;

const minTouchPos = new p5.Vector(edge, edge);
const maxTouchPos = new p5.Vector(0, 0);

// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();

function setup() {
  initElements();
  img = createGraphics(edge, edge);

  predictionText.html('i\'m concentrating');
  knnClassifier.load('./models/myKNN_2.json', modelLoaded);

  setDrawingProperties();
  clearCanvas();
}

function setDrawingProperties() {
  fill(penColor);
  stroke(penColor); // no edges
  strokeWeight(lineW);
}

function modelLoaded() {
  predictionText.html('ok i\'m ready to play');
  console.log('model ready');
}

function clearCanvas() {
  background(bgColor);

  minTouchPos.set(edge, edge);
  maxTouchPos.set(0, 0);
}

function initElements() {
  const canvas = createCanvas(edge, edge);
  canvas.parent('canvasContainer');

  resetBtnA = select('#clearButton');
  resetBtnA.mousePressed(clearCanvas);

  predictionText = select('#prediction');
}

function mouseInCanvas() {
  return 0 <= mouseX && mouseX <= width && 0 <= mouseY && mouseY <= height;
}

// to draw a continuous line
var prevX, prevY;

function mouseDragged() {
  if (mouseInCanvas()) {
    if (prevX !== undefined && prevY !== undefined) {
      line(prevX, prevY, mouseX, mouseY);
    }

    const currentMinX = (mouseX - lineW);
    const currentMaxX = (mouseX + lineW);
    const currentMinY = (mouseY - lineW);
    const currentMaxY = (mouseY + lineW);

    if (minTouchPos.x > currentMinX && currentMinX >= 0) minTouchPos.x = currentMinX;
    if (minTouchPos.y > currentMinY && currentMinY >= 0) minTouchPos.y = currentMinY;
    if (maxTouchPos.x < currentMaxX && currentMaxX <= width) maxTouchPos.x = currentMaxX;
    if (maxTouchPos.y < currentMaxY && currentMaxY <= height) maxTouchPos.y = currentMaxY;

    prevX = mouseX;
    prevY = mouseY;
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mouseReleased() {
  if (mouseInCanvas()) {
    prevX = undefined;
    prevY = undefined;

    predictionText.html('i\'m still guessing !');
    await sleep(100);
    // transform the canvas to input
    let input = transformCanvasToFeatures();
    predict(input);
    // console.log('mouse released!');
  }
}

function predict(input) {
  if (knnClassifier !== undefined) { // still loading
    // use the model to predict the digit
    knnClassifier.classify(input, 5, gotResults); // k = 5
  }
}

function gotResults(err, result) {
  if (result.confidences) {
    const confidences = result.confidences;
    const confidence = (confidences[result.label] * 100).toFixed(2);

    if (result.label) {
      predictionText.html('i think that this is a ' + result.label + ' with a confidence of ' + confidence + ' %');
    }
  }
}

// ~~ converts a float to an integer
// for more visit https://stackoverflow.com/questions/34077449/fastest-way-to-cast-a-float-to-an-int-in-javascript/34077505

function transformCanvasToFeatures() {
  loadPixels();
  let d = pixelDensity();

  const w = maxTouchPos.x - minTouchPos.x;
  const h = maxTouchPos.y - minTouchPos.y;
  const nbPixelsW = ~~(w / nbSquare);
  const nbPixelsH = ~~(h / nbSquare);

  let sample = [];
  for (let row = 0; row < nbSquare; row++) {
    for (let col = 0; col < nbSquare; col++) {
      const left = minTouchPos.x + col * nbPixelsW;
      const top = minTouchPos.y + row * nbPixelsH;

      const grayValue = getRectAvg(left, top, nbPixelsW, nbPixelsH, d);
      sample.push(~~map(grayValue, 0, 255, 0, 16));
    }
  }
  // console.log(sample);
  return sample;
}

var img;
function drawModelView() {
  noStroke();
  drawSample(transformCanvasToFeatures(), 0, 0);
  setDrawingProperties();
}

function drawSample(sample, x, y, img) {
  for (let row = 0; row < nbSquare; row++) {
    for (let col = 0; col < nbSquare; col++) {
      drawSampleValue(sample, x, y, row, col, img);
    }
  }
}
function drawSampleValue(values, sampleX, sampleY, row, col, img) {
  const smallEdgeSize = 10;
  const x = sampleX + col * smallEdgeSize;
  const y = sampleY + row * smallEdgeSize;

  var index = values[col + row * nbSquare];

  const grayValue = map(index, 0, 16, 0, 255);

  if (img === undefined) {
    fill(grayValue);
    rect(x, y, smallEdgeSize, smallEdgeSize);
  } else {
    img.noStroke();
    img.fill(grayValue);
    img.rect(x, y, smallEdgeSize, smallEdgeSize);
  }
}

function getRectAvg(left, top, pixelsW, pixelsH, density) {
  var s = 0;
  for (let i = 0; i < pixelsW; i++) {
    for (let j = 0; j < pixelsH; j++) {
      s += getPixelGray(left + i, top + j, density);
    }
  }
  return s / (pixelsW * pixelsH);
}

function logCanvasPixels() {
  loadPixels();
  let d = pixelDensity();

  let p = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      p.push(getPixelGray(i, j, d));
    }
  }
  // console.log(p);
  // console.log(p.length);
}

function getPixelGray(x, y, density) {
  var s = 0;
  const d = density;
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      // loop over
      index = 4 * ((y * d + j) * width * d + (x * d + i));

      s += pixels[index];
      // pixels[index] = r;
      // pixels[index+1] = g;
      // pixels[index+2] = b;
      // pixels[index+3] = a;
    }
  }
  return s / (d * d);
}

function draw() { }