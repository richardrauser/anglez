import { toast } from 'react-toastify';

export function showErrorMessage(message, onClick) {
  console.log('Displaying error message: ' + message);    
  // TODO: actually hash?
  const hash = message;
  console.log('Hash: ' + hash);    

  toast.error(message, {
      toastId: hash,
      autoClose: 5000,
      hideProgressBar: false,
      // closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClick: onClick
    });
}
  
export function showWarningMessage(message) {
  console.log('Displaying warning message: ' + message);

    // TODO: actually hash?
    const hash = message;
    console.log('Hash: ' + hash);    
  
  toast.warning(message, {
    toastId: hash,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
}

export function showInfoMessage(message) {
  console.log('Displaying info message: ' + message);

    // TODO: actually hash?
    const hash = message;
    console.log('Hash: ' + hash);    
  
  toast.info(message, {
    toastId: hash,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
}

            
/**
* converts an svg string to base64 png using the domUrl
* @param {string} svgText the svgtext
* @param {number} [margin=0] the width of the border - the image size will be height+margin by width+margin
* @param {string} [fill] optionally backgrund canvas fill
* @return {Promise} a promise to the bas64 png image
*/
export function convertSvgToPng(svgText, margin, fill) {
  // convert an svg text to png using the browser
  return new Promise(function(resolve, reject) {
    try {
      // can use the domUrl function from the browser
      var domUrl = window.URL || window.webkitURL || window;
      if (!domUrl) {
        throw new Error("(browser doesnt support this)")
      }
      
      // figure out the height and width from svg text
      var height = 1000;
      var width = 1000;
      margin = 0;
                          
      // create a canvas element to pass through
      var canvas = document.createElement("canvas");
      canvas.width = height+margin*2;
      canvas.height = width+margin*2;
      var ctx = canvas.getContext("2d");
      
      // make a blob from the svg
      var svg = new Blob([svgText], {
        type: "image/svg+xml;charset=utf-8"
      });
      
      // create a dom object for that image
      var url = domUrl.createObjectURL(svg);
      
      // create a new image to hold it the converted type
      var img = new Image();
      
      // when the image is loaded we can get it as base64 url
      img.onload = function() {
        // draw it to the canvas
        ctx.drawImage(this, margin, margin);
        
        // if it needs some styling, we need a new canvas
        if (fill) {
          var styled = document.createElement("canvas");
          styled.width = canvas.width;
          styled.height = canvas.height;
          var styledCtx = styled.getContext("2d");
          styledCtx.save();
          styledCtx.fillStyle = fill;   
          styledCtx.fillRect(0,0,canvas.width,canvas.height);
          styledCtx.strokeRect(0,0,canvas.width,canvas.height);
          styledCtx.restore();
          styledCtx.drawImage (canvas, 0,0);
          canvas = styled;
        }
        // we don't need the original any more
        domUrl.revokeObjectURL(url);
        // now we can resolve the promise, passing the base64 url
        resolve(canvas.toDataURL());
      };
      
      // load the image
      img.src = url;
      
    } catch (err) {
      // reject('failed to convert svg to png ' + err);
      console.log("ERROR! " + err.message);
    }
  });
};


