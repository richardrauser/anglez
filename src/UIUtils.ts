import { toast } from 'react-toastify';

export function showErrorMessage(message: string, onClick?: (() => void) | undefined) {
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
    onClick: onClick,
  });
}

export function showWarningMessage(message: string) {
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

export function showInfoMessage(message: string) {
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
