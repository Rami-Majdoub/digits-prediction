const samplePerColumn = 15;
const samplePerRow = 15;

const edges = 8;
const smallEdgeSize = 2;
const pading = 5;
const edgeSize = smallEdgeSize * edges;

var infoTxt;

async function setup() {
  await loadFile('../data/optdigits.tra.txt');
  
  const w = (edgeSize + pading) * samplePerColumn;
  const h = (edgeSize + pading) * samplePerRow;
  // I will draw the representation of the input and its value in the right
  const canvas = createCanvas(w, h);
  canvas.parent('canvasContainer');
  
  infoTxt = select('#info');
  
  noLoop();
  noStroke();
  
  drawSamples(0);
  
  // console.log('drawing Complete');
}

function drawSamples(index){
  
  const minIndex = index * samplePerRow * samplePerColumn;
  const maxIndex = min(minIndex + samplePerRow * samplePerColumn, inputs.length) - 1;
  
  infoTxt.html('This is a preview of the training data ' + (minIndex + 1) + '-' + (maxIndex + 1)); 
  
  background(0);
  for (let row = 0; row < samplePerRow; row++){
    for (let col = 0; col < samplePerColumn; col++){
      
      const index = col + row * samplePerColumn;
      const x = (edgeSize + pading) * col;
      const y = (edgeSize + pading) * row;
      
      if(minIndex + index < inputs.length)
        drawSample(inputs[minIndex + index], x, y);
      else return;
    }
  }
}

function drawSample(sample, x, y){
  for(let row = 0; row < edges; row++){
    for(let col = 0; col < edges; col++){
      drawSampleValue(sample, x, y, row, col);
    }
  }
}
function drawSampleValue(values, sampleX, sampleY, row, col){
  
  const x = sampleX + col * smallEdgeSize;
  const y = sampleY + row * smallEdgeSize;
  
  var index = values[col + row * edges];
  
  const grayValue = map(index, 0, 16, 0, 255);
  
  fill(grayValue);
  
  rect(x, y, smallEdgeSize, smallEdgeSize);
}

var labels = [];
var inputs = [];
async function loadFile(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    
    
    var samples = data.split('\n');
    for(s of samples){
      const lastComma = s.lastIndexOf(',');
      
      var label = s.substring(lastComma + 1, s.length);
      labels.push(parseInt(label));
      
      var inputs_ = s.substring(0, lastComma).split(',');
      var features = [];
      for (f of inputs_){
        features.push(parseInt(f));
      }
      inputs.push(features);
    }
    
    // remove the last one
    labels.pop();
    inputs.pop();
    
    // console.log('loading Complete')
    
    // console.log(inputs.length);
    // console.log(labels.length);
    // console.log(inputs);
    // console.log(labels);
  } catch (err) {
    console.error(err);
  }
}



