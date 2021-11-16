const bitfont_alphabet = [
  "|", "%", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ",
  "a", "c", "e", "g", "h", "i", "l", "m", "o", "r", "s", "t", "v"
];
const bitfont_characters = [
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // |
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
  [ 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1 ], // c
  [ 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1 ], // e
  [ 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1 ], // g
  [ 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1 ], // h
  [ 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0 ], // i
  [ 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1 ], // l
  [ 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1 ], // m
  [ 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 ], // o
  [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1 ], // r
  [ 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1 ], // s
  [ 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ], // t
  [ 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0 ]  // v
];
const bitfont_kerning = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0
];
let BitmapFont = function(alphabet, characters, kerning, w, h, pixel_size) {
  this.alphabet = alphabet;     // Шрифт алфавита.
  this.characters = characters; // Символы шрифта.
  this.kerning = kerning;       // Кернинг.
  this.w = w;                   // Ширина шрифта.
  this.h = h;                   // Высота шрифта.
  this.pixel_size = pixel_size;

  // Визуализировать одиночный символ в заданной позиции.
  this.render_character = function(context, x, y, char, color) {
    let alphabet_idx = this.alphabet.indexOf(char);
    if (alphabet_idx < 0)
      return 0;

    let bit_char = this.characters[alphabet_idx];

    context.fillStyle = color;
    for (let row = 0; row < this.h; ++row)
      for (let col = 0; col < this.w; ++col)
        if (bit_char[row * this.w + col])
          context.fillRect(x + col * pixel_size, y + row * pixel_size,
                           pixel_size, pixel_size);

    return this.w - this.kerning[alphabet_idx];
  };

  //Визуализировать строку, начиная с заданной позиции.
  this.render_string = function(context, x, y, string, color) {
    let cur_x = x;
    let dx;
    for (let i = 0; i < string.length; ++i) {
      dx = this.render_character(context, cur_x, y, string.charAt(i), color);
      cur_x += (dx + 1) * this.pixel_size;
    }
  };

  //Вычислить ширину символа без его рендеринга.
  this.char_width = function(char) {
    let alphabet_idx = this.alphabet.indexOf(char);
    if (alphabet_idx < 0)
      return 0;

    else
      return (this.w - this.kerning[alphabet_idx]) * this.pixel_size;
  };

  // Вычислить ширину строки без ее фактического рендеринга.
  this.string_width = function(string) {
    let w = 0;
    for (let i = 0; i < string.length; ++i)
      w += this.char_width(string.charAt(i)) + this.pixel_size;
    w -= this.pixel_size;
    return w;
  };
};
let bitfont = new BitmapFont(bitfont_alphabet, bitfont_characters, bitfont_kerning, 3, 5, tileSize);
