// ========================================================================================
// ========================================================================  module imports

const Gpio = require('onoff').Gpio;
const fs = require('fs');
const shell = require('shelljs');

// ---------------------------------------------
// --------------------------------- own modules

const lcdModule = require('./lcdModule');
const pumpsModule = require('./pumpsModule');
const menuModule = require('./menuModule');

// ========================================================================================
// =================================================================================== gpio

let buttonMinus;
let buttonPlus;
let buttonUp;
let buttonSave;

let bombaBtn1;
let bombaBtn2;
let bombaBtn3;
let bombaBtn4;
let bombaBtn5;
let bombaBtn6;

let coinAcceptor;

const exportAll = () => {
  buttonMinus = new Gpio(22, 'in', 'rising', { debounceTimeout: 10 });
  buttonPlus = new Gpio(27, 'in', 'rising', { debounceTimeout: 10 });
  buttonUp = new Gpio(17, 'in', 'rising', { debounceTimeout: 10 });
  buttonSave = new Gpio(4, 'in', 'rising', { debounceTimeout: 10 });

  bombaBtn1 = new Gpio(14, 'in', 'rising');
  bombaBtn2 = new Gpio(15, 'in', 'rising');
  bombaBtn3 = new Gpio(18, 'in', 'rising');
  bombaBtn4 = new Gpio(23, 'in', 'rising');
  bombaBtn5 = new Gpio(24, 'in', 'rising');
  bombaBtn6 = new Gpio(25, 'in', 'rising');

  coinAcceptor = new Gpio(20, 'in', 'falling', { debounceTimeout: 50 });
};

exportAll();

// ========================================================================================
// =============================================================================== shutdown

const unexportAll = () => {
  bombaBtn1.unexport();
  bombaBtn2.unexport();
  bombaBtn3.unexport();
  bombaBtn4.unexport();
  bombaBtn5.unexport();
  bombaBtn6.unexport();

  buttonMinus.unexport();
  buttonPlus.unexport();
  buttonUp.unexport();
  buttonSave.unexport();

  coinAcceptor.unexport();
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
    unexportAll();
    writeToLCD('Cargando', 'Producto...');
    pumpsModule.startPump(producto, segundos);
    setTimeout(() => {
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
  unexportAll();
  const dataToWrite = JSON.stringify(menuModule.dataFile, null, 2);
  writeToLCD('Guardando', 'Datos...');
  fs.writeFileSync('./productosData.json', '');
  fs.writeFileSync('./productosData.json', dataToWrite);
  writeToLCD('Datos', 'Guardados!');
  setTimeout(() => {
    shell.exec('node main.js');
    process.exit(0);
  }, 500);
};

// ========================================================================================
// ============================================================================== listeners

// -----------------------------------
// ---------------------- pump buttons

bombaBtn1.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }

  console.log('p1', value);
  if (value === 1) {
    pumpHandler('producto1');
  }
  return;
});

bombaBtn2.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }
  console.log('p2', value);
  if (value === 1) {
    pumpHandler('producto2');
  }
  return;
});

bombaBtn3.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }
  console.log('p3', value);
  if (value === 1) {
    pumpHandler('producto3');
  }
  return;
});

bombaBtn4.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }
  console.log('p4', value);
  if (value === 1) {
    pumpHandler('producto4');
  }
  return;
});

bombaBtn5.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }
  console.log('p5', value);
  if (value === 1) {
    pumpHandler('producto5');
  }
  return;
});

bombaBtn6.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }
  console.log('p6', value);
  if (value === 1) {
    pumpHandler('producto6');
  }
  return;
});

// -----------------------------------
// --------------------- coin acceptor

coinAcceptor.watch((err, value) => {
  if (err) {
    console.log('There was an error', err);
    return;
  }

  if (value === 0) {
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

buttonMinus.watch((err, value) => {
  if (err) {
    console.error('There was an error', err);
    return;
  }

  console.log(value);
  if (value === 1 && !editing) {
    openConfigMenu();
    console.log('opening menu');
  } else if (value === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('minus');
  }
});

buttonPlus.watch((err, value) => {
  if (err) {
    console.error('There was an error', err);
    return;
  }

  console.log(value);
  if (value === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('plus');
  }
});

buttonUp.watch((err, value) => {
  if (err) {
    console.error('There was an error', err);
    return;
  }

  console.log(value);
  if (value === 1 && editing) {
    console.log('editing');
    menuModule.inputAction('up');
  }
});

buttonSave.watch((err, value) => {
  if (err) {
    console.error('There was an error', err);
    return;
  }

  console.log(value);
  if (value === 1 && editing) {
    console.log('saving');
    menuModule.inputAction('reset');
    saveData();
  }
});

// ========================================================================================
// ================================================================================ on exit

process.on('SIGINT', () => {
  unexportAll();
});
