//отрисовка пиксельного текста на главном канвасе

//массив использованных буков и цифр
const bitfontAlphabet = [
  "|", "%", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ",
  "a", "e", "g", "i", "l", "m", "o", "r", "t", "v"
];
//отрисовка пикселями алфавита
//3 столбца и 4 строки, 1 закрашенный пиксель, 0 незакрашенный
const bitfontCharacters = [
  [ 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0 ], // жизни
  [ 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1 ], // %
  [ 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 ], // 0
  [ 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ], // 1
  [ 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1 ], // 2
  [ 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1 ], // 3
  [ 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1 ], // 4
  [ 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1 ], // 5
  [ 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1 ], // 6
  [ 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1 ], // 7
  [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1 ], // 8
  [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1 ], // 9
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // <space>
  [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1 ], // a
  [ 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1 ], // e
  [ 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1 ], // g
  [ 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0 ], // i
  [ 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1 ], // l
  [ 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1 ], // m
  [ 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 ], // o
  [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1 ], // r
  [ 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ], // t
  [ 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0 ]  // v
];
//изменение интервала между буквами, чтобы небыло наложения
const bitfontKerning = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
];
//класс отрисовки и её параметры
let BitmapFont = function(alphabet, characters, kerning, w, h, pixelSize) {
  this.alphabet = alphabet;     // Шрифт алфавита.
  this.characters = characters; // Символы шрифта.
  this.kerning = kerning;       // Кернинг.
  this.w = w;                   // Ширина шрифта.
  this.h = h;                   // Высота шрифта.
  this.pixelSize = pixelSize;

  // Визуализируем символ в нужной позиции
  this.renderCharacter = function(context, x, y, char, color) {
    let alphabetIdx = this.alphabet.indexOf(char);
    if (alphabetIdx < 0)
      return 0;

    let bit = this.characters[alphabetIdx];

    context.fillStyle = color;  //закрашивание(происходит в другом скрипте)
    for (let row = 0; row < this.h; ++row)   //для отрисовки рядов
      for (let col = 0; col < this.w; ++col) //для отрисовки столбцов
        if (bit[row * this.w + col])
          context.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);//заполнение

    return this.w - this.kerning[alphabetIdx];
  };
  //визуализируем строку
  this.renderString = function(context, x, y, string, color) {
    let curX = x;
    let dx;
    for (let i = 0; i < string.length; ++i) {
      dx = this.renderCharacter(context, curX, y, string.charAt(i), color);
      curX += (dx + 1) * this.pixelSize;
    }
  };
  //вычисление ширины символа
  this.charWidth = function(char) {
    let alphabetIdx = this.alphabet.indexOf(char);
    if (alphabetIdx < 0)
      return 0;

    else
      return (this.w - this.kerning[alphabetIdx]) * this.pixelSize;
  };
  //вычисление ширины строки для дальнейшего размещения текста
  this.stringWidth = function(string) {
    let w = 0;
    for (let i = 0; i < string.length; ++i)
      w += this.charWidth(string.charAt(i)) + this.pixelSize;
    w -= this.pixelSize;
    return w;
  };
};
//последние 3 параметра это ширина шрифта в клтках, высота в клетках и размер клетки
let bitfont = new BitmapFont(bitfontAlphabet, bitfontCharacters, bitfontKerning, 3, 5, 5);
