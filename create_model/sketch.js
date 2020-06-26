const knnClassifier = ml5.KNNClassifier();

function setup() {
  // the file location
  const fileUrl = '../data/optdigits.tra.txt'
  loadFileAndPrintToConsole(fileUrl);
}

async function loadFileAndPrintToConsole(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    
    // process data
    var labels = [];
    var inputs = [];
    
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
    // console.log(inputs.length);
    // console.log(labels.length);
    // console.log(inputs);
    // console.log(labels);
    var i;
    for(i =0; i<inputs.length; i++){
      knnClassifier.addExample(inputs[i], labels[i]);
    }
    // knnClassifier.train(whileTraining);
    knnClassifier.save();
    
    console.log('done');
    
  } catch (err) {
    console.error(err);
  }
}