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
  knnClassifier.load('./myKNN.json', modelLoaded);
  
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
    let input = [0,0,8,15,16,13,0,0,0,1,11,9,11,16,1,0,0,0,0,0,7,14,0,0,0,0,3,4,14,12,2,0,0,1,16,16,16,16,10,0,0,2,12,16,10,0,0,0,0,0,2,16,4,0,0,0,0,0,9,14,0,0,0,0];
  
    // use the model to predict the digit
    knnClassifier.classify(input, gotResults);
  }
}

function gotResults(err, result) {
  // Display any error
  // if (err) console.error(err);

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    if (result.label){
      console.log(result.label);
      predictionText.html('i think that this is a ', result.label);
    }
  }
}

function draw() {}
