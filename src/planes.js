import { ethers, AbiCoder, BigInt, BigNumber, toBigInt } from 'ethers';

// -------------- EXTERNAL ------------------

// export function buildRandomPlanes() {
//   const randomSeed = Math.trunc(Math.random() * 5_000_000);
//   return buildPlanes(randomSeed);
// }

// export function buildPlanes(randomSeed) {
//   console.log(`Generating artboard for alien world with seed: ${randomSeed}`);
//   const randomZoom = randomIntFromInterval(randomSeed, 90, 100);
//   const svgString = encodeURIComponent(
//     generateArt(randomSeed, randomZoom, null, 0, 180, 25, 250, 25, 250)
//   );

//   return svgString;
// }
// ---------------

// Generate random int, inclusive of min/max

// Generate random int, inclusive of min/max
export function randomIntFromInterval(randomSeed, min, max) {
  if (max <= min) {
    return min;
  }
  // console.log('Random seed: ' + randomSeed);
  const abiCodedSeed = AbiCoder.defaultAbiCoder().encode(['uint'], [randomSeed]);
  const hash = ethers.keccak256(abiCodedSeed);
  const seed = toBigInt(hash);
  // console.log('max: ' + max);
  // console.log('min: ' + min);

  // TODO: work out correct way to do this.
  // const random = (seed % toBigInt(max - min)) + toBigInt(min);
  const random = (seed % toBigInt(max - min + 1)) + toBigInt(min);
  // var i = Math.floor(Math.random() * (max - min + 1) + min);

  // console.log('Random int: ' + random);
  const randomNumber = Number(random);
  // console.log('Random number: ' + randomNumber);
  return Math.round(randomNumber);
}

// export function randomIntFromInterval(randomSeed, min, max) {
//   if (max <= min) {
//     return min;
//   }

//   // regen random seed here to simulate behaviour of using hashing to generated new seed
//   randomSeed = Math.trunc(Math.random() * 5_000_000);

//   const value = (randomSeed % (max - min + 1)) + min;
//   //   var value =  Math.floor(Math.random() * (max - min + 1) + min);
//   // console.log("Random int: " + value);
//   return value;
// }

function getColour(randomSeed, tintColour) {
  const redRandom = randomIntFromInterval(randomSeed, 0, 255);
  const greenRandom = randomIntFromInterval(randomSeed + 2, 0, 255);
  const blueRandom = randomIntFromInterval(randomSeed + 1, 0, 255);

  const redTint = tintColour.r;
  const greenTint = tintColour.g;
  const blueTint = tintColour.b;
  const alpha = tintColour.a;

  // alpha blending
  const red = redRandom + (redTint - redRandom) * alpha;
  const green = greenRandom + (greenTint - greenRandom) * alpha;
  const blue = blueRandom + (blueTint - blueRandom) * alpha;

  const finalColour = 'rgb(' + red + ', ' + green + ', ' + blue + ')';

  return finalColour;
}

export function generateRandomPlanesDataUri() {
  const randomSeed = Math.trunc(Math.random() * 5_000_000);
  const zoom = randomIntFromInterval(randomSeed, 90, 100);

  const red = randomIntFromInterval(randomSeed, 100, 255);
  const green = randomIntFromInterval(randomSeed, 101, 255);
  const blue = randomIntFromInterval(randomSeed, 102, 255);
  const alpha = randomIntFromInterval(randomSeed, 10, 90) / 100;
  const tintColour = { r: red, g: green, b: blue, a: alpha };

  const polyRepeatChance = randomIntFromInterval(randomSeed + 400, 0, 100);
  const style = polyRepeatChance > 80 ? 'cycle' : 'linear';

  const randomShapeCount = randomIntFromInterval(randomSeed, 5, 8);

  const svgString = encodeURIComponent(
    build(randomSeed, zoom, tintColour, style, randomShapeCount)
  );
  return `data:image/svg+xml,${svgString}`;
}

export function build(randomSeed, zoom, tintColour, style, shapeCount) {
  console.log('Generating planes: ' + randomSeed + ' ' + zoom + ' ' + tintColour);

  const [viewBox, clipRect] = getViewBoxClipRect(150 - zoom);
  const defs = "<defs><clipPath id='masterClip'><rect " + clipRect + '/></clipPath></defs>';

  var maxPolyRepeat;

  if (style === 'cycle') {
    maxPolyRepeat = randomIntFromInterval(randomSeed + 300, 2, 8);
  } else {
    maxPolyRepeat = 1;
  }

  const shapes = getShapes(randomSeed, tintColour, shapeCount, maxPolyRepeat);

  return (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='" +
    viewBox +
    "'>" +
    defs +
    ` 
      // <filter id="dropShadow"  color-interpolation-filters="sRGB">
      //   <feDropShadow dx="5" dy="5" stdDeviation="1" flood-opacity="0.2"/>
      // </filter>
    ` +
    "<g filter='url()' clip-path='url(#masterClip)'>" +
    shapes +
    '</g></svg>'
  );
}

function getViewBoxClipRect(zoom) {
  console.log('Zoom: ' + zoom);
  zoom = zoom * 10;
  const widthHeight = 500 + zoom;
  var viewBox = '';
  var clipRect = '';
  var offset = (zoom - 500) / 2;
  if (zoom > 500) {
    viewBox = '-' + offset + ' -' + offset + ' ' + widthHeight + ' ' + widthHeight;
    clipRect =
      "x='-" +
      offset +
      "' y='-" +
      offset +
      "' width='" +
      widthHeight +
      "' height='" +
      widthHeight +
      "'";
  } else {
    offset = zoom === 500 ? 0 : (500 - zoom) / 2;
    viewBox = '' + offset + ' ' + offset + ' ' + widthHeight + ' ' + widthHeight;
    clipRect =
      "x='" +
      offset +
      "' y='" +
      offset +
      "' width='" +
      widthHeight +
      "' height='" +
      widthHeight +
      "'";
  }

  console.log('View box: ' + viewBox);

  return [viewBox, clipRect];
}

function getShapes(randomSeed, tintColour, shapeCount, maxPolyRepeat) {
  var shapes = '';
  // TODO: consider best max ( 5 15?)
  // console.log('_------- RANDOM SEED: ' + randomSeed);
  var minX = 1000;
  var maxX = 0;

  // polygon loop

  for (var i = 1; i <= shapeCount; i++) {
    console.log('BEGINNING LOOP randomSeed: ');
    console.log(randomSeed);
    const pointCount = randomIntFromInterval(randomSeed + i, 3, 5);

    // console.log('polygon: ' + i);
    // console.log('pointCount: ' + pointCount);

    var points = '';

    // TODO: folded shapes by repeating points?

    // points loop
    for (var j = 1; j <= pointCount; j++) {
      const x = randomIntFromInterval(randomSeed + i + j + 40, 0, 1000);
      const y = randomIntFromInterval(randomSeed + i + j + 50, 0, 1000);
      points += `${x},${y} `;
      if (x > maxX) {
        maxX = x;
      }
      if (x < minX) {
        minX = x;
      }
    }

    console.log('points');
    console.log(i);
    console.log(points);

    let polygonOpacity;
    let midStopOpacity;

    if (maxPolyRepeat < 4) {
      polygonOpacity = randomIntFromInterval(randomSeed + i + 16, 80, 100);
      midStopOpacity = randomIntFromInterval(randomSeed + i + 20, 40, 90);
    } else {
      polygonOpacity = randomIntFromInterval(randomSeed + i + 16, 50, 80);
      midStopOpacity = randomIntFromInterval(randomSeed + i + 20, 30, 90);
    }

    // console.log('gradientRotation: ' + gradientRotation);

    const polygonCount = randomIntFromInterval(randomSeed + 17, 1, maxPolyRepeat);
    var polygons = '';
    var polyRotation = 0;
    var polyRotationDelta = 360 / polygonCount; //randomIntFromInterval(randomSeed + 18, 10, 180);

    for (var k = 0; k < polygonCount; k++) {
      polygons += `<polygon points="${points}" transform="rotate(${polyRotation}, 500, 500)" fill="url(#gradient${i})" opacity="${polygonOpacity}%" />`;
      polyRotation += polyRotationDelta;
    }

    var gradientColour1 = getColour(randomSeed + i + 13, tintColour);
    var gradientColour2 = getColour(randomSeed + i + 14, tintColour);
    var gradientColour3 = getColour(randomSeed + i + 15, tintColour);

    // console.log(`gradientColour1: ${gradientColour1}`);
    // console.log(`gradientColour2: ${gradientColour2}`);
    // console.log(`gradientColour3: ${gradientColour3}`);

    const gradientRotation = randomIntFromInterval(randomSeed + i + 15, 0, 360);

    shapes += `
    <linearGradient id="gradient${i}" gradientTransform="rotate(${gradientRotation})">
      <stop offset="0%" stop-color="${gradientColour1}" />
      <stop offset="50%" stop-color="${gradientColour2}" stop-opacity="${midStopOpacity}%" />
      <stop offset="100%" stop-color="${gradientColour3}" />
    </linearGradient>
    ${polygons}
    // TODO: consider drop shadow
    // shapes += `;
    //   <rect x="{$minX}" y="1100" width="${
    //     maxX - minX
    //   }" height="10" fill="#fff" opacity="0"/>
    // `;

    //    <polygon points="${points}" fill="url(#gradient${i})" opacity="${polygonOpacity}" />    `;

    console.log('randomSeed before incrementing: ');
    console.log(randomSeed);
    randomSeed += 100;
    console.log('randomSeed before incrementing: ');
    console.log(randomSeed);
  }

  return shapes;
}

function getRotation(randomSeed, rotationDegrees, rotationRange) {
  const randomDegrees = randomIntFromInterval(randomSeed, 0, rotationRange);
  var rotation = 0;

  if (randomDegrees === 0) {
    rotation = rotationDegrees;
  } else if (randomDegrees < rotationRange) {
    rotation = 360 + rotationDegrees - randomDegrees + rotationRange / 2;
  } else {
    rotation = rotationDegrees + randomDegrees - rotationRange / 2;
  }

  if (rotation > 360) {
    rotation = rotation - 360;
  }

  return rotation;
}

function updateArtBoard() {
  console.log('Generating artboard.. ');
  const svgDataUri = generateRandomPlanesDataUri();
  console.log(svgDataUri);
  // document.body.style.backgroundImage = svgDataUri;
  document.getElementById('artboardImage').src = svgDataUri;
}
