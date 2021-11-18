//функция заполнения таблицы рекордов

function tableCreate(){
  const recordMNames = document.querySelectorAll('.record-name');   //выбираем все поля, которые должны быть заполнены именем игрока
  const recordScores = document.querySelectorAll('.record-score');  //выбираем все поля, которые должны быть заполнены результатом игрока
  const storage = JSON.parse (localStorage.getItem ("hiscore_"));   //с помощью JSON после оканчания игры передаём в функцию значение, хранящееся в LocalStorage
  //console.log(storage); //для процесса дебага и просмотра переносимых данных
  //заполнение поля таблицы с именем
  recordMNames.forEach((item, i) => {     
    if(storage) {
      item.innerHTML = `${i+1}. ${storage[i]?.name || ''}`;
    }
  })
  //заполнение поля таблицы с рекордом
  recordScores.forEach((item, i) => {     
    if(storage) {
      item.innerHTML = `${storage[i]?.score || ''}`;
    }
  })
}