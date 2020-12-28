// Author: EO Karakaslar - Dec 24, 2020

// This is just an attempt to recreate Ben Frederickson's final example on numerical optimization in P5:
// http://www.benfrederickson.com/numerical-optimization/


var cities = [];
var distances;
var padding = 300;
var citynames;
var learningRate = 5e-10;
var loss = 1000000;
var newX = 0,
  newY = 0;

var slider;

function preload() {
  data = loadJSON('assets/cities_data.json');
  img = loadImage('assets/North_America_satellite_orthographic.jpg');
}

function setup() {
  createCanvas(1280, 1048);
  
  textAlign(CENTER);
  citynames = data.labels;
  distances = data.distances;

  // adding cities!
  for (let i = 0; i < citynames.length; i++) {
    let cityname = citynames[i];
    cities[i] = new city(cityname,
      createVector(random(padding, width - padding), random(padding, height - padding)))
  }
}

function draw() {

  noStroke();
  
  background(255);
  textSize(14);
  image(img, 0, 0, width, height)

  for (let i = 0; i < cities.length; i++) {
    cities[i].show();
  }

  calculateLoss();

  if (loss < 1) {
    console.log("FINISHED!")
    noLoop()
  }

}


function dot(a, b) {
  var ret = 0;
  for (var i = 0; i < a.length; ++i) {
    ret += a[i] * b[i];
  }
  return ret;
}

function calculateLoss() {

  var v = [];
  loss = 0;
  var fprime = [];
  // get the 2n vector (optimized vector)
  // https://cs.stackexchange.com/questions/65711/mds-minimization-with-gradient-descent
  for (let i = 0; i < cities.length; i++) {
    let cityLoc = cities[i].getLoc();
    v.push(cityLoc.x)
    v.push(cityLoc.y)
    fprime.push(0)
    fprime.push(0)
  }


  // calculate mds gradient descent
  for (let i = 0; i < cities.length; i++) {

    var xi = v[2 * i];
    var yi = v[2 * i + 1];

    for (let j = 0; j < cities.length; j++) {

      var xj = v[2 * j];
      var yj = v[2 * j + 1];
      var dij = distances[i][j];
      var squaredDistance = (xj - xi) * (xj - xi) + (yj - yi) * (yj - yi);
      var delta = squaredDistance - dij * dij;

      loss += delta * delta;

      fprime[2 * i] += 4 * delta * (xi - xj);
      fprime[2 * j] += 4 * delta * (xj - xi);

      fprime[2 * i + 1] += 4 * delta * (yi - yj);
      fprime[2 * j + 1] += 4 * delta * (yj - yi);

    }
  }


  // update locations
  for (let i = 0; i < cities.length; i++) {

    v[2 * i] -= fprime[2 * i] * learningRate;
    v[2 * i + 1] -= fprime[2 * i + 1] * learningRate;

  }


  // rotate everything in place such that city 0 (vancouver) is
  // directly north of city 1 (Portland)
  var rotation = Math.atan2(v[0] - v[2], v[1] - v[3]);
  rotation += PI
  var c = Math.cos(rotation),
    s = Math.sin(rotation),
    x, y;

  // rotate all
  for (let i = 0; i < cities.length; ++i) {
    x = v[2 * i];
    y = v[2 * i + 1];

    v[2 * i] = c * x - s * y;
    v[2 * i + 1] = s * x + c * y;

  }





  var meanX = 0;
  var meanY = 0;
  // take all cities back to the center of the screen!
  // calculate center of cities
  for (let i = 0; i < cities.length; i++) {
    meanX += v[2 * i];
    meanY += v[2 * i + 1];
  }
  meanX = meanX / cities.length;
  meanY = meanY / cities.length;

  for (let i = 0; i < cities.length; i++) {
    v[2 * i] = (v[2 * i] - meanX + width / 2)
    v[2 * i + 1] = (v[2 * i + 1] - meanY + height / 2)
  }

  // if Vancouver is east of NYC
  if (v[0] > v[4]) {

    for (let i = 0; i < cities.length; i++) {
      deltaX = width / 2 - v[2 * i]
      v[2 * i] = width / 2 + deltaX
    }
  }

  
  // set to new positions
  for (let i = 0; i < cities.length; i++) {
    newX = v[2 * i];
    newY = v[2 * i + 1];
    cities[i].setLoc(newX, newY)
  }




}


function mousePressed() {
  startAgain()
}

function startAgain() {
  for (let i = 0; i < cities.length; i++) {
    cities[i].setLoc(random(padding, width - padding), random(padding, height - padding))
  }
  loop();
}

class city {

  constructor(name, loc) {
    this.name = name;
    this.loc = loc;
    this.color = color(random(255), random(255), random(255));
  }

  show() {
    fill(this.color);
    text(this.name, this.loc.x, this.loc.y + 20)
    ellipse(this.loc.x, this.loc.y, 20)
  }


  getLoc() {
    return this.loc;
  }

  setLoc(x, y) {
    this.loc.x = x;
    this.loc.y = y;
  }

}