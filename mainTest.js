// ========================================================================================
// ========================================================================= module imports

const pigpio = require('pigpio');
const fs = require('fs');
const shell = require('shelljs');

const Gpio = pigpio.Gpio;
pigpio.initialize();

// ---------------------------------------------
// ----------------------------------------- lcd

const LCD = require('raspberrypi-liquid-crystal');

const lcd = new LCD(1, 0x27, 16, 2);
lcd.beginSync();

// ---------------------------------------------
// --------------------------------- own modules

const menuModule = require('./menuModule');

// ========================================================================================
// ============================================================================== add gpios

const buttonOptions = { mode: Gpio.INPUT, edge: Gpio.RISING_EDGE, alert: true };
const coinOptions = { mode: Gpio.INPUT, edge: Gpio.FALLING_EDGE, alert: true };
const pumpOptions = { mode: Gpio.OUTPUT };
const ms = 10000;

const buttonMinus = new Gpio(4, buttonOptions);
const buttonPlus = new Gpio(17, buttonOptions);
const buttonUp = new Gpio(27, buttonOptions);
const buttonSave = new Gpio(22, buttonOptions);

const bombaBtn1 = new Gpio(25, buttonOptions);
const bombaBtn2 = new Gpio(24, buttonOptions);
const bombaBtn3 = new Gpio(23, buttonOptions);
const bombaBtn4 = new Gpio(18, buttonOptions);
const bombaBtn5 = new Gpio(15, buttonOptions);
const bombaBtn6 = new Gpio(14, buttonOptions);

const coinAcceptor = new Gpio(20, coinOptions);

const pump1 = new Gpio(26, pumpOptions);
const pump2 = new Gpio(19, pumpOptions);
const pump3 = new Gpio(13, pumpOptions);
const pump4 = new Gpio(6, pumpOptions);
const pump5 = new Gpio(5, pumpOptions);
const pump6 = new Gpio(11, pumpOptions);

pump1.digitalWrite(1);
pump2.digitalWrite(1);
pump3.digitalWrite(1);
pump4.digitalWrite(1);
pump5.digitalWrite(1);
pump6.digitalWrite(1);

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
// ====================================================================== disable all gpios

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
  lcd.clearSync();
  lcd.printLineSync(0, message1);
  lcd.printLineSync(1, message2);
  return;
};

writeToLCD('Gracias por su', 'compra!');
setTimeout(() => {
  writeToLCD('Bienvenido!', 'Inserte monedas');
}, 2000);

// ========================================================================================
// =============================================================== coin acceptor controller

let credit = 0;

const updateCredit = () => {
  credit++;

  if (credit === 1) {
    lcd.clearSync();
    lcd.printLineSync(0, 'Su credito:');
    lcd.printLineSync(1, '$1 peso');
  }

  if (credit > 1) {
    lcd.printLineSync(1, `$${credit} pesos`);
  }

  //   console.log(credit);
};

// ========================================================================================
// ======================================================================= pump controllers

const startPump = (producto, segundos) => {
  if (producto === 'producto1') {
    runPump(pump1, segundos);
  }
  if (producto === 'producto2') {
    runPump(pump2, segundos);
  }
  if (producto === 'producto3') {
    runPump(pump3, segundos);
  }
  if (producto === 'producto4') {
    runPump(pump4, segundos);
  }
  if (producto === 'producto5') {
    runPump(pump5, segundos);
  }
  if (producto === 'producto6') {
    runPump(pump6, segundos);
  }
};

const runPump = (pump, segundos) => {
  pump.digitalWrite(0);
  setTimeout(() => {
    pump.digitalWrite(1);
    return;
  }, segundos);
};

// ========================================================================================
// ================================================================ pump buttons controller

let normalReset = false;

const pumpHandler = (producto) => {
  const precio = dataObject.productosInfo[producto].precio;
  const segundos = dataObject.productosInfo[producto].bombaSegundos * 1000;

  if (credit >= precio) {
    disableAll();
    writeToLCD('Despachando en', '3...');
    setTimeout(() => {
      writeToLCD('Despachando en', '2...');
    }, 1000);
    setTimeout(() => {
      writeToLCD('Despachando en', '1...');
    }, 2000);
    setTimeout(() => {
      lcd.clearSync();
    }, 3000);
    setTimeout(() => {
      try {
        startPump(producto, segundos);
        setTimeout(() => {
          normalReset = true;
          pigpio.terminate();
          process.exit();
        }, segundos);
      } catch {
        console.log('error');
        normalReset = true;
        pigpio.terminate();
        process.exit();
      }
    }, 3100);
  }

  return;
};

// ========================================================================================
// ======================================================================== menu controller

let editing = false;
let isTurningOff = false;
let manuallyExiting = false;

let m = 0;
let off = 0;
let program = 0;

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
    normalReset = true;
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
    }, 200);
  }
};

const exitProgram = () => {
  program++;
  if (program === 3) {
    manuallyExiting = true;
    setTimeout(() => {
      pigpio.terminate();
      process.exit();
    }, 100);
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
    updateCredit();
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
  if (level === 1 && !editing) {
    exitProgram();
    console.log('Exiting safely');
  } else if (level === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('up');
  }
});

buttonSave.on('alert', (level) => {
  console.log(level);
  if (level === 1 && !editing) {
    turnOff();
    console.log('apagando');
  } else if (level === 1 && editing) {
    console.log('saving');
    menuModule.inputAction('reset');
    saveData();
  }
});

// ========================================================================================
// ================================================================================ on exit
let error = false;

process.on('SIGINT', () => {
  pigpio.terminate();
  process.exit();
});

process.on('exit', (code) => {
  // turning off
  if (isTurningOff) {
    console.log('Shutting down...');
    shell.exec('sudo shutdown -h now');
  }

  // normal reset after pumping or saving
  if (normalReset) {
    console.log('Exiting: ', code);
    console.log('Starting...');
    shell.exec('sudo node main.js');
  }

  // exit if in development (must be enabled)
  if (manuallyExiting) {
    pigpio.terminate();
    process.exit();
  }

  // exit if error
  if (error || (error && normalReset)) {
    console.log('ERROR... RESTARTING ', code);
    shell.exec('sudo reboot');
  }
});

process.on('uncaughtException', (error) => {
  console.log('Error: ', error);
  process.exit();
});
