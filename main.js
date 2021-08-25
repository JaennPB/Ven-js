// ========================================================================================
// ========================================================================  module imports

const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;
const fs = require('fs');
const shell = require('shelljs');

pigpio.initialize();

// ---------------------------------------------
// --------------------------------- own modules

const lcdModule = require('./lcdModule');
const pumpsModule = require('./pumpsModule');
const menuModule = require('./menuModule');

// ========================================================================================
// =================================================================================== gpio

const buttonOptions = {};

const buttonMinus = new Gpio(22, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const buttonPlus = new Gpio(27, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const buttonUp = new Gpio(17, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const buttonSave = new Gpio(4, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});

const bombaBtn1 = new Gpio(14, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const bombaBtn2 = new Gpio(15, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const bombaBtn3 = new Gpio(18, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const bombaBtn4 = new Gpio(23, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const bombaBtn5 = new Gpio(24, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});
const bombaBtn6 = new Gpio(25, {
  mode: Gpio.INPUT,
  edge: Gpio.RISING_EDGE,
  alert: true,
});

const coinAcceptor = new Gpio(20, {
  mode: Gpio.INPUT,
  edge: Gpio.FALLING_EDGE,
  alert: true,
});

buttonMinus.glitchFilter(10000);
buttonPlus.glitchFilter(10000);
buttonUp.glitchFilter(10000);
buttonSave.glitchFilter(10000);

bombaBtn1.glitchFilter(10000);
bombaBtn2.glitchFilter(10000);
bombaBtn3.glitchFilter(10000);
bombaBtn4.glitchFilter(10000);
bombaBtn5.glitchFilter(10000);
bombaBtn6.glitchFilter(10000);

coinAcceptor.glitchFilter(10000);

// ========================================================================================
// =============================================================================== shutdown

const disableAll = () => {
  bombaBtn1.disableAlert();
  bombaBtn2.disableAlert();
  bombaBtn3.disableAlert();
  bombaBtn4.disableAlert();
  bombaBtn5.disableAlert();
  bombaBtn6.disableAlert();

  buttonMinus.disableAlert();
  buttonPlus.disableAlert();
  buttonUp.disableAlert();
  buttonSave.disableAlert();

  coinAcceptor.disableAlert();
};

// ========================================================================================
// ============================================================================== read data

let dataObject;

const readData = () => {
  const data = fs.readFileSync('./productosData.json', 'utf-8');
  dataObject = JSON.parse(data);
  return;
};

readData();

// ========================================================================================
// ==================================================================== LCD helper function

const writeToLCD = (message1, message2) => {
  lcdModule.clearLCD();
  lcdModule.printLCD(0, message1);
  lcdModule.printLCD(1, message2);
  return;
};

writeToLCD('Bienvenido!', 'Inserte monedas');

// ========================================================================================
// =============================================================== coin acceptor controller

let impulses = 0;
let credit = 0;
let i = 0;
let loop;

const startLoop = () => {
  loop = setInterval(() => {
    i++;
    console.log('i:', i);

    if (i > 3) {
      stopLoop();
      i = 0;
      impulses = 0;
      credit = 0;
      writeToLCD('Error con moneda', 'Inserte de nuevo');
    }

    if (impulses === 2 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 1;
      setTimeout(() => {
        writeToLCD(
          'Su credito:',
          `$${credit} ${credit === 1 ? 'peso' : 'pesos'}`
        );
        // console.log('tu credito: ', credit);
        return;
      }, 50);
    }

    if (impulses === 3 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 2;
      setTimeout(() => {
        writeToLCD('Su credito:', `$${credit} pesos`);
        // console.log('tu credito: ', credit);
        return;
      }, 50);
    }

    if (impulses === 4 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 5;
      setTimeout(() => {
        writeToLCD('Su credito', `$${credit} pesos`);
        // console.log('tu credito: ', credit);
        return;
      }, 50);
    }

    if (impulses === 5 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 10;
      setTimeout(() => {
        writeToLCD('Su credito', `$${credit} pesos`);
        // console.log('tu credito: ', credit);
        return;
      }, 50);
    }
  }, 200);
};

const stopLoop = () => {
  clearInterval(loop);
  return;
};

// ========================================================================================
// ================================================================= pump buttons controller

const pumpHandler = (producto) => {
  const precio = dataObject.productosInfo[producto].precio;
  const segundos = dataObject.productosInfo[producto].bombaSegundos * 1000;

  if (credit >= precio) {
    disableAll();
    writeToLCD('Cargando', 'Producto...');
    pumpsModule.startPump(producto, segundos);
    setTimeout(() => {
      pigpio.terminate();
      shell.exec('node main.js');
      process.exit(0);
    }, segundos);
  }

  return;
};

// ========================================================================================
// ======================================================================== menu controller

let editing = false;
let m = 0;

const openConfigMenu = () => {
  m++;
  if (m === 3) {
    editing = true;
    m = 0;
    menuModule.inputAction('reset');
  }
};

const saveData = () => {
  editing = false;
  disableAll();
  const dataToWrite = JSON.stringify(menuModule.dataFile, null, 2);
  writeToLCD('Guardando', 'Datos...');
  fs.writeFileSync('./productosData.json', '');
  fs.writeFileSync('./productosData.json', dataToWrite);
  writeToLCD('Datos', 'Guardados!');
  setTimeout(() => {
    pigpio.terminate();
    shell.exec('sudo node main.js');
    process.exit(0);
  }, 500);
};

// ========================================================================================
// ============================================================================== listeners

// -----------------------------------
// ---------------------- pump buttons

bombaBtn1.on('alert', (level) => {
  console.log('p1', level);
  if (level === 1) {
    pumpHandler('producto1');
  }
  return;
});

bombaBtn2.on('alert', (level) => {
  console.log('p2', level);
  if (level === 1) {
    pumpHandler('producto2');
  }
  return;
});

bombaBtn3.on('alert', (level) => {
  console.log('p3', level);
  if (level === 1) {
    pumpHandler('producto3');
  }
  return;
});

bombaBtn4.on('alert', (level) => {
  console.log('p4', level);
  if (level === 1) {
    pumpHandler('producto4');
  }
  return;
});

bombaBtn5.on('alert', (level) => {
  console.log('p5', level);
  if (level === 1) {
    pumpHandler('producto5');
  }
  return;
});

bombaBtn6.on('alert', (level) => {
  console.log('p6', level);
  if (level === 1) {
    pumpHandler('producto6');
  }
  return;
});

// -----------------------------------
// --------------------- coin acceptor

coinAcceptor.on('alert', (level) => {
  if (level === 0) {
    impulses++;
    console.log('Impulses:', impulses);

    if (impulses === 1) {
      setTimeout(() => {
        startLoop();
      }, 500);
    }
  }
});

// -----------------------------------
// ---------------------- menu buttons

buttonMinus.on('alert', (level) => {
  console.log(level);
  if (level === 1 && !editing) {
    openConfigMenu();
    console.log('opening menu');
  } else if (level === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('minus');
  }
});

buttonPlus.on('alert', (level) => {
  console.log(level);
  if (level === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('plus');
  }
});

buttonUp.on('alert', (level) => {
  console.log(level);
  if (level === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('up');
  }
});

buttonSave.on('alert', (level) => {
  console.log(level);
  if (level === 1 && editing) {
    console.log('saving');
    menuModule.inputAction('reset');
    saveData();
  }
});

// ========================================================================================
// ================================================================================ on exit

process.on('SIGINT', () => {
  pigpio.terminate();
  process.exit(0);
});
