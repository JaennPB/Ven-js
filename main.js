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

const buttonOptions = { mode: Gpio.INPUT, edge: Gpio.RISING_EDGE, alert: true };
const coinOptions = { mode: Gpio.INPUT, edge: Gpio.FALLING_EDGE, alert: true };
const ms = 10000;

const buttonMinus = new Gpio(22, buttonOptions);
const buttonPlus = new Gpio(27, buttonOptions);
const buttonUp = new Gpio(17, buttonOptions);
const buttonSave = new Gpio(4, buttonOptions);

const bombaBtn1 = new Gpio(14, buttonOptions);
const bombaBtn2 = new Gpio(15, buttonOptions);
const bombaBtn3 = new Gpio(18, buttonOptions);
const bombaBtn4 = new Gpio(23, buttonOptions);
const bombaBtn5 = new Gpio(24, buttonOptions);
const bombaBtn6 = new Gpio(25, buttonOptions);

const coinAcceptor = new Gpio(20, coinOptions);

buttonMinus.glitchFilter(ms);
buttonPlus.glitchFilter(ms);
buttonUp.glitchFilter(ms);
buttonSave.glitchFilter(ms);

bombaBtn1.glitchFilter(ms);
bombaBtn2.glitchFilter(ms);
bombaBtn3.glitchFilter(ms);
bombaBtn4.glitchFilter(ms);
bombaBtn5.glitchFilter(ms);
bombaBtn6.glitchFilter(ms);

coinAcceptor.glitchFilter(ms);

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
  setTimeout(() => {
    lcdModule.clearLCD();
    lcdModule.printLCD(0, message1);
    lcdModule.printLCD(1, message2);
  }, 50);
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
    console.log('i: ', i);

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
      console.log('Your credit: ', credit);
      writeToLCD(
        'Su credito:',
        `$${credit} ${credit === 1 ? 'peso' : 'pesos'}`
      );
    }

    if (impulses === 3 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 2;
      console.log('Your credit: ', credit);
      writeToLCD('Su credito:', `$${credit} pesos`);
    }

    if (impulses === 4 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 5;
      console.log('Your credit: ', credit);
      writeToLCD('Su credito', `$${credit} pesos`);
    }

    if (impulses === 5 && i === 3) {
      stopLoop();
      impulses = 0;
      i = 0;
      credit = credit + 10;
      console.log('Your credit: ', credit);
      writeToLCD('Su credito', `$${credit} pesos`);
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
      process.exit();
    }, segundos);
  }

  return;
};

// ========================================================================================
// ======================================================================== menu controller

let editing = false;
let m = 0;
let off = 0;
let isTurningOff = false;

const openConfigMenu = () => {
  m++;
  if (m === 3) {
    editing = true;
    m = 0;
    menuModule.inputAction('reset');
  }
};

const saveData = () => {
  disableAll();
  editing = false;
  const dataToWrite = JSON.stringify(menuModule.dataFile, null, 2);

  fs.writeFileSync('./productosData.json', '');
  fs.writeFileSync('./productosData.json', dataToWrite);
  writeToLCD('Guardando...', 'Espere');

  setTimeout(() => {
    pigpio.terminate();
    process.exit();
  }, 100);
};

const turnOff = () => {
  off++;
  if (off === 3) {
    writeToLCD('Apagando, espere', `15 segundos`);
    isTurningOff = true;
    setTimeout(() => {
      pigpio.terminate();
      process.exit();
    }, 50);
  }
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

    if (impulses === 2) {
      startLoop();
    }
  }
  return;
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
  if (level === 1 && !editing) {
    turnOff();
    console.log('apagando');
  }
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
  process.exit();
});

process.on('exit', (code) => {
  if (isTurningOff) {
    console.log('Shutting down...');
    shell.exec('sudo shutdown -h now');
  }

  console.log('Exiting: ', code);
  console.log('Starting...');
  shell.exec('sudo node main.js');
});
