//это функция которая вызыается при нажатии кнопки старт
//она скрывает все ненужные для выполнения элементы вёрстки

var runGame = function () { 
  let show = function(){
    window.addEventListener("popstate", detectHistiry);     //прослушивание кнопок браузера
    window.history.pushState({id:1}, null, "?game");        //изменение адресной строки
    
    //забираем элементы по ID, нужные показываем
    document.getElementById('wrapper').style.display = 'block';
    document.getElementById('backBtn').style.display = 'block'; //кнопка вернуться назад
    
    //ненужные скрываем
    document.getElementById('newGame').style.display = 'none';
    document.getElementById('theHead').style.display = 'none';
    //убираем всё с историей
    document.getElementById('history').style.display = 'none';
    document.getElementById('historyBtn').style.display = 'none';
    //убираем всё с рекордами
    document.getElementById('records').style.display = 'none';
    document.getElementById('recordsBtn').style.display = 'none';
    //убираем всё с опции
    document.getElementById('options').style.display = 'none';
    document.getElementById('optionsBtn').style.display = 'none';
    setup();
  }
  let detectHistiry = function(){
    goBack();       //функция возвращения назад к меню
  }
  show();                
};
//история
var showHistory = function () {
  let show = function(){
    window.addEventListener("popstate", detectHistiry);
    window.history.pushState({id:2}, null, "?history");//меняем адресную строку
    //показ
    document.getElementById('theHead').style.display = 'block';
    document.getElementById('history').style.display = 'block';
    document.getElementById('backBtn').style.display = 'block';
    //скрытие
    document.getElementById('historyBtn').style.display = 'none';
    document.getElementById('newGame').style.display = 'none';
    document.getElementById('records').style.display = 'none';
    document.getElementById('recordsBtn').style.display = 'none';
    document.getElementById('options').style.display = 'none';
    document.getElementById('optionsBtn').style.display = 'none';
  }
  let detectHistiry = function(){
    goBack();
  }
  show();
};
//рекорды
var showRecords = function () {
  let show = function(){
    window.addEventListener("popstate", detectHistiry);
    window.history.pushState({id:3}, null, "?records");    
    //показ
    document.getElementById('records').style.display = 'block'; 
    document.getElementById('backBtn').style.display = 'block';
    //скрытие
    document.getElementById('theHead').style.display = 'none';
    document.getElementById('recordsBtn').style.display = 'none';
    document.getElementById('newGame').style.display = 'none'; 
    document.getElementById('history').style.display = 'none';
    document.getElementById('historyBtn').style.display = 'none';
    document.getElementById('options').style.display = 'none';
    document.getElementById('optionsBtn').style.display = 'none';
    tableCreate();
  }
  let detectHistiry = function(){
    goBack();
}
  show();
};
//опции
var showOptions = function () {
  let show = function(){
    window.addEventListener("popstate", detectHistiry);
    window.history.pushState({id:4}, null, "?options");
    //показ
    document.getElementById('theHead').style.display = 'block';
    document.getElementById('options').style.display = 'block';
    document.getElementById('backBtn').style.display = 'block';
    //скрытие
    document.getElementById('optionsBtn').style.display = 'none';
    document.getElementById('newGame').style.display = 'none';
    document.getElementById('records').style.display = 'none';
    document.getElementById('recordsBtn').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    document.getElementById('historyBtn').style.display = 'none';
}
  let detectHistiry = function(){
    goBack();
}
  show();
};
var goBack = function () {//функция возвращения в меню, по умолчанию она вызывается по клику на кнопку назад
  let show = function(){
    window.addEventListener("popstate", detectHistiry);
    window.history.pushState({id:4}, null, "?");
  //показ кнопок меню
  document.getElementById('theHead').style.display = 'block';
  document.getElementById('newGame').style.display = 'block';
  document.getElementById('historyBtn').style.display = 'block';
  document.getElementById('recordsBtn').style.display = 'block';
  document.getElementById('optionsBtn').style.display = 'block';
  //скрытие
  document.getElementById('backBtn').style.display = 'none';
  document.getElementById('history').style.display = 'none';
  document.getElementById('records').style.display = 'none';
  document.getElementById('options').style.display = 'none';
  document.getElementById('wrapper').style.display = 'none';  
}
let detectHistiry = function(){
  show();
}
show();
};