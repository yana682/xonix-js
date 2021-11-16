const tileSize = 5; // Размер клетки [px].

const borderWidth = 2; // поле по умолчанию [tiles].

const xonixSpeed = 40; // Скорость передвижения Xonix [tiles/second].
const enemySpeed = 40;  // Скорость передвижения монстра [tiles/second].
const enemySpeedLevel = 1; // Увеличение скорости монстра для каждого уровня [tiles/speed/level].

const fps = 60; // Кадров в секунду [Hz].
const subFrames = 10; // Подкадры для обновления позиций xonix и монстров.

const nextLevel = 0.8; // Доля клеток, которые необходимо запросить для перехода на следующий уровень.

const nMonstersStart = 2;         // Количество монстров на уровне 1.
const nMonstersLevel = 1;       // Количество дополнительных монстров на каждом уровне.
const deleterMonster = 0.25; // Доля монстров-удалителей.
const groundMonster = 0.25; // Доля монстров на заявленной площади.
const monsterPath = Math.PI / 12; // Минимальная наклонность траектории монстра, чтобы избежать монстров параллельно xonix.

const groundMonsterDistanse = 30; // Минимальное расстояние появления заявленного монстра до Xonix.

const normalFactor = 1000; // Коэффициент масштабирования для оценки.

const delay = 0.5; // Задержка перед тем, как разрешить перезапуск после потери одной жизни или очистки уровня [s].

// ПЕРЕЧИСЛЕНИЯ ////////////////////////////////////////////////////////////////

// Константы состояния игры.
const PLAYING = 0; // Игра запущена.
const STATE_PAUSE = 1; // Игра была приостановлена ​​из-за смерти Xonix или очистки уровня.
const STATE_GAMEOVER = 2;     //Игра окончена.
const STATE_INGAME_PAUSE = 3; // Игра была приостановлена ​​вручную.

// Константы направления.
const DIRECTION_IDLE = 0;
const DIRECTION_N = 1;
const DIRECTION_W = 2;
const DIRECTION_S = 3;
const DIRECTION_E = 4;

// Константы статуса клетки.
const GROUND = 0;
const SEA = 1;
const XONIX_TALE = 2;

// Типы монстров.
const SEA_MONSTER = 0; // Обычные монстры, подпрыгивающие в невостребованной области.
const DELETE_MONSTER = 1; //Удаляющий монстр, подпрыгивая в невостребованной области и отбирая заявленные клетки, в которые он попадает.
const GROUND_MONSTER = 2; // монстр прыгает в заявленной области.

// GRAPHICAL PARAMETERS ////////////////////////////////////////////////////////

const colorGround = "#ffffff98";   // Цвет суши
const colorSea = "#170027"; // Цвет моря
const xonixTale = "#808080";      // Цвет следа, оставляемого Xonix
const seaMonster = "#FF7400";  // Цвет морских монстров
const boomMonster = "#FF0086"; // Цвет разрушающих монстров
const colorGroundMonster = "#0013FF"; // Цвет сухопутных монстров

let Field = function() {
  this.state = PLAYING; // Состояние игры.
  this.level = 1;             // Текущий уровень.

  this.w = 0;     // Ширина игры [tiles].
  this.h = 0;     // Высота игры [tiles].
  this.tiles = 0; //Игровые клетки. Массив массивов, первый индекс: строка, последний индекс: столбец.
  this.tilesToGround = 0; // Вспомогательная матрица тайлов для вычисления вновь заявленных клеток.

  this.xonixLives = 6;                  // Счетчик жизней Xonix.
  this.xonixScore = 0;                  // Счет Xonix.
  this.xonixX = 0;                      // Координата Xonix x [tiles].
  this.xonixY = 0;                      // Координата Y Xonix [tiles].
  this.xonixDirection = DIRECTION_IDLE; // Направление Xonix.

  this.monsters = 0; // Массив монстров. Каждая запись имеет формат [x, y, speed_x, speed_y, type].

  this.t = 0;          // Прошедшее игровое время [s].
  this.pauseTime = 0; // Время срабатывания паузы.

  this.ground = 0; // На данный момент является сушей.

  // Метод настройки: создает игровое поле необходимых размеров и настраивает его для игры.
  this.setup = function(w, h) {
    this.setupField(w, h);

    this.state = PLAYING;
    this.level = 1;

    //Поместите Xonix в центр суши вверху.
    this.xonixX = Math.floor(this.w / 2);
    this.xonixY = 0;
    this.xonixDirection = DIRECTION_IDLE;
    this.xonixLives = 6;
    this.xonixScore = 0;

    // Создавайте монстров.
    this.setupMonsters(nMonstersStart);

    // Сбросить время.
    this.t = 0;
  };

  // Поле настройки.
  this.setupField = function(w, h) {
    this.w = w;
    this.h = h;

    this.ground = 0;

    //Создайте игровое поле
    this.tiles = new Array(h);
    this.tilesToGround = new Array(h);
    for (let row = 0; row < this.h; ++row) {
      this.tiles[row] = new Array(w);
      this.tilesToGround[row] = new Array(w);

      for (let col = 0; col < this.w; ++col) {
        if (row < borderWidth || row >= this.h - borderWidth || col < borderWidth || col >= this.w - borderWidth) {
          this.tiles[row][col] = GROUND;
          this.ground++;
        } else
          this.tiles[row][col] = SEA;
      }
    }
  };

  // Настроить монстров.
  this.setupMonsters = function(nMonsters) {
    // если 1 игра или новый уровень, то пересчитываем количество монстров
    this.monsters = new Array(nMonsters);

    // посчитаем количество монстров каждого типа.
    let nDeleters = Math.floor(nMonsters * deleterMonster);//монстров удалитеей четверть от всех
    let nGround = Math.floor(nMonsters * groundMonster);//столько же сколько и удалителей
    let nSea = nMonsters - nDeleters;//морских монстров больше всего, но т.к они в море, то от них нужно отнять удалителей

    // Создавайте новых монстров в случайных позициях и со случайной скоростью.
    for (let i = 0; i < nSea + nDeleters + nGround; ++i) {
      let type = i < nDeleters ? DELETE_MONSTER : (i < (nDeleters + nGround) ? GROUND_MONSTER : SEA_MONSTER);
      let x, y, angle;//монстры не могут двигаться под прямым углом, для этого и нужна переменная angle

      do {
        x = Math.floor(Math.random() * this.w);
        y = Math.floor(Math.random() * this.h);
      } 
      while ((type == GROUND_MONSTER && (this.tiles[y][x] != GROUND || (x - this.xonixX) * (x - this.xonixX) + (y - this.xonixY) * (y - this.xonixY) < groundMonsterDistanse * groundMonsterDistanse)) || (type != GROUND_MONSTER && this.tiles[y][x] != SEA));
      do {
        angle = Math.random() * 2 * Math.PI;
      } 
      while (Math.abs(angle) < monsterPath || Math.abs(angle - Math.PI / 2) < monsterPath || Math.abs(angle - Math.PI) < monsterPath || Math.abs(angle - 3 * Math.PI / 2) < monsterPath || Math.abs(angle - 2 * Math.PI) < monsterPath);
      let speed = enemySpeed + this.level * enemySpeedLevel;
      this.monsters[i] = [ x, y, speed * Math.cos(angle), speed * Math.sin(angle), type ];
    }
  };

  //обновление поля 
  this.update = function(t) {
    if (this.state == PLAYING) {
      // Получите старые координаты клетки.
      let oldTileX = Math.floor(this.xonixX);
      let oldTileY = Math.floor(this.xonixY);

      this.updateXonix(t);

      // Получите новые координаты клетки.
      let newTileX = Math.floor(this.xonixX);
      let newTileY = Math.floor(this.xonixY);

      // прорисовка линии, оставляемой xonix
      if ((oldTileX != newTileX || oldTileY != newTileY) &&
          this.tiles[oldTileY][oldTileX] == SEA) {
        this.tiles[oldTileY][oldTileX] = XONIX_TALE;

        // если линия соединяет 2 суши по морю, то мы превращаем море в сушу
        if (this.tiles[newTileY][newTileX] == GROUND) {
          this.checkNewClaimedArea();
          this.xonixDirection = DIRECTION_IDLE;
          this.xonixX = newTileX;
          this.xonixY = newTileY;
        }

        // Если xonix попадает в свою линию, он умирает.
        if (this.tiles[newTileY][newTileX] == XONIX_TALE)
          this.die();
      }

      this.updateMonsters(t);

     
      this.checkCollisions(); // Проверим столкновения между монстрами и xonix.

      this.t += t;
    }
  };

  // Обновите позицию Xonix.
  this.updateXonix = function(t) {
    // Переместите Xonix.
    let dx = t * xonixSpeed;
    if (this.xonixDirection == DIRECTION_N)
      this.xonixY -= dx;
    else if (this.xonixDirection == DIRECTION_W)
      this.xonixX -= dx;
    else if (this.xonixDirection == DIRECTION_S)
      this.xonixY += dx;
    else if (this.xonixDirection == DIRECTION_E)
      this.xonixX += dx;

    //проверка выхода за игровое поле
    if (this.xonixX < 0) {
      this.xonixX = 0;
      this.xonixDirection = DIRECTION_IDLE;
    }
    if (this.xonixX >= this.w) {
      this.xonixX = this.w - 1;
      this.xonixDirection = DIRECTION_IDLE;
    }
    if (this.xonixY < 0) {
      this.xonixY = 0;
      this.xonixDirection = DIRECTION_IDLE;
    }
    if (this.xonixY >= this.h) {
      this.xonixY = this.h - 1;
      this.xonixDirection = DIRECTION_IDLE;
    }
  };

  // Обновите позиции монстров.
  this.updateMonsters = function(t) {
    for (let i = 0; i < this.monsters.length; ++i) {
      // Тип клетки препятствий.
      let tileWalkable = this.monsters[i][4] == GROUND_MONSTER ? GROUND : SEA;//клетка на которую можно идти
      let tileObstacle = this.monsters[i][4] == GROUND_MONSTER ? SEA : GROUND;//клетка препятствие

      //Переместите монстра.
      this.monsters[i][0] += this.monsters[i][2] * t;
      this.monsters[i][1] += this.monsters[i][3] * t;

      // Вычислить координаты клетки.
      let tileX = Math.floor(this.monsters[i][0]);
      let tileY = Math.floor(this.monsters[i][1]);

      // Окружающая плитка.
      let tile_nw = tileX >= 0 && tileY >= 0 ? this.tiles[tileY][tileX] : tileObstacle;
      let tile_ne = tileX < this.w - 1 && tileY >= 0 ? this.tiles[tileY][tileX + 1] : tileObstacle;
      let tile_sw = tileX >= 0 && tileY < this.h - 1 ? this.tiles[tileY + 1][tileX] : tileObstacle;
      let tile_se = tileX < this.w - 1 && tileY < this.h - 1 ? this.tiles[tileY + 1][tileX + 1] : tileObstacle;

      // Хит флаги.
      let hit_nw = tile_nw != tileWalkable;
      let hit_ne = tile_ne != tileWalkable;
      let hit_sw = tile_sw != tileWalkable;
      let hit_se = tile_se != tileWalkable;

      // Длины проникновения.
      let dn = Math.ceil(this.monsters[i][1]) - tileY;
      let dw = Math.ceil(this.monsters[i][0]) - tileX;
      let ds = tileY - Math.floor(this.monsters[i][0]);
      let de = tileX - Math.floor(this.monsters[i][1]);

      // Максимальная длина проникновения.
      let d_max = Math.max(dn, dw, ds, de);

      // Проверяйте столкновения и устраняйте их.
      if (hit_nw && hit_ne && this.monsters[i][3] < 0) {
        this.monsters[i][3] *= -1;
        this.monsters[i][1] = Math.ceil(this.monsters[i][1]);
      } else if (hit_nw && hit_sw && this.monsters[i][2] < 0) {
        this.monsters[i][2] *= -1;
        this.monsters[i][0] = Math.ceil(this.monsters[i][0]);
      } else if (hit_sw && hit_se && this.monsters[i][3] > 0) {
        this.monsters[i][3] *= -1;
        this.monsters[i][1] = Math.floor(this.monsters[i][1]);
      } else if (hit_ne && hit_se && this.monsters[i][2] > 0) {
        this.monsters[i][2] *= -1;
        this.monsters[i][0] = Math.floor(this.monsters[i][0]);
      } else if (d_max == dn && (tile_nw != tileWalkable || tile_ne != tileWalkable) && this.monsters[i][3] < 0) {
        this.monsters[i][3] *= -1;
        this.monsters[i][1] = Math.ceil(this.monsters[i][0]);
      } else if (d_max == dw && (tile_nw != tileWalkable || tile_sw != tileWalkable) && this.monsters[i][2] < 0) {
        this.monsters[i][2] *= -1;
        this.monsters[i][0] = Math.ceil(this.monsters[i][0]);
      } else if (d_max == ds && (tile_sw != tileWalkable || tile_se != tileWalkable) && this.monsters[i][3] > 0) {
        this.monsters[i][3] *= -1;
        this.monsters[i][1] = Math.floor(this.monsters[i][1]);
      } else if (d_max == de && (tile_ne != tileWalkable || tile_se != tileWalkable) && this.monsters[i][2] > 0) {
        this.monsters[i][2] *= -1;
        this.monsters[i][0] = Math.floor(this.monsters[i][0]);
      }

      if (this.monsters[i][4] == DELETE_MONSTER) {
        if (hit_nw && tileX > 0 && tileY > 0) {
          this.tiles[tileY][tileX] = SEA;
          this.ground--;
        }

        if (hit_ne && tileY > 0 && tileX < this.w - 2) {
          this.tiles[tileY][tileX + 1] = SEA;
          this.ground--;
        }

        if (hit_sw && tileX > 0 && tileY < this.h - 2) {
          this.tiles[tileY + 1][tileX] = SEA;
          this.ground--;
        }

        if (hit_se && tileX < this.w - 2 && tileY < this.h - 2) {
          this.tiles[tileY + 1][tileX + 1] = SEA;
          this.ground--;
        }
      }

      else if (this.monsters[i][4] == SEA_MONSTER) {
        if ((hit_nw && tile_nw == XONIX_TALE) || (hit_ne && tile_ne == XONIX_TALE) || (hit_sw && tile_sw == XONIX_TALE) || (hit_se && tile_se == XONIX_TALE)) {
          this.die();
          break;
        }
      }
    }
  };

  // Проверяйте столкновения между монстрами и линией xonix.
  this.checkCollisions = function() {
    let player_left = this.xonixX;
    let player_right = this.xonixX + 1;
    let player_top = this.xonixY;
    let player_bottom = this.xonixY + 1;

    for (let i = 0; i < this.monsters.length; ++i) {
      let tileX = Math.floor(this.monsters[i][0]);
      let tileY = Math.floor(this.monsters[i][1]);

      // Проверьте, попал ли противник в Xonix.
      if (//this.monsters[i][4] != DELETE_MONSTER &&
          !(player_left >= this.monsters[i][0] + 1 || player_right <= this.monsters[i][0] || player_top >= this.monsters[i][1] + 1 || player_bottom <= this.monsters[i][1])) {
        this.die();
        return;
      }

      // Проверьте, попал ли враг в линию.
      if (this.tiles[tileY][tileX] == XONIX_TALE) {
        this.die();
        return;
      }
    }
  };

  // Смерть Xonix.
  this.die = function() {
    this.xonixLives -= 1;

    if (this.xonixLives > 0)
      this.state = STATE_PAUSE;
    else
      this.state = STATE_GAMEOVER;

    this.xonixDirection = Date.now();
  };

  // Возродить монстров, на суше
  this.respawnGroundMonsters = function() {
    for (let i = 0; i < this.monsters.length; ++i) {
      if (this.monsters[i][4] != GROUND_MONSTER)
        continue;

      let x, y, angle;

      do {
        x = Math.floor(Math.random() * this.w);
        y = Math.floor(Math.random() * this.h);
      } while (this.tiles[y][x] != GROUND ||
               (x - this.xonixX) * (x - this.xonixX) + (y - this.xonixY) * (y - this.xonixY) < groundMonsterDistanse * groundMonsterDistanse);

      do {
        angle = Math.random() * 2 * Math.PI;
      } while (Math.abs(angle) < monsterPath || Math.abs(angle - Math.PI / 2) < monsterPath || Math.abs(angle - Math.PI) < monsterPath || Math.abs(angle - 3 * Math.PI / 2) < monsterPath || Math.abs(angle - 2 * Math.PI) < monsterPath);
      let speed = enemySpeed + this.level * enemySpeedLevel;
      this.monsters[i] = [
        x, y, speed * Math.cos(angle), speed * Math.sin(angle), GROUND_MONSTER
      ];
    }
  };

  // Восстановить игровое состояние после удара по xonix.
  this.startNewLife = function() {
    // очистка линиии
    for (let row = 0; row < this.h; ++row)
      for (let col = 0; col < this.w; ++col)
        if (this.tiles[row][col] == XONIX_TALE)
          this.tiles[row][col] = SEA;

    this.respawnGroundMonsters();

    //Сбросить позицию Xonix.
    this.xonixX = Math.floor(this.w / 2);
    this.xonixY = 0;
    this.xonixDirection = DIRECTION_IDLE;

    this.state = PLAYING;
  };

  // Перейти на следующий уровень.
  this.startNewLevel = function() {
    this.level++;
    this.t = 0;
    this.setupField(this.w, this.h);

    this.xonixX = Math.floor(this.w / 2);
    this.xonixY = 0;
    this.xonixDirection = DIRECTION_IDLE;

    this.setupMonsters(nMonstersStart + (this.level - 1) * nMonstersLevel);
    this.startNewLife();
  };

  //Метод рисования.
  this.draw = function(context) {
    context.fillStyle = colorSea;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    //Нарисуйте клетки.
    for (let row = 0; row < this.h; ++row) {
      for (let col = 0; col < this.w; ++col) {
        if (this.tiles[row][col] == SEA)
          continue;

        switch (this.tiles[row][col]) {
        case GROUND:
          context.fillStyle = colorGround;
          break;
        case XONIX_TALE:
          context.fillStyle = xonixTale;
          break;
        }
        context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }

    // Нарисуйте Xonix.
    switch (this.tiles[Math.floor(this.xonixY)][Math.floor(this.xonixX)]) {
    case GROUND:
      context.fillStyle = colorSea;
      break;
    case SEA:
    case XONIX_TALE:
      context.fillStyle = colorGround;
      break;
    }
    context.fillRect(Math.floor(this.xonixX) * tileSize, Math.floor(this.xonixY) * tileSize, tileSize, tileSize);

    // Нарисуйте монстров.
    for (let i = 0; i < this.monsters.length; ++i) {
      switch (this.monsters[i][4]) {
      case SEA_MONSTER:
        context.fillStyle = seaMonster;
        break;
      case DELETE_MONSTER:
        context.fillStyle = boomMonster;
        break;
      case GROUND_MONSTER:
        context.fillStyle = colorGroundMonster;
        break;
      }

      context.fillRect(Math.floor(this.monsters[i][0] * tileSize), Math.floor(this.monsters[i][1] * tileSize), tileSize, tileSize);
    }
  };

  // Проверьте новые заявленные области. Превращает все линейные клетки в заявленные клетки, а затем заявляет права на все невостребованные области, в которых нет монстров.
  this.checkNewClaimedArea = function() {
    let groundNew = 0;

    // Сначала заберите все клетки линии.
    for (let row = 0; row < this.h; ++row) {
      for (let col = 0; col < this.w; ++col) {
        if (this.tiles[row][col] == XONIX_TALE) {
          this.tiles[row][col] = GROUND;
          groundNew++;
        }
      }
    }

    // Затем заберите те клетки, к которым враги не могут добраться. Такие клетки вычисляются путем заполнения ведра tile_to_claim с использованием монстров в качестве семян.
    for (let row = 0; row < this.h; ++row)
      for (let col = 0; col < this.w; ++col)
        this.tilesToGround[row][col] = true;

    // Расставляйте семена в соответствии с монстрами.
    for (let i = 0; i < this.monsters.length; ++i)
      if (this.monsters[i][4] != GROUND_MONSTER)
        this.tilesToGround[Math.floor(this.monsters[i][1])][Math.floor(
            this.monsters[i][0])] = false;

    //Ведро-наполнение.
    let changed = true;
    let count = 0;
    while (changed) {
      changed = false;
      ++count;
      for (let row = 0; row < this.h; ++row) {
        for (let col = 0; col < this.w; ++col) {
          if (!this.tilesToGround[row][col] || this.tiles[row][col] == GROUND)
            continue;

          if ((row > 1 && !this.tilesToGround[row - 1][col]) || (row < this.h - 1 && !this.tilesToGround[row + 1][col]) || (col > 1 && !this.tilesToGround[row][col - 1]) || (col < this.w - 1 && !this.tilesToGround[row][col + 1])) {
            this.tilesToGround[row][col] = false;
            changed = true;
          }
        }
      }
    }

    this.ground = 0;

    // Перенести изменения из tile_to_claim в клетки
    for (let row = 0; row < this.h; ++row) {
      for (let col = 0; col < this.w; ++col) {
        if (this.tilesToGround[row][col] &&
            this.tiles[row][col] != GROUND) {
          this.tiles[row][col] = GROUND;
          groundNew++;
        }
        if (this.tiles[row][col] == GROUND)
          this.ground++;
      }
    }

    // Обновить счет.
    this.xonixScore += Math.ceil(Math.pow(groundNew, 1.5) / normalFactor / Math.pow(this.t, 0.5)) * Math.pow(2, this.level - 1);
    localStorage.hiscore_ = Math.max(this.xonixScore, localStorage.hiscore_);

    if (this.ground / (this.w * this.h) > nextLevel) {
      this.state = STATE_PAUSE;
      this.xonixDirection = Date.now();
    }
  }
};

// КОНТРОЛЬ ИГРОВОГО ПОТОКА ///////////////////////////////////////////////////////////

let main_canvas = 0;      // Игровое полотно.
let main_context = 0;     // 2D-контекст игрового холста.
let status_canvas_1 = 0;  // Холст состояния.
let status_context_1 = 0; // 2D-контекст холста состояния.
let status_canvas_2 = 0;  // Холст состояния.
let status_context_2 = 0; // 2D-контекст холста состояния.

// Game field.
let field = 0;

// Растровый шрифт.

// Метод настройки.
let setup = function() {
  //Сбросьте hiscore, если не нашли.
  if (localStorage.hiscore_ == undefined)
    localStorage.hiscore_ = 0;

  // Получить элементы холста.
  main_canvas = document.getElementById("main-canvas");
  main_context = main_canvas.getContext("2d");
  status_canvas_1 = document.getElementById("status-canvas-1");
  status_context_1 = status_canvas_1.getContext("2d");
  status_canvas_2 = document.getElementById("status-canvas-2");
  status_context_2 = status_canvas_2.getContext("2d");

  // Настроить игровое поле.
  field = new Field();
  field.setup(main_canvas.width / tileSize, main_canvas.height / tileSize);

  // Зарегистрируйте события keydown для движения Xonix.
  document.onkeydown = function(e) {
    switch (field.state) {
    case PLAYING:
      let old_direction = field.xonixDirection;
      switch (e.code) {
      case "ArrowUp":
        field.xonixDirection = DIRECTION_N;
        break;
      case "ArrowLeft":
        field.xonixDirection = DIRECTION_W;
        break;
      case "ArrowDown":
        field.xonixDirection = DIRECTION_S;
        break;
      case "ArrowRight":
        field.xonixDirection = DIRECTION_E;
        break;
      case "KeyP":
        field.state = STATE_INGAME_PAUSE;
        field.xonixDirection = Date.now();
        break;
      }
      if (old_direction != field.xonixDirection) {
        field.xonixX = Math.floor(field.xonixX);
        field.xonixY = Math.floor(field.xonixY);
      }
      break;

    case STATE_PAUSE:
      if (Date.now() - field.xonixDirection > 1000 * delay) {
        if (field.ground / (field.w * field.h) > nextLevel)
          field.startNewLevel();
        else
          field.startNewLife();
      }
      break;

    case STATE_INGAME_PAUSE:
      if (Date.now() - field.xonixDirection > 1000 * delay)
        field.state = STATE_PLAYING;
      break;

    case STATE_GAMEOVER:
      if (Date.now() - field.xonixDirection > 1000 * delay) {
        field.setup(main_canvas.width / tileSize, main_canvas.height / tileSize);
      }
      break;
    }
  };

  last_update_time = Date.now();
  setInterval(update, 1000 / fps);
  setInterval(draw, 1000 / fps);
};

// Обновите метод состояния игры.
let last_update_time = 0;
let update = function() {
  let t = Date.now();
  let dt = (t - last_update_time) / 1000 / subFrames;

  for (i = 0; i < subFrames; ++i)
    field.update(dt);

  last_update_time = t;
};

//Рисуем игровой метод.
let draw = function() {
  field.draw(main_context);

  status_context_1.fillStyle = colorSea;
  status_context_1.fillRect(0, 0, status_canvas_1.width, status_canvas_1.height);
  status_context_2.fillStyle = colorSea;
  status_context_2.fillRect(0, 0, status_canvas_2.width, status_canvas_2.height);

  // Draw status 1
  let livesStr = "";
  for (let i = 0; i < field.xonixLives; ++i)
    livesStr += "|";
  if (livesStr == "")
    livesStr = "game over";
  let claimed_str = Math.floor(field.ground / (field.w * field.h) * 100).toString() + "%";
  let claimed_str_w = bitfont.string_width(claimed_str);
  let score_str = field.xonixScore.toString();
  let score_str_w = bitfont.string_width(score_str);

  bitfont.render_string(status_context_1, 0, 0, livesStr, colorGround);
  bitfont.render_string(status_context_1, status_canvas_1.width - claimed_str_w, 0, claimed_str, colorGround);
  bitfont.render_string(status_context_1, Math.floor((status_canvas_1.width - score_str_w) / 2), 0, score_str, colorGround);

  // Draw status 2
  let level_str = "level " + field.level.toString();
  let hiscore_str = "hiscore " + localStorage.hiscore_.toString();
  let hiscore_str_w = bitfont.string_width(hiscore_str);
  let time_str = "time " + Math.floor(field.t).toString();
  let time_str_w = bitfont.string_width(time_str);

  bitfont.render_string(status_context_2, 0, 0, level_str, colorGround);
  bitfont.render_string(status_context_2, status_canvas_2.width - hiscore_str_w, 0, hiscore_str, colorGround);
  bitfont.render_string(status_context_2, Math.floor((status_canvas_2.width - time_str_w) / 2) - 70,  0, time_str, colorGround);
};



/*
у меня лапки
buttonUp.onclick = function () {
            xonixGame.setDirection(xonixGame.directions.up);
        };
        buttonLeft.onclick = function () {
            xonixGame.setDirection(xonixGame.directions.left);
        };
        buttonRight.onclick = function () {
            xonixGame.setDirection(xonixGame.directions.right);
        };
        buttonDown.onclick = function () {
            xonixGame.setDirection(xonixGame.directions.bottom);
        };
    });

    xonixGame.start(1, true);
}
*/
