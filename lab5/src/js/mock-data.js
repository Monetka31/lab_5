// mock-data.js — учебный «сервер»: какие данные он хранит и что отвечает на запросы.
//
// Предметная область: Система бронирования рабочих мест (Вариант 11).
// Сотрудники бронируют рабочие места в офисе на определённую дату.
// Сервер хранит список броней и справочник рабочих мест.
//
// Файл состоит из двух частей:
//   1. Данные — несколько массивов с записями (как таблицы в базе данных).
//   2. Таблица ROUTES — «на такой запрос сервер отвечает такими данными».

// ============================================================
// 1. ДАННЫЕ
// У каждой записи есть уникальный номер id. Остальные поля — любые.
// ============================================================

// Брони рабочих мест.
//   place     — обозначение рабочего места (например, «A-12»);
//   employee  — сотрудник, который забронировал место;
//   date      — дата брони (ГГГГ-ММ-ДД);
//   status    — статус брони: booked (забронировано), free (свободно), cancelled (отменено);
//   location  — расположение места: floor1, floor2, floor3.
const bookings = [
  { id: 1, place: 'A-12', employee: 'Иванов И.И.', date: '2026-10-20', status: 'booked', location: 'floor1' },
  { id: 2, place: 'A-15', employee: 'Петрова А.С.', date: '2026-10-20', status: 'booked', location: 'floor1' },
  { id: 3, place: 'B-03', employee: '—', date: '2026-10-21', status: 'free', location: 'floor2' },
  { id: 4, place: 'B-07', employee: 'Сидоров П.К.', date: '2026-10-21', status: 'cancelled', location: 'floor2' },
  { id: 5, place: 'C-22', employee: 'Кузнецова М.В.', date: '2026-10-22', status: 'booked', location: 'floor3' },
  { id: 6, place: 'C-25', employee: '—', date: '2026-10-22', status: 'free', location: 'floor3' },
  { id: 7, place: 'Переговорная-1', employee: 'Орлов Д.А.', date: '2026-10-23', status: 'booked', location: 'floor1' }
];

// Вторая сущность: справочник сотрудников, которые могут бронировать места.
// В базовой работе страница её не использует, но может пригодиться для развития проекта.
const employees = [
  { id: 1, name: 'Иванов И.И.', department: 'Разработка' },
  { id: 2, name: 'Петрова А.С.', department: 'Дизайн' }
];

// ============================================================
// 2. ТАБЛИЦА ЗАПРОСОВ
// Слева — запрос (метод и адрес), справа — функция, которая возвращает ответ.
// Параметр query — параметры из адреса после знака ? (например, { status: 'booked', q: 'A-12' }).
//
// Примеры того, как страница будет получать данные:
//   GET /api/bookings                 ->  все брони
//   GET /api/bookings?status=booked   ->  только брони со статусом booked
//   GET /api/bookings?q=A-12          ->  брони, в тексте которых есть «A-12»
//   GET /api/employees                ->  все сотрудники
//   любой другой запрос               ->  ошибка 404 (для него нет строки в таблице)
// ============================================================

const ROUTES = {
  'GET /api/bookings': function (query) {
    return filterList(bookings, query);     // filterList выбирает записи по параметрам из query
  },

  'GET /api/employees': function () {
    return employees;                       // отдаём весь массив без фильтров
  }

  // ----- Для заданий повышенной сложности -----
  // Уберите // в начале строк, поставьте запятую после предыдущего пункта — и сервер научится
  // создавать, получать по номеру и удалять брони. Изменения хранятся до перезагрузки страницы.
  //
  // 'GET /api/bookings/:id': function (query, body, params) {
  //   const booking = bookings.find(function (b) { return b.id === Number(params.id); });
  //   return booking || reply(404, { error: 'Бронь не найдена' });
  // },
  //
  // 'POST /api/bookings': function (query, body) {
  //   if (!body.place) {
  //     return reply(422, { error: 'Введите место' });
  //   }
  //   const booking = { id: Date.now(), place: body.place, employee: body.employee, date: body.date, status: 'booked', location: body.location };
  //   bookings.push(booking);
  //   return reply(201, booking);            // 201 — «создано»
  // },
  //
  // 'DELETE /api/bookings/:id': function (query, body, params) {
  //   const index = bookings.findIndex(function (b) { return b.id === Number(params.id); });
  //   if (index === -1) {
  //     return reply(404, { error: 'Бронь не найдена' });
  //   }
  //   bookings.splice(index, 1);
  //   return reply(204);                     // 204 — «выполнено, ответа нет»
  // }
};
