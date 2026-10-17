// app.js — клиентская логика страницы: события, работа с DOM, запросы к серверу.
// Предметная область: бронирование рабочих мест в офисе.

// ============================================================
// Находим нужные элементы страницы (по id из index.html). Готово.
// ============================================================
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const prioritySelect = document.getElementById('task-priority');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');
const refreshButton = document.getElementById('refresh-button');
const infoBox = document.getElementById('info');
const taskTable = document.getElementById('task-table');
const taskBody = document.getElementById('task-body');
const counter = document.getElementById('counter');

// В данных хранятся английские слова, а пользователю показываем русские подписи
const STATUS_NAMES = { booked: 'Забронировано', free: 'Свободно', cancelled: 'Отменено' };
const PRIORITY_NAMES = { floor1: '1 этаж', floor2: '2 этаж', floor3: '3 этаж' };

// ============================================================
// Готовые вспомогательные функции (менять не нужно)
// ============================================================

// Показать сообщение в области информации (isError = true — красным цветом)
function showInfo(text, isError) {
  infoBox.textContent = text;
  infoBox.className = isError ? 'message error-message' : 'message';
  infoBox.hidden = false;
}

// Обновить счётчик и показать/скрыть таблицу в зависимости от числа строк
function updateCounter() {
  const count = taskBody.children.length;
  counter.textContent = count;        // изменяем ТЕКСТ элемента
  taskTable.hidden = (count === 0);   // изменяем АТРИБУТ hidden: пустую таблицу не показываем
}

// Добавить в строку таблицы ячейку с текстом и вернуть эту ячейку
function addCell(row, text) {
  const cell = document.createElement('td');   // создаём новый элемент <td>
  cell.textContent = text;                     // записываем в него текст
  row.appendChild(cell);                       // добавляем в строку
  return cell;
}

// ============================================================
// ШАГ 3. Работа с DOM
// ============================================================

// Создаёт строку таблицы для одной брони. Позже её будут использовать и загрузка с сервера,
// и добавление брони через форму.
function createTaskRow(task) {
  const row = document.createElement('tr');

  // Пример (готово): ячейка с номером брони
  addCell(row, task.id);

  // TODO 3.1 — выполнено: остальные ячейки
  addCell(row, task.place);                                     // место
  addCell(row, task.employee || '—');                           // сотрудник
  addCell(row, task.date || '—');                                // дата
  addCell(row, STATUS_NAMES[task.status] || task.status);       // статус
  addCell(row, PRIORITY_NAMES[task.location] || '—');            // расположение

  // TODO 3.2 — выполнено: ячейка с кнопками действий
  const actions = document.createElement('td');
  const doneButton = document.createElement('button');
  doneButton.textContent = 'Отменить';
  doneButton.addEventListener('click', onDoneClick);             // событие (Шаг 2)
  actions.appendChild(doneButton);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Удалить';
  deleteButton.className = 'danger';
  deleteButton.addEventListener('click', onDeleteClick);
  actions.appendChild(deleteButton);

  row.appendChild(actions);

  // TODO 3.3 — выполнено: запоминаем номер брони в атрибуте строки
  row.setAttribute('data-id', task.id);

  // TODO 3.4 — выполнено: если бронь отменена, выделяем строку классом оформления
  if (task.status === 'cancelled') {
    row.classList.add('done');          // класс зачёркивает текст, он описан в styles.css
    doneButton.textContent = 'Восстановить';
  }

  return row;
}

// Событие click на кнопке «Отменить»/«Восстановить»
function onDoneClick(event) {
  const button = event.target;               // кнопка, на которую нажали
  const row = button.closest('tr');          // ближайший родитель — строка таблицы

  // TODO 3.5 — выполнено: переключаем статус брони прямо на странице
  row.classList.toggle('done');                                      // добавить класс, если его нет; убрать, если есть
  const isCancelled = row.classList.contains('done');                // есть ли сейчас класс
  row.children[4].textContent = isCancelled ? 'Отменено' : 'Забронировано';  // ячейка «Статус»
  button.textContent = isCancelled ? 'Восстановить' : 'Отменить';     // текст кнопки
  button.setAttribute('title', isCancelled ? 'Восстановить бронь' : 'Отменить бронь');  // атрибут
}

// Событие click на кнопке «Удалить»
function onDeleteClick(event) {
  const row = event.target.closest('tr');

  // TODO 3.6 — выполнено: подтверждение и удаление строки
  if (!confirm('Удалить бронь?')) {
    return;
  }
  row.remove();
  updateCounter();
}

// ============================================================
// ШАГ 2. Обработка событий
// ============================================================

// Событие submit у формы: добавление новой брони в таблицу
function onFormSubmit(event) {
  // TODO 2.1 — выполнено: отменяем перезагрузку страницы
  event.preventDefault();

  const title = titleInput.value.trim();     // trim() убирает пробелы по краям

  // TODO 2.2 — выполнено: проверка введённого места
  if (title.length < 3) {
    document.getElementById('error-title').textContent = 'Укажите место, не короче 3 символов';
    return;
  }
  document.getElementById('error-title').textContent = '';

  // TODO 3.7 — выполнено: добавляем новую бронь в таблицу
  const task = {
    id: '—',
    place: title,
    employee: 'Вы',
    date: new Date().toISOString().slice(0, 10),
    status: 'booked',
    location: prioritySelect.value
  };
  taskBody.insertBefore(createTaskRow(task), taskBody.firstChild);   // вставить строку в начало таблицы
  updateCounter();
  infoBox.hidden = true;     // спрятать область сообщений
  taskForm.reset();          // очистить поля формы
}

// ============================================================
// ШАГ 4. Асинхронные запросы (fetch)
// ============================================================

// Получает с сервера список броней. Слово async позволяет внутри использовать await.
async function loadTasks(status, text) {
  // TODO 4.1 — выполнено
  const url = '/api/bookings?status=' + status + '&q=' + encodeURIComponent(text);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка сервера: ' + response.status);
  }
  return await response.json();
}

// Загружает список с сервера и выводит его на страницу
async function refreshList() {
  // TODO 4.2 — выполнено
  showInfo('Загрузка…', false);
  refreshButton.disabled = true;                    // пока идёт запрос, кнопка недоступна
  try {
    const tasks = await loadTasks(statusFilter.value, searchInput.value.trim());
    taskBody.innerHTML = '';                        // очистить таблицу
    for (let i = 0; i < tasks.length; i++) {        // по строке на каждую бронь
      taskBody.appendChild(createTaskRow(tasks[i]));
    }
    updateCounter();
    if (tasks.length === 0) {
      showInfo('Брони не найдены. Измените фильтр или текст поиска', false);
    } else {
      showInfo('Загружено броней: ' + tasks.length, false);
    }
  } catch (error) {
    taskBody.innerHTML = '';
    updateCounter();
    const message = error.message === 'Failed to fetch' ? 'Нет связи с сервером' : error.message;
    showInfo('Не удалось загрузить список. ' + message, true);     // сообщение красным цветом
  } finally {
    refreshButton.disabled = false;                 // выполнится в любом случае
  }
}

// ============================================================
// ШАГ 2 (продолжение). Подключаем обработчики событий
// ============================================================
// «Когда произойдёт ЭТО событие у ЭТОГО элемента — вызвать ЭТУ функцию».
// Пример (готов): форма вызывает onFormSubmit при отправке.
taskForm.addEventListener('submit', onFormSubmit);

// TODO 2.3 — выполнено: остальные обработчики
refreshButton.addEventListener('click', refreshList);   // нажатие кнопки
statusFilter.addEventListener('change', refreshList);   // выбор элемента списка
searchInput.addEventListener('input', refreshList);     // изменение значения поля

// ============================================================
// Запуск страницы
// ============================================================
// TODO 4.3 — выполнено: первая загрузка при открытии страницы
refreshList();
