import { buildArtwork, generateRandomTokenParams } from '@/src/anglez';

export async function GET(request: Request, { params }: { params: { seed: number } }) {
  const seed = params.seed;

  console.log('SEED:', seed);

  const tokenParams = generateRandomTokenParams(seed);
  const anglezSvg = buildArtwork(tokenParams);
  // const anglezPng = await convertSvgToPng(anglezSvg, 0, '#ffffff');

  console.log('ANGLEZ:', anglezSvg);

  // Response.sendFile(anglezSvg, 'anglez.svg', { headers: { 'Content-Type': 'image/svg+xml' } });
  // return Response.json({ seed: anglezPng });

  return new Response(anglezSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}

// export function convertSvgToPng(svgText, margin, fill) {
//   // convert an svg text to png using the browser
//   return new Promise(function (resolve, reject) {
//     try {
//       // can use the domUrl function from the browser
//       var domUrl = window.URL || window.webkitURL || window;
//       if (!domUrl) {
//         throw new Error('(browser doesnt support this)');
//       }

//       // figure out the height and width from svg text
//       var height = 1000;
//       var width = 1000;
//       margin = 0;

//       // create a canvas element to pass through
//       var canvas = document.createElement('canvas');
//       canvas.width = height + margin * 2;
//       canvas.height = width + margin * 2;
//       var ctx = canvas.getContext('2d');

//       // make a blob from the svg
//       var svg = new Blob([svgText], {
//         type: 'image/svg+xml;charset=utf-8',
//       });

//       // create a dom object for that image
//       var url = domUrl.createObjectURL(svg);

//       // create a new image to hold it the converted type
//       var img = new Image();

//       // when the image is loaded we can get it as base64 url
//       img.onload = function () {
//         // draw it to the canvas
//         ctx.drawImage(this, margin, margin);

//         // if it needs some styling, we need a new canvas
//         if (fill) {
//           var styled = document.createElement('canvas');
//           styled.width = canvas.width;
//           styled.height = canvas.height;
//           var styledCtx = styled.getContext('2d');
//           styledCtx.save();
//           styledCtx.fillStyle = fill;
//           styledCtx.fillRect(0, 0, canvas.width, canvas.height);
//           styledCtx.strokeRect(0, 0, canvas.width, canvas.height);
//           styledCtx.restore();
//           styledCtx.drawImage(canvas, 0, 0);
//           canvas = styled;
//         }
//         // we don't need the original any more
//         domUrl.revokeObjectURL(url);
//         // now we can resolve the promise, passing the base64 url
//         resolve(canvas.toDataURL());
//       };

//       // load the image
//       img.src = url;
//     } catch (err) {
//       // reject('failed to convert svg to png ' + err);
//       console.log('ERROR! ' + err.message);
//     }
//   });
// }
