// ========================================================================================
// ==================================================================== own  module imports

const Gpio = require('onoff').Gpio;

// ========================================================================================
// ========================================================================= button actions

exports.startPump = (producto, segundos) => {
  if (producto === 'producto1') {
    const bomba1 = new Gpio(26, 'high');

    runPump(bomba1, segundos);
  }
  if (producto === 'producto2') {
    const bomba2 = new Gpio(19, 'high');

    runPump(bomba2, segundos);
  }
  if (producto === 'producto3') {
    const bomba3 = new Gpio(13, 'high');

    runPump(bomba3, segundos);
  }
  if (producto === 'producto4') {
    const bomba4 = new Gpio(6, 'high');

    runPump(bomba4, segundos);
  }
  if (producto === 'producto5') {
    const bomba5 = new Gpio(5, 'high');

    runPump(bomba5, segundos);
  }
  if (producto === 'producto6') {
    const bomba6 = new Gpio(11, 'high');

    runPump(bomba6, segundos);
  }
};

const runPump = (bomba, segundos) => {
  bomba.writeSync(0);

  setTimeout(() => {
    bomba.writeSync(1);
    return;
  }, segundos);
};
