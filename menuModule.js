// ========================================================================================
// ================================================================================ imports
const fs = require('fs');

// ---------------------------------------------
// --------------------------------- own modules
const lcdModule = require('./lcdModule');

// ========================================================================================
// ============================================================================= fetch data
const data = fs.readFileSync(`./productosData.json`, 'utf-8');
const dataObject = JSON.parse(data);

// ========================================================================================
// ============================================================================== menu data
const menu = [
  {
    nombre: 'producto1',
    id: 'P1 precio:',
    precio: dataObject.productosInfo.producto1.precio,
  },
  {
    nombre: 'producto2',
    id: 'P2 precio:',
    precio: dataObject.productosInfo.producto2.precio,
  },
  {
    nombre: 'producto3',
    id: 'P3 precio:',
    precio: dataObject.productosInfo.producto3.precio,
  },
  {
    nombre: 'producto4',
    id: 'P4 precio:',
    precio: dataObject.productosInfo.producto4.precio,
  },
  {
    nombre: 'producto5',
    id: 'P5 precio:',
    precio: dataObject.productosInfo.producto5.precio,
  },
  {
    nombre: 'producto6',
    id: 'P6 precio:',
    precio: dataObject.productosInfo.producto6.precio,
  },
  {
    nombre: 'producto1',
    id: 'P1 bomba:',
    bombaSegundos: dataObject.productosInfo.producto1.bombaSegundos,
  },
  {
    nombre: 'producto2',
    id: 'P2 bomba:',
    bombaSegundos: dataObject.productosInfo.producto2.bombaSegundos,
  },
  {
    nombre: 'producto3',
    id: 'P3 bomba:',
    bombaSegundos: dataObject.productosInfo.producto3.bombaSegundos,
  },
  {
    nombre: 'producto4',
    id: 'P4 bomba:',
    bombaSegundos: dataObject.productosInfo.producto4.bombaSegundos,
  },
  {
    nombre: 'producto5',
    id: 'P5 bomba:',
    bombaSegundos: dataObject.productosInfo.producto5.bombaSegundos,
  },
  {
    nombre: 'producto6',
    id: 'P6 bomba:',
    bombaSegundos: dataObject.productosInfo.producto6.bombaSegundos,
  },
];

// ========================================================================================
// ================================================================================ to json
const dataFile = {
  productosInfo: {
    producto1: {
      precio: menu[0].precio,
      bombaSegundos: menu[6].bombaSegundos,
    },
    producto2: {
      precio: menu[1].precio,
      bombaSegundos: menu[7].bombaSegundos,
    },
    producto3: {
      precio: menu[2].precio,
      bombaSegundos: menu[8].bombaSegundos,
    },
    producto4: {
      precio: menu[3].precio,
      bombaSegundos: menu[9].bombaSegundos,
    },
    producto5: {
      precio: menu[4].precio,
      bombaSegundos: menu[10].bombaSegundos,
    },
    producto6: {
      precio: menu[5].precio,
      bombaSegundos: menu[11].bombaSegundos,
    },
  },
};

// ========================================================================================
// =========================================================================== lcd & config
// ---------------------------------------------
// ----------------------------- helper function
let currentScreen = 0;

const printScreenToLCD = () => {
  lcdModule.clearLCD();
  lcdModule.printLCD(0, menu[currentScreen].id);

  if (currentScreen >= 0 && currentScreen <= 5) {
    lcdModule.printLCD(1, `$${menu[currentScreen].precio} pesos`);
  } else {
    lcdModule.printLCD(1, `${menu[currentScreen].bombaSegundos} segundos`);
  }
  return;
};

// ---------------------------------------------
// ------------------------------- input actions
const inputAction = (inputType) => {
  const upValidation = currentScreen >= 0 && currentScreen < 11;

  if (inputType === 'reset') {
    currentScreen = 0;
    printScreenToLCD();
  }

  if (inputType === 'up' && upValidation) {
    currentScreen++;
    printScreenToLCD();
  }

  const plusAndMinusPriceValidation = currentScreen >= 0 && currentScreen < 6;
  const plusAndMinusSecsValidation = currentScreen >= 6 && currentScreen <= 11;

  if (inputType === 'plus' && plusAndMinusPriceValidation) {
    menu[currentScreen].precio++;
    dataFile.productosInfo[menu[currentScreen].nombre].precio =
      menu[currentScreen].precio;
    printScreenToLCD();
  } else if (inputType === 'plus' && plusAndMinusSecsValidation) {
    menu[currentScreen].bombaSegundos++;
    dataFile.productosInfo[menu[currentScreen].nombre].bombaSegundos =
      menu[currentScreen].bombaSegundos;
    printScreenToLCD();
  }

  if (inputType === 'minus' && plusAndMinusPriceValidation) {
    if (menu[currentScreen].precio > 5) {
      menu[currentScreen].precio--;
      dataFile.productosInfo[menu[currentScreen].nombre].precio =
        menu[currentScreen].precio;
      printScreenToLCD();
    }
  } else if (inputType === 'minus' && plusAndMinusSecsValidation) {
    if (menu[currentScreen].bombaSegundos > 5) {
      menu[currentScreen].bombaSegundos--;
      dataFile.productosInfo[menu[currentScreen].nombre].bombaSegundos =
        menu[currentScreen].bombaSegundos;
      printScreenToLCD();
    }
  }
  return;
};

// ========================================================================================
// ================================================================================ exports
module.exports = {
  dataFile: dataFile,
  printScreenToLCD: printScreenToLCD,
  inputAction: inputAction,
};
