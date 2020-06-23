const lineW = 5;
const bgColor = 0; // black
const penColor = 255; // white

// the number of squares the image is divided to (look at the training data)
const nbSquare = 8;
const nbPixelsInSquare = 10;
const edge = nbSquare * nbPixelsInSquare;

// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();

function setup() {
  initElements();
  
  predictionText.html('i\'m concentrating');
  knnClassifier.load('./models/myKNN_2.json', modelLoaded);
  
  fill(penColor);
  stroke(penColor); // no edges
  strokeWeight(lineW);
  clearBackground();
}

function modelLoaded(){
  predictionText.html('ok i\'m ready to play');
  console.log('model ready');
}

function clearBackground(){background(bgColor);}

function initElements(){
  const canvas = createCanvas(edge, edge);
  canvas.parent('canvasContainer');
  
  resetBtnA = select('#clearButton');
  resetBtnA.mousePressed(clearBackground);
  
  createElement('h2', 'Let\'s play a game, you draw a digit from 0 to 9 and i will try to guess it, Wanna play?');
  predictionText = createElement('h3', '');
  
}

// to draw a continuous line
var prevX, prevY;

function mouseDragged(){
  if(prevX !== undefined && prevY !== undefined){
    line(prevX, prevY, mouseX, mouseY);
  }
  prevX = mouseX;
  prevY = mouseY;
}

function mouseReleased() {
  prevX = undefined;
  prevY = undefined;
  
  predict();
  predictionText.html('i\'m still guessing !');
  console.log('mouse released!');
}

function predict(){
  if (knnClassifier !== undefined){ // still loading
    // transform the canvas to input
    let input = transformCanvasToFeatures();
  
    // use the model to predict the digit
    knnClassifier.classify(input, gotResults);
  }
}

function gotResults(err, result) {
  // Display any error
  // if (err) console.error(err);

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    console.log(confidences);
    
    if (result.label){
      predictionText.html('i think that this is a ' + result.label);
    }
  }
}

function transformCanvasToFeatures(){
  loadPixels();
  let d = pixelDensity();
  
  let f = [];
  for (let x = 0; x < nbSquare; x++){
    for (let y = 0; y < nbSquare; y++){
      const left = x * nbPixelsInSquare;
      const top = y * nbPixelsInSquare;
      
      const grayValue = getRectAvg(left, top, nbPixelsInSquare, d);
      // ~~ converts a float to an integer
      // for more visit https://stackoverflow.com/questions/34077449/fastest-way-to-cast-a-float-to-an-int-in-javascript/34077505
      
      f.push(~~map(grayValue, 0, 255, 0, 16));
    }
  }
  console.log(f);
  // console.log(f.length);
  return f;
}

function getRectAvg(left, top, pixels, density){
  var s = 0;
  for (let i = 0; i < pixels; i++) {
    for (let j = 0; j < pixels; j++) {
      s += getPixelGray(left + i, top + j, density);
    }
  }
  return s / (pixels * pixels);
}

function logCanvasPixels(){
  loadPixels();
  let d = pixelDensity();

  let p = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++){
      p.push(getPixelGray(i, j, d));
    }
  }
  console.log(p);
  console.log(p.length);
}

function getPixelGray(x, y, density){
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

function draw() {}
