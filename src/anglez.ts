import { ethers, AbiCoder, toBigInt } from 'ethers';

export interface TokenParams {
  seed: number;
  shapeCount: number;
  zoom: number;
  tintColour: RGBAColor;
  isCyclic: boolean;
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
export function randomIntFromInterval(randomSeed: number, min: number, max: number) {
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

function getColour(randomSeed: number, tintColour: RGBAColor) {
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

export function generateRandomTokenParams(seed: number): TokenParams {
  console.log('SEED: ' + seed);
  const zoom = randomIntFromInterval(seed + 3, 50, 100);
  console.log('ZOOMZOOM: ' + zoom);
  const shapeCount = randomIntFromInterval(seed + 5, 5, 8);

  const red = randomIntFromInterval(seed + 6, 0, 255);
  const green = randomIntFromInterval(seed + 7, 0, 255);
  const blue = randomIntFromInterval(seed + 8, 0, 255);
  const alpha = randomIntFromInterval(seed + 9, 10, 90) / 100;
  const isCyclic = randomIntFromInterval(seed + 4, 0, 1) === 1;

  const tokenParams = {
    seed,
    shapeCount,
    zoom,
    tintColour: { r: red, g: green, b: blue, a: alpha },
    isCyclic,
  };

  return tokenParams;
}

export function buildArtwork(tokenParams: TokenParams) {
  console.log(
    'Generating anglez: ' + tokenParams.seed + ' ' + tokenParams.zoom + ' ' + tokenParams.tintColour
  );

  const [viewBox, clipRect] = getViewBoxClipRect(150 - tokenParams.zoom);
  const defs = "<defs><clipPath id='masterClip'><rect " + clipRect + '/></clipPath></defs>';

  var maxPolyRepeat;

  if (tokenParams.isCyclic) {
    maxPolyRepeat = randomIntFromInterval(tokenParams.seed + 300, 2, 8);
  } else {
    maxPolyRepeat = 1;
  }

  const shapes = getShapes(
    tokenParams.seed,
    tokenParams.tintColour,
    tokenParams.shapeCount,
    maxPolyRepeat
  );

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

function getViewBoxClipRect(zoom: number) {
  // console.log('Zoom: ' + zoom);
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

  // console.log('View box: ' + viewBox);

  return [viewBox, clipRect];
}

function getShapes(
  randomSeed: number,
  tintColour: RGBAColor,
  shapeCount: number,
  maxPolyRepeat: number
) {
  var shapes = '';
  // TODO: consider best max ( 5 15?)
  // console.log('_------- RANDOM SEED: ' + randomSeed);
  var minX = 1000;
  var maxX = 0;

  // polygon loop

  for (var i = 0; i < shapeCount; i++) {
    // console.log('BEGINNING LOOP randomSeed: ');
    // console.log(randomSeed);
    const pointCount = randomIntFromInterval(randomSeed + i, 3, 5);

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
    }

    // console.log('points');
    // console.log(i);
    // console.log(points);

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

    // console.log('randomSeed before incrementing: ');
    // console.log(randomSeed);
    // randomSeed += 100;
    // console.log('randomSeed before incrementing: ');
    // console.log(randomSeed);
  }

  return shapes;
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
