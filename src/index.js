const nMonstersStart = 2; // Количество монстров на уровне 1.
const monsterPath = Math.PI / 12; // Минимальная наклонность траектории монстра, чтобы избежать монстров параллельно xonix.
const place = 0; //стоит на месте
const up = 1;
const left = 2;   
const down = 3;
const right = 4;

const theGround = 0;
const theSea = 1;   
const xonixTale = 2; 

const seaMonster = 0; // Обычные монстры, подпрыгивающие в невостребованной области.
const deleteMonster = 1; //Удаляющий монстр, подпрыгивая в невостребованной области и отбирая заявленные клетки, в которые он попадает.
const groundMonster = 2; // монстр прыгает в заявленной области.

//---------------model----------------
//здесь храним все игровые переменные
class baseModel {
    state = 0; // игра запущена
    level = 1; // Текущий уровень.

    w = 0; // Ширина игры [клеток].
    h = 0; // Высота игры [клеток].
    tiles = 0; //Игровые клетки. Массив массивов, первый индекс: строка, последний индекс: столбец.
    tilesToGround = 0; // Вспомогательная матрица тайлов для вычисления вновь заявленных клеток.

    xonixLives = 6; // Счетчик жизней Xonix.
    xonixScore = 0; // Счет Xonix.
    xonixX = 0; // Координата Xonix x [клеток].
    xonixY = 0; // Координата Y Xonix [клеток].
    xonixDirection = place; // Направление Xonix.

    monsters = 0; // Массив монстров. Каждая запись имеет формат [x, y, speed_x, speed_y, type].

    t = 0; // Прошедшее игровое время [s].
    pauseTime = 0; // Время срабатывания паузы.

    ground = 0; // На данный момент является сушей.

    lastUpdateTime = 0;
}
//---------------viev----------------
//храним и перерисовываем всю визуальную составляющую игры
class baseViews extends baseModel {
  //обновление времени
    updateView = function () {
    let t = Date.now();
    let dt = (t - field.lastUpdateTime) / 1000 / 12;

    for (let i = 0; i < 12; ++i) field.update(dt);

    field.lastUpdateTime = t;
};

    //дополняем игровое поле тонкими канвасами, визуализирующими данные об игре
    drawView = function () {
    field.draw(mainContext);
    //отрисовываем верхний канвас
    apperContext1.fillStyle = '#170027';
    apperContext1.fillRect(
        0,
        0,
        apperCanvas1.width,
        apperCanvas1.height
    );
    //отрисовываем нижний канвас
    apperContext2.fillStyle = '#170027';
    apperContext2.fillRect(
        0,
        0,
        apperCanvas2.width,
        apperCanvas2.height
    );

    //заполняем верхний канвас элементами игрового интерфейса
    //в нём находятся количество жизней, счёт и процент заполнения поля
    let livesStr = '';
    for (let i = 0; i < field.xonixLives; ++i) livesStr += '|';
    if (livesStr == '') livesStr = 'game over';
    let groundStr = Math.floor((field.ground / (field.w * field.h)) * 100).toString() + '%';
    let groundStrW = bitfont.stringWidth(groundStr);
    let scoreStr = field.xonixScore.toString();
    let scoreStrW = bitfont.stringWidth(scoreStr);

    bitfont.renderString(apperContext1, 0, 0, livesStr, '#FF0086');
    bitfont.renderString(
        apperContext1,
        apperCanvas1.width - groundStrW,
        0,
        groundStr,
        '#ffffff98'
    );
    bitfont.renderString(
        apperContext1,
        Math.floor((apperCanvas1.width - scoreStrW) / 2),
        0,
        scoreStr,
        '#ffffff98'
    );

    //заполняем нижний канвас элементами игрового интерфейса
    //внём находятся данные об уровне и о времени проведённом на нём
    let levelStr = 'level ' + field.level.toString();
    let timeStr = 'time ' + Math.floor(field.t).toString();
    let timeStrW = bitfont.stringWidth(timeStr);

    bitfont.renderString(apperContext2, 0, 0, levelStr, '#ffffff98');
    bitfont.renderString(
        apperContext2,
        Math.floor(apperCanvas2.width - timeStrW),
        0,
        timeStr,
        '#ffffff98'
    );
};
}

//---------------controller----------------
//слушатели, игровая логика
class baseController extends baseViews {
    view = null;
    model = null;

    constructor (modelO, viewO) {
        super();

        this.conrolXonix();
        this.view = viewO;
    }

    //здесь создает игровое поле необходимых размеров и параметров
    setup = function (w, h) {
        this.setupField(w, h);

        this.state = 0;
        this.level = 1;

        //поместим Xonix в центр суши вверху.
        this.xonixX = Math.floor(this.w / 2);
        this.xonixY = 0;
        this.xonixDirection = place;
        this.xonixLives = 6;
        this.xonixScore = 0;
        //создадим 2 морских монстров на 1 уровне
        this.setupMonsters(2); //монстры на 1 уровне
        //сбросили время, т.к. уровень с самого начала
        this.t = 0;
    };

    //создаём игровое поле
    setupField = function (w, h) {
        this.w = w;
        this.h = h;
        this.ground = 0;

        //игрвое поле представляет собой табличку, в которой 
        //col - колонки, row - ряды
        this.tiles = new Array(h);
        this.tilesToGround = new Array(h);//заполняем массив клетками
        for (let row = 0; row < this.h; ++row) {
            this.tiles[row] = new Array(w);
            this.tilesToGround[row] = new Array(w);

            for (let col = 0; col < this.w; ++col) {
                if (row < 2 || row >= this.h - 2 ||
                    col < 2 || col >= this.w - 2
                ) {
                    //определяем границы поля
                    this.tiles[row][col] = theGround;
                    this.ground++;
                } else this.tiles[row][col] = theSea;
            }
        }
    };

    //настройка игровых монстров
    setupMonsters = function (nMonsters) {
        //если 1 игра или новый уровень, то пересчитываем количество монстров
        this.monsters = new Array(nMonsters);
        //посчитаем количество монстров каждого типа.
        let nDeleters = Math.floor(nMonsters * 0.25); //монстров удалитеей четверть от всех
        let nGround = Math.floor(nMonsters * 0.25); //столько же сколько и удалителей
        let nSea = nMonsters - nDeleters; //морских монстров больше всего, но т.к они в море, то от них нужно отнять удалителей

        //монстры создаются в случайных местах с случайной скоростью
        for (let i = 0; i < nSea + nDeleters + nGround; ++i) {
            let type = i < nDeleters ? deleteMonster : i < nDeleters + nGround ? groundMonster : seaMonster;
            let x, y, angle; //монстры не могут двигаться под прямым углом, для этого и нужна переменная angle
            do {
                x = Math.floor(Math.random() * this.w);
                y = Math.floor(Math.random() * this.h);
            } while (//расположить монстров
                (type == groundMonster &&
                    (this.tiles[y][x] != theGround ||
                        (x - this.xonixX) * (x - this.xonixX) +
                            (y - this.xonixY) * (y - this.xonixY) <
                            30 * 30)) ||
                (type != groundMonster && this.tiles[y][x] != theSea)
            );
            do {//движение монстров под углом
                angle = Math.random() * 2 * Math.PI;
            } while (
                Math.abs(angle) < monsterPath ||
                Math.abs(angle - Math.PI / 2) < monsterPath ||
                Math.abs(angle - Math.PI) < monsterPath ||
                Math.abs(angle - (3 * Math.PI) / 2) < monsterPath ||
                Math.abs(angle - 2 * Math.PI) < monsterPath
            );
            let speed = 40; //скорость передвижения монстров
            this.monsters[i] = [//массив монстров
                x,
                y,
                speed * Math.cos(angle),
                speed * Math.sin(angle),
                type,
            ];
        }
    };

    //обновление поля
    update = function (t) {
        if (this.state == 0) {
            // если игра запущена
            // получаем старые координаты клеток.
            let oldTileX = Math.floor(this.xonixX);
            let oldTileY = Math.floor(this.xonixY);

            this.updateXonix(t);//обновление позиции ксоникса в зависимости от времени
            // получаем новые координаты клетки.
            let newTileX = Math.floor(this.xonixX);
            let newTileY = Math.floor(this.xonixY);
            //прорисовка хвоста, линии, оставляемой xonix
            if (
                (oldTileX != newTileX || oldTileY != newTileY) &&
                this.tiles[oldTileY][oldTileX] == theSea
            ) {
                this.tiles[oldTileY][oldTileX] = xonixTale;
                //если линия соединяет 2 суши по морю, то мы превращаем море в сушу
                if (this.tiles[newTileY][newTileX] == theGround) {
                    this.checkNewGroundArea();
                    this.xonixDirection = place;
                    this.xonixX = newTileX;
                    this.xonixY = newTileY;
                }
                // Если xonix попадает в свою линию, он умирает.
                if (this.tiles[newTileY][newTileX] == xonixTale) this.die();
            }
            this.updateMonsters(t);//добавим монстров
            this.checkCollisions(); // Проверим столкновения между монстрами и xonix.
            this.t += t;//увеличиваем время
        }
    };

    //обновление Xonix.
    updateXonix = function (t) {
        // перемещаем Xonix.
        let dx = t * 40; //перемещение со скоростью 40 
        if (this.xonixDirection == up) this.xonixY -= dx;//вверх
        else if (this.xonixDirection == left) this.xonixX -= dx;//влево
        else if (this.xonixDirection == down) this.xonixY += dx;//вниз
        else if (this.xonixDirection == right) this.xonixX += dx;//вправо

        //проверка выхода за игровое поле
        if (this.xonixX < 0) {
            this.xonixX = 0;
            this.xonixDirection = place;
        }
        if (this.xonixX >= this.w) {
            this.xonixX = this.w - 1;
            this.xonixDirection = place;
        }
        if (this.xonixY < 0) {
            this.xonixY = 0;
            this.xonixDirection = place;
        }
        if (this.xonixY >= this.h) {
            this.xonixY = this.h - 1;
            this.xonixDirection = place;
        }
    };

    //обновление позиций монстров
    updateMonsters = function (t) {
        for (let i = 0; i < this.monsters.length; ++i) {
            //тип клетки препятствия
            let tileWalkable = this.monsters[i][4] == groundMonster ? theGround : theSea; //клетка на которую можно идти
            let tileObstacle = this.monsters[i][4] == groundMonster ? theSea : theGround; //клетка препятствие

            //Переместите монстра.
            this.monsters[i][0] += this.monsters[i][2] * t;
            this.monsters[i][1] += this.monsters[i][3] * t;

            //вычисление координаты клетки
            let tileX = Math.floor(this.monsters[i][0]);
            let tileY = Math.floor(this.monsters[i][1]);

            //окружающие плитки
            let tile_nw = tileX >= 0 && tileY >= 0 ? this.tiles[tileY][tileX] : tileObstacle;
            let tile_ne = tileX < this.w - 1 && tileY >= 0 ? this.tiles[tileY][tileX + 1] : tileObstacle;
            let tile_sw = tileX >= 0 && tileY < this.h - 1 ? this.tiles[tileY + 1][tileX] : tileObstacle;
            let tile_se = tileX < this.w - 1 && tileY < this.h - 1 ? this.tiles[tileY + 1][tileX + 1] : tileObstacle;

            //флаги
            let hit_nw = tile_nw != tileWalkable;
            let hit_ne = tile_ne != tileWalkable;
            let hit_sw = tile_sw != tileWalkable;
            let hit_se = tile_se != tileWalkable;

            //длины на которые можно проникнуть
            let dn = Math.ceil(this.monsters[i][1]) - tileY;
            let dw = Math.ceil(this.monsters[i][0]) - tileX;
            let ds = tileY - Math.floor(this.monsters[i][0]);
            let de = tileX - Math.floor(this.monsters[i][1]);
            let d_max = Math.max(dn, dw, ds, de);//максимум

            //роверка столкновений и их устранение
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
            } else if (
                d_max == dn &&
                (tile_nw != tileWalkable || tile_ne != tileWalkable) &&
                this.monsters[i][3] < 0
            ) {
                this.monsters[i][3] *= -1;
                this.monsters[i][1] = Math.ceil(this.monsters[i][0]);
            } else if (
                d_max == dw &&
                (tile_nw != tileWalkable || tile_sw != tileWalkable) &&
                this.monsters[i][2] < 0
            ) {
                this.monsters[i][2] *= -1;
                this.monsters[i][0] = Math.ceil(this.monsters[i][0]);
            } else if (
                d_max == ds &&
                (tile_sw != tileWalkable || tile_se != tileWalkable) &&
                this.monsters[i][3] > 0
            ) {
                this.monsters[i][3] *= -1;
                this.monsters[i][1] = Math.floor(this.monsters[i][1]);
            } else if (
                d_max == de &&
                (tile_ne != tileWalkable || tile_se != tileWalkable) &&
                this.monsters[i][2] > 0
            ) {
                this.monsters[i][2] *= -1;
                this.monsters[i][0] = Math.floor(this.monsters[i][0]);
            }

            if (this.monsters[i][4] == deleteMonster) {
                if (hit_nw && tileX > 0 && tileY > 0) {
                    this.tiles[tileY][tileX] = theSea;
                    this.ground--;
                }

                if (hit_ne && tileY > 0 && tileX < this.w - 2) {
                    this.tiles[tileY][tileX + 1] = theSea;
                    this.ground--;
                }

                if (hit_sw && tileX > 0 && tileY < this.h - 2) {
                    this.tiles[tileY + 1][tileX] = theSea;
                    this.ground--;
                }

                if (hit_se && tileX < this.w - 2 && tileY < this.h - 2) {
                    this.tiles[tileY + 1][tileX + 1] = theSea;
                    this.ground--;
                }
            } else if (this.monsters[i][4] == seaMonster) {
                if (
                    (hit_nw && tile_nw == xonixTale) ||
                    (hit_ne && tile_ne == xonixTale) ||
                    (hit_sw && tile_sw == xonixTale) ||
                    (hit_se && tile_se == xonixTale)
                ) {
                    this.die();
                    break;
                }
            }
        }
    };

    // Проверяйте столкновения между монстрами и линией xonix.
    checkCollisions = function () {
        let playerLeft = this.xonixX;
        let playerRight = this.xonixX + 1;
        let playerTop = this.xonixY;
        let playerBottom = this.xonixY + 1;

        for (let i = 0; i < this.monsters.length; ++i) {
            let tileX = Math.floor(this.monsters[i][0]);
            let tileY = Math.floor(this.monsters[i][1]);
            // проверка, попал ли противник в Xonix.
            if (this.monsters[i][4] != deleteMonster &&
                !(
                    playerLeft >= this.monsters[i][0] + 1 ||
                    playerRight <= this.monsters[i][0] ||
                    playerTop >= this.monsters[i][1] + 1 ||
                    playerBottom <= this.monsters[i][1]
                )
            ) {
                this.die();
                return;
            }
            //проверка, попал ли враг в линию.
            if (this.tiles[tileY][tileX] == xonixTale) {
                this.die();
                return;
            }
        }
    };

    //смерть Xonix.
    die = function () {
        this.xonixLives -= 1;
        if (this.xonixLives > 0) this.state = 1; //пауза, до возраждения
        else {
            this.state = 2;
            let rezArray = null;
            const name = prompt('ваше имя?', 'user name');//получение имени
            const storage = JSON.parse (localStorage.getItem ("hiscore_"));//получение результата

            const rez = {//для передачи рекорда
                name: name,
                score: this.xonixScore
            }
            const isWasName = storage.find((item) => item.name === rez.name)

            if(isWasName) {
                rezArray = storage.map((item) => {
                    if(item.name === rez.name && item.score < rez.score) {
                        item.score = rez.score;
                    }
                    return item;
                }) 
            } else {
                rezArray = [...storage, rez];
            }

            localStorage.setItem ("hiscore_", JSON.stringify(rezArray.sort((a, b) => {
                if (a.score < b.score) {
                    return 1;
                  }
                  if (a.score > b.score) {
                    return -1;
                  }
                  // a должно быть равным b
                  return 0;
            })));
        }

        this.xonixDirection = Date.now();
    };

    //монстры на суше
    respawnGroundMonsters = function () {
        for (let i = 0; i < this.monsters.length; ++i) {
            if (this.monsters[i][4] != groundMonster) continue;

            let x, y, angle;
            //появление монстра в 30*30 клеток от Xonix
            do {
                x = Math.floor(Math.random() * this.w);
                y = Math.floor(Math.random() * this.h);
            } while (
                this.tiles[y][x] != theGround ||
                (x - this.xonixX) * (x - this.xonixX) +
                    (y - this.xonixY) * (y - this.xonixY) <
                    30 * 30
            );
                //направление, скорость и угол движения
            do {
                angle = Math.random() * 2 * Math.PI;
            } while (
                Math.abs(angle) < monsterPath ||
                Math.abs(angle - Math.PI / 2) < monsterPath ||
                Math.abs(angle - Math.PI) < monsterPath ||
                Math.abs(angle - (3 * Math.PI) / 2) < monsterPath ||
                Math.abs(angle - 2 * Math.PI) < monsterPath
            );
            let speed = 40;
            this.monsters[i] = [
                x,
                y,
                speed * Math.cos(angle),
                speed * Math.sin(angle),
                groundMonster,
            ];
        }
    };

    //еси попали по xonix то его хвост опять море
    startNewLife = function () {
        // очистка линиии
        for (let row = 0; row < this.h; ++row)
            for (let col = 0; col < this.w; ++col)
                if (this.tiles[row][col] == xonixTale)
                    this.tiles[row][col] = theSea;

        this.respawnGroundMonsters();

        //сбросить позицию Xonix.
        this.xonixX = Math.floor(this.w / 2);
        this.xonixY = 0;
        this.xonixDirection = place;

        this.state = 0;
    };

    //переход на следующий уровень.
    startNewLevel = function () {
        this.level++;
        this.t = 0;
        this.setupField(this.w, this.h);

        this.xonixX = Math.floor(this.w / 2);
        this.xonixY = 0;
        this.xonixDirection = place;

        this.setupMonsters(2 + (this.level - 1) * 1); //добавление +1 монстр на уровне
        this.startNewLife();
    };

    //рисование
    draw = function (context) {
        context.fillStyle = '#71369b';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        //рисование клеток
        for (let row = 0; row < this.h; ++row) {
            for (let col = 0; col < this.w; ++col) {
                if (this.tiles[row][col] == theSea) continue;

                switch (this.tiles[row][col]) {
                    case theGround://суша
                        context.fillStyle = '#ffffff98';
                        break;
                    case xonixTale://море
                        context.fillStyle = '#808080';
                        break;
                }
                context.fillRect(col * 5, row * 5, 5, 5);
            }
        }
        //рисование Xonix.
        switch (this.tiles[Math.floor(this.xonixY)][Math.floor(this.xonixX)]) {
            case theGround://на суше
                context.fillStyle = '#2c15f8';
                break;
            case theSea://в море
            case xonixTale://хвост
                context.fillStyle = '#2c15f8';
                break;
        }
        context.fillRect(
            Math.floor(this.xonixX) * 5,
            Math.floor(this.xonixY) * 5,
            5,
            5
        );

        //рисование монстров монстров.
        for (let i = 0; i < this.monsters.length; ++i) {
            switch (this.monsters[i][4]) {
                case seaMonster://ьщрской
                    context.fillStyle = '#FF7400';
                    break;
                case deleteMonster://удаляющий
                    context.fillStyle = '#FF0086';
                    break;
                case groundMonster://сухопутный
                    context.fillStyle = '#b12810';
                    break;
            }

            context.fillRect(
                Math.floor(this.monsters[i][0] * 5),
                Math.floor(this.monsters[i][1] * 5),
                5,
                5
            );
        }
    };

    //проверка новых заполненных областей и заполнение тех, где нет монстров
    checkNewGroundArea = function () {
        let groundNew = 0;

        //забираем все клетки хвоста
        for (let row = 0; row < this.h; ++row) {
            for (let col = 0; col < this.w; ++col) {
                if (this.tiles[row][col] == xonixTale) {
                    this.tiles[row][col] = theGround;
                    groundNew++;
                }
            }
        }
        //забираем клетки до которых монстры не доберутся
        for (let row = 0; row < this.h; ++row)
            for (let col = 0; col < this.w; ++col)
                this.tilesToGround[row][col] = true;

        //переставим монстров
        for (let i = 0; i < this.monsters.length; ++i)
            if (this.monsters[i][4] != groundMonster)
                this.tilesToGround[Math.floor(this.monsters[i][1])][
                    Math.floor(this.monsters[i][0])
                ] = false;

        //определение полого квадрата который станет сушей
        let changed = true;
        let count = 0;
        while (changed) {
            changed = false;
            ++count;
            for (let row = 0; row < this.h; ++row) {
                for (let col = 0; col < this.w; ++col) {
                    if (
                        !this.tilesToGround[row][col] ||
                        this.tiles[row][col] == theGround
                    )
                        continue;

                    if (
                        (row > 1 && !this.tilesToGround[row - 1][col]) ||
                        (row < this.h - 1 &&
                            !this.tilesToGround[row + 1][col]) ||
                        (col > 1 && !this.tilesToGround[row][col - 1]) ||
                        (col < this.w - 1 && !this.tilesToGround[row][col + 1])
                    ) {
                        this.tilesToGround[row][col] = false;
                        changed = true;
                    }
                }
            }
        }
        this.ground = 0;

        //переносим изменения и превращаем в сушу полый квадрат
        for (let row = 0; row < this.h; ++row) {
            for (let col = 0; col < this.w; ++col) {
                if (
                    this.tilesToGround[row][col] &&
                    this.tiles[row][col] != theGround
                ) {
                    this.tiles[row][col] = theGround;
                    groundNew++;
                }
                if (this.tiles[row][col] == theGround) this.ground++;
            }
        }

        //обновляем счёт
        this.xonixScore +=
            Math.ceil(Math.pow(groundNew, 1.5) / 1000 / Math.pow(this.t, 0.5)) *
            Math.pow(2, this.level - 1);
        //обновление времени при заполнении площади
        if (this.ground / (this.w * this.h) > 0.8) {
            this.state = 1;
            this.xonixDirection = Date.now();
        }
    };

    //контроль xonix с клавиатуры
    conrolXonix = function () {
        document.onkeydown = function (e) {
            switch (field.state) {
                case 0: //игра запущена
                    let old_direction = field.xonixDirection;
                    switch (e.code) {
                        case 'ArrowUp':
                            field.xonixDirection = up;
                            break;
                        case 'ArrowLeft':
                            field.xonixDirection = left;
                            break;
                        case 'ArrowDown':
                            field.xonixDirection = down;
                            break;
                        case 'ArrowRight':
                            field.xonixDirection = right;
                            break;
                        case 'Space':
                            field.state = 3;
                            field.xonixDirection = Date.now();
                            break;
                    }
                    if (old_direction != field.xonixDirection) {
                        field.xonixX = Math.floor(field.xonixX);
                        field.xonixY = Math.floor(field.xonixY);
                    }
                    break;
        
                case 1://остановка игры после смерти
                    if (Date.now() - field.xonixDirection > 1000) {
                        if (field.ground / (field.w * field.h) > 0.8)
                            field.startNewLevel();
                        else field.startNewLife();
                    }
                    break;
        
                case 3://игра остановлена вручную
                    if (Date.now() - field.xonixDirection > 1000) field.state = 0;
                    break;
        
                case 2://игра окончена
                    if (Date.now() - field.xonixDirection > 1000) {
                        field.setup(mainCanvas.width / 5, mainCanvas.height / 5);
                    }
                    break;
            }
        };
    }
}

const model = new baseModel();
const view = new baseViews();
const field = new baseController(model, view);

// Метод настройки.
let setup = function () {
    //сбрасываем наилучший результат, если его не находим
    if (localStorage.hiscore_ == undefined) localStorage.setItem ("hiscore_", JSON.stringify([]));;

    //получаем канвас-элементы
    mainCanvas = document.getElementById('mainCanvas');
    mainContext = mainCanvas.getContext('2d');
    apperCanvas1 = document.getElementById('apperCanvas1');
    apperContext1 = apperCanvas1.getContext('2d');
    apperCanvas2 = document.getElementById('apperCanvas2');
    apperContext2 = apperCanvas2.getContext('2d');

    //настраиваем игровое поле
    field.setup(mainCanvas.width / 5, mainCanvas.height / 5);

    //события keydown для движения Xonix
    field.lastUpdateTime = Date.now();
    setInterval(field.view.updateView, 1000 / 60);
    setInterval(field.view.drawView, 1000 / 60);
};