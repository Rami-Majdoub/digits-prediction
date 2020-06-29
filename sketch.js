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
	initDomElements();

	predictionText.html('i\'m concentrating');
	knnClassifier.load('./models/myKNN_2.json',
		function () {
			predictionText.html('ok i\'m ready to play');
			console.log('model ready');
		}
	);

	setDrawingProperties();
	clearCanvas();
}

function setDrawingProperties() {
	fill(penColor);
	stroke(penColor); // no edges
	strokeWeight(lineW);
}

function clearCanvas() {
	background(bgColor);

	minTouchPos.set(edge, edge);
	maxTouchPos.set(0, 0);
}

// var img;
/**
 * create and store a refrence to html elements
 */
function initDomElements() {
	const canvas = createCanvas(edge, edge);
	canvas.parent('canvasContainer');

	resetBtnA = select('#clearButton');
	resetBtnA.mousePressed(clearCanvas);

	predictionText = select('#prediction');

	// img = createGraphics(edge, edge);
}

/**
 * this method is called to seperate the canvas mouse actions
 * from others (like: button click, selecting a text, ...)
 */
function mouseInCanvas() {
	return 0 <= mouseX && mouseX <= width && 0 <= mouseY && mouseY <= height;
}

// to draw a continuous line
var prevX, prevY;

function mouseDragged() {
	// ignore the event if the mouse is out of the canvas
	if (mouseInCanvas()) {
		// if it is the first point in the drawing 
		// save it for the next time to draw a line
		if (prevX !== undefined && prevY !== undefined) {
			line(prevX, prevY, mouseX, mouseY);
		}

		// this pading is to fully draw the pen's 
		// drawing point (known as strokeWeight)
		const pading = lineW;
		// applying the pading
		const currentMinX = (mouseX - pading);
		const currentMaxX = (mouseX + pading);
		const currentMinY = (mouseY - pading);
		const currentMaxY = (mouseY + pading);

		// Be sure that the new value is in the canvas bounds
		if (minTouchPos.x > currentMinX && currentMinX >= 0) minTouchPos.x = currentMinX;
		if (minTouchPos.y > currentMinY && currentMinY >= 0) minTouchPos.y = currentMinY;
		if (maxTouchPos.x < currentMaxX && currentMaxX <= width) maxTouchPos.x = currentMaxX;
		if (maxTouchPos.y < currentMaxY && currentMaxY <= height) maxTouchPos.y = currentMaxY;

		// change the previous point to the new
		// one to maintain a hand-drawn line
		prevX = mouseX;
		prevY = mouseY;
	}

}

/**
 * pause the main thread for ms milliSeceonds
 * @param {milliSeceonds} ms to sleep
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Testing
function drawBounds() {
	const w = maxTouchPos.x - minTouchPos.x;
	const h = maxTouchPos.y - minTouchPos.y;

	stroke(255, 0, 0);
	strokeWeight(1)
	noFill();
	rect(minTouchPos.x, minTouchPos.y, w, h);
	setDrawingProperties();
}

async function mouseReleased() {
	if (mouseInCanvas()) {
		// stop the drawing
		prevX = undefined;
		prevY = undefined;

		// inform the user
		predictionText.html('i\'m still guessing !');

		// few milliseconds for the user to read the text
		await sleep(100);

		// transform the canvas to input
		let input = transformCanvasToFeatures();
		predict(input);
	}
}
/**
 * use the model to predict the digit
 * @param {a 8*8 table of integers with values 0..16} input 
 */
function predict(input) {
	if (knnClassifier !== undefined) { // still loading
		if (input.length == 64) {
			knnClassifier.classify(input, 5, gotResults); // k = 5
		} else {
			predictionText.html('invalid input !');
			console.error('input length: ' + input.length);
			console.error('input: ' + input);
		}
	}
}

/**
 * callback function called when the model 
 * return a result or an error
 * @param {error raised by the model} err 
 * @param {result of the the model} result 
 */
function gotResults(err, result) {
	if (result) {
		const confidences = result.confidences;
		const confidence = (confidences[result.label] * 100).toFixed(2);

		if (result.label) {
			predictionText.html('i think that this is a ' + result.label + ' with a confidence of ' + confidence + ' %');
		}
	}

	if (err) {
		predictionText.html('Oooooh my head! i don\'t feel good.<br />please report this (go to Source code and post an issue)');
	}
}

function beginTestingDrawing() {
	stroke(255, 0, 0);
	strokeWeight(1)
	noFill();
}
function endTestingDrawing() { setDrawingProperties(); }

/**
 * a test function for transformCanvasToFeatures()
 */
function drawCanvasFeatures() {
	beginTestingDrawing();

	const w = maxTouchPos.x - minTouchPos.x;
	const h = maxTouchPos.y - minTouchPos.y;
	const nbPixelsW = ~~(w / nbSquare);
	const nbPixelsH = ~~(h / nbSquare);

	const lostPixelsW = w - nbPixelsW * nbSquare;
	const lostPixelsH = h - nbPixelsH * nbSquare;

	for (let row = 0; row < nbSquare; row++) {
		for (let col = 0; col < nbSquare; col++) {
			const left = minTouchPos.x + col * nbPixelsW;
			const top = minTouchPos.y + row * nbPixelsH;

			const addPixelToWidth = lostPixelsW > col;
			const addPixelToHeight = lostPixelsH > row;

			rect(
				// left + (addPixelToWidth ? col : lostPixelsW),
				// top + (addPixelToHeight ? row : lostPixelsH),
				left + min(col, lostPixelsW - 1),
				top + min(row, lostPixelsH - 1),
				nbPixelsW + (addPixelToWidth ? 1 : 0),
				nbPixelsH + (addPixelToHeight ? 1 : 0));
		}
	}
	endTestingDrawing();
}

// ~~ converts a float to an integer
// for more visit https://stackoverflow.com/questions/34077449/fastest-way-to-cast-a-float-to-an-int-in-javascript/34077505
function transformCanvasToFeatures() {
	loadPixels();
	let d = pixelDensity();

	// the width and the height of the drawing
	const w = maxTouchPos.x - minTouchPos.x;
	const h = maxTouchPos.y - minTouchPos.y;
	// the number of pixels per square
	const nbPixelsW = ~~(w / nbSquare);
	const nbPixelsH = ~~(h / nbSquare);
	// the number of lost pixels
	const lostPixelsW = w - nbPixelsW * nbSquare;
	const lostPixelsH = h - nbPixelsH * nbSquare;

	let sample = [];
	for (let row = 0; row < nbSquare; row++) {
		for (let col = 0; col < nbSquare; col++) {
			// the position of the square (with lost)
			const left = minTouchPos.x + col * nbPixelsW;
			const top = minTouchPos.y + row * nbPixelsH;
			// add a pixel to remove the lost starting from
			// the top-left square down to the bottom-right
			const shouldAddAPixelToWidth = lostPixelsW > col;
			const shouldAddAPixelToHeight = lostPixelsH > row;

			// the new bound values with no loss 
			const grayValue = getRectAvg(
				left + min(col, lostPixelsW - 1),// - 1 because > and not >= (lostPixelsW > col)
				top + min(row, lostPixelsH - 1),
				nbPixelsW + (shouldAddAPixelToWidth ? 1 : 0),
				nbPixelsH + (shouldAddAPixelToHeight ? 1 : 0),
				d);

			sample.push(~~map(grayValue, 0, 255, 0, 16));
		}
	}
	return sample;
}

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

// unused
function logCanvasPixels() {
	loadPixels();
	let d = pixelDensity();

	let p = [];
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			p.push(getPixelGray(i, j, d));
		}
	}
	console.log(p.length);
	console.log(p);
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