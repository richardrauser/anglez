import { ethers, AbiCoder, toBigInt } from 'ethers';
import { maxHeaderSize } from 'http';

export interface TokenParams {
  seed: number;
  shapeCount: number;
  tintColour: RGBAColor;
  isCyclic: boolean;
  isChaotic: boolean;
}
export type RGBAColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

// -------------- EXTERNAL ------------------

// export function buildRandomAnglez() {
//   const randomSeed = Math.trunc(Math.random() * 5_000_000);
//   return buildAnglez(randomSeed);
// }

// export function buildAnglez(randomSeed) {
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
function randomIntFromInterval(randomSeed: number, min: number, max: number) {
  if (max <= min) {
    return min;
  }
  // console.log('Random seed: ' + randomSeed);
  const abiCodedSeed = AbiCoder.defaultAbiCoder().encode(['uint'], [randomSeed]);
  const hash = ethers.keccak256(abiCodedSeed);
  const seed = toBigInt(hash);
  // console.log('max: ' + max);
  // console.log('min: ' + min);

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

function getColour(randomSeed: number, tintColour: RGBAColor) {
  const redRandom = randomIntFromInterval(randomSeed, 0, 255);
  const greenRandom = randomIntFromInterval(randomSeed + 2, 0, 255);
  const blueRandom = randomIntFromInterval(randomSeed + 1, 0, 255);

  const redTint = tintColour.r;
  const greenTint = tintColour.g;
  const blueTint = tintColour.b;
  const alpha = tintColour.a;

  const alpha255 = Math.round(alpha * 255);

  // console.log('alpha255: ' + alpha255);

  // alpha blending
  const red = safeTint(redRandom, redTint, alpha255);
  const green = safeTint(greenRandom, greenTint, alpha255);
  const blue = safeTint(blueRandom, blueTint, alpha255);

  const finalColour = 'rgb(' + red + ', ' + green + ', ' + blue + ')';

  return finalColour;
}

function safeTint(colourComponent: number, tintComponent: number, alpha: number) {
  if (alpha == 0) {
    return colourComponent;
  }

  var safelyTinted: number;

  if (colourComponent <= tintComponent) {
    const offset = ((tintComponent - colourComponent) * alpha) / 255;
    safelyTinted = colourComponent + Math.floor(offset);
  } else {
    const offset = ((colourComponent - tintComponent) * alpha) / 255;
    safelyTinted = colourComponent - Math.floor(offset);
  }

  return safelyTinted;
}

export function generateRandomTokenParams(seed: number): TokenParams {
  console.log('SEED: ' + seed);
  const shapeCount = randomIntFromInterval(seed + 5, 5, 8);

  const red = randomIntFromInterval(seed + 6, 0, 255);
  const green = randomIntFromInterval(seed + 7, 0, 255);
  const blue = randomIntFromInterval(seed + 8, 0, 255);
  const alpha = randomIntFromInterval(seed + 9, 10, 90) / 100;
  const isCyclic = randomIntFromInterval(seed + 4, 0, 1) === 1;
  const isChaotic = randomIntFromInterval(seed + 11, 0, 1) === 1;

  const tokenParams = {
    seed,
    shapeCount,
    tintColour: { r: red, g: green, b: blue, a: alpha },
    isCyclic,
    isChaotic,
  };

  return tokenParams;
}

export function buildArtwork(tokenParams: TokenParams) {
  console.log(`Generating anglez: ${JSON.stringify(tokenParams)}`);

  var maxPolyRepeat;

  if (tokenParams.isCyclic) {
    maxPolyRepeat = randomIntFromInterval(tokenParams.seed + 300, 2, 8);
  } else {
    maxPolyRepeat = 1;
  }

  const [shapes, viewBox] = getShapes(
    tokenParams.seed,
    tokenParams.tintColour,
    tokenParams.shapeCount,
    maxPolyRepeat,
    tokenParams.isChaotic
  );

  return (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='" +
    viewBox +
    "'>" +
    shapes +
    // '</g>' +
    '</svg>'
  );
}

function getShapes(
  randomSeed: number,
  tintColour: RGBAColor,
  shapeCount: number,
  maxPolyRepeat: number,
  isChaotic: boolean
) {
  var shapes = '';
  // TODO: consider best max ( 5 15?)
  // console.log('_------- RANDOM SEED: ' + randomSeed);
  var minX = 1000;
  var maxX = 0;
  var minY = 1000;
  var maxY = 0;

  // polygon loop
  for (var i = 0; i < shapeCount; i++) {
    // console.log('BEGINNING LOOP randomSeed: ');
    // console.log(randomSeed);
    // TODO: raise point count for chaotic?
    const pointCount = randomIntFromInterval(randomSeed + i, 3, 4);

    // console.log('polygon: ' + i);
    // console.log('pointCount: ' + pointCount);

    var points = '';

    // TODO: folded shapes by repeating points?

    // points loop
    for (var j = 0; j < pointCount; j++) {
      const x = randomIntFromInterval(randomSeed + i + j + 40, 0, 1000);
      const y = randomIntFromInterval(randomSeed + i + j + 50, 0, 1000);
      points += `${x},${y} `;
      if (x > maxX) {
        maxX = x;
      }
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (y > maxY) {
        maxY = y;
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

    const polygonCount =
      maxPolyRepeat == 1 ? 1 : randomIntFromInterval(randomSeed + 17, 2, maxPolyRepeat);
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
      <stop offset="50%" stop-color="${gradientColour2}" stop-opacity="0.${midStopOpacity}" />
      <stop offset="100%" stop-color="${gradientColour3}" />
    </linearGradient>
    ${polygons}
    // TODO: consider drop shadow
    // shapes += `;
    // <rect x="{$minX}" y="1100" width="${
    //   maxX - minX
    // }" height="10" fill="#fff" opacity="0"/>
    // `;

    //    <polygon points="${points}" fill="url(#gradient${i})" opacity="${polygonOpacity}" />    `;

    // console.log('randomSeed before incrementing: ');
    // console.log(randomSeed);
    if (isChaotic) {
      randomSeed += 100;
    }
    // console.log('randomSeed before incrementing: ');
    // console.log(randomSeed);
  }

  console.log('minX: ' + minX);
  console.log('maxX: ' + maxX);
  console.log('minY: ' + minY);
  console.log('maxY: ' + maxY);

  const structureWidth = maxX - minX;
  const structureHeight = maxY - minY;

  console.log('structureWidth: ' + structureWidth);
  console.log('structureHeight: ' + structureHeight);

  console.log('maxPolyRepeat: ' + maxPolyRepeat);

  var width: number;
  var height: number;
  var xOffset: number;
  var yOffset: number;

  if (maxPolyRepeat == 1) {
    width = structureWidth + 100;
    xOffset = minX - 50; // (1000 - width) / 2;
    height = structureHeight + 100;
    yOffset = minY - 50;

    // shapes += `
    //   <rect x="${minX}" y="${minY}" width="${structureWidth}" height="${structureHeight}" fill="#f00" opacity="0.2"/>
    // `;
  } else {
    const margin = Math.min(minX, 1000 - maxX, minY, 1000 - maxY) + 10;
    const artboardWidthHeight = 1000 - 2 * margin;

    console.log('artboardWidthHeight: ' + artboardWidthHeight);

    const temp = 2 * Math.pow(artboardWidthHeight, 2);
    console.log('temp: ' + temp);
    // so we get an even number
    const widthHeight = Math.floor((Math.floor(sqrt(temp)) + 1) / 2) * 2;

    console.log('widthHeight: ' + widthHeight);

    const offset = (1000 - widthHeight) / 2;

    width = widthHeight;
    xOffset = offset;
    height = widthHeight;
    yOffset = offset;

    // shapes += `
    // <rect x="${0}" y="${0}" width="${width}" height="${height}" fill="#f00" opacity="0.2"/>
    // `;
  }

  const viewBox = xOffset + ' ' + yOffset + ' ' + width + ' ' + height;
  // const viewBox = '-100 -100 1200 1200';

  console.log('viewBox:' + viewBox);

  return [shapes, viewBox];
}

function sqrt(x: number) {
  var z = (x + 1) / 2;
  var y = x;
  while (z < y) {
    y = z;
    z = (x / z + z) / 2;
  }

  return y;
}

// function getRotation(randomSeed: number, rotationDegrees: number, rotationRange: number) {
//   const randomDegrees = randomIntFromInterval(randomSeed, 0, rotationRange);
//   var rotation = 0;

//   if (randomDegrees === 0) {
//     rotation = rotationDegrees;
//   } else if (randomDegrees < rotationRange) {
//     rotation = 360 + rotationDegrees - randomDegrees + rotationRange / 2;
//   } else {
//     rotation = rotationDegrees + randomDegrees - rotationRange / 2;
//   }

//   if (rotation > 360) {
//     rotation = rotation - 360;
//   }

//   return rotation;
// }

// function updateArtBoard() {
//   console.log('Generating artboard.. ');
//   const svgDataUri = generateRandomAnglezDataUri();
//   console.log(svgDataUri);
//   // document.body.style.backgroundImage = svgDataUri;
//   document.getElementById('artboardImage').src = svgDataUri;
// }
