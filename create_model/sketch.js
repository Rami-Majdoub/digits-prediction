const knnClassifier = ml5.KNNClassifier();

function setup() {
  // the file location
  const fileUrl = '../data/optdigits.tra.txt'

  createAlertDanger('Creating a new model << this process will take few seconds or minutes >>');

  loadFileAndPrintToConsole(fileUrl);
}

function createAlertDanger(text) {
  let div = createDiv(text);
  div.addClass('alert');
  div.addClass('alert-danger');
}

function createAlertInfo(text) {
  let div = createDiv(text);
  div.addClass('alert');
  div.addClass('alert-info');
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadFileAndPrintToConsole(url) {
  try {
    await createAlertInfo('loading file content');

    const response = await fetch(url);
    const data = await response.text();

    await sleep(500);
    createAlertInfo('loading data into variables');
    // process data
    var labels = [];
    var inputs = [];

    var samples = data.split('\n');
    for (s of samples) {
      const lastComma = s.lastIndexOf(',');

      var label = s.substring(lastComma + 1, s.length);
      labels.push(parseInt(label));

      var inputs_ = s.substring(0, lastComma).split(',');
      var features = [];
      for (f of inputs_) {
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

    await sleep(500);
    createAlertInfo('trainnig classifier');
    var i;
    for (i = 0; i < inputs.length; i++) {
      knnClassifier.addExample(inputs[i], labels[i]);
    }
    // knnClassifier.train(whileTraining);

    await sleep(500);
    createAlertInfo('downloading file');
    knnClassifier.save();

  } catch (err) {
    createAlertDanger(err);
  }
}