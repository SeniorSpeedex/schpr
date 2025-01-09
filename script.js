let users = JSON.parse(localStorage.getItem('users')) || [];
let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
let viewedLessons = JSON.parse(localStorage.getItem('viewedLessons')) || {};
let currentUser = null;

// Проверка на наличие пользователей в localStorage
if (users.length === 0) {
    users.push({ id: 1, role: 'учитель', fullName: 'Учитель 1', username: 'teacher1', password: 'password1' });
    saveData();
}

// Функция для сохранения данных в localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('lessons', JSON.stringify(lessons));
    localStorage.setItem('viewedLessons', JSON.stringify(viewedLessons));
}

// Обработчик при отправке формы входа
document.getElementById('login').addEventListener('submit', handleLogin);

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        authenticateUser(user);
    } else {
        document.getElementById('loginError').innerText = 'Неправильный логин или пароль.';
    }
}

// Функция аутентификации пользователя
function authenticateUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert('Успешный вход!');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';

    document.getElementById('addLessonLink').style.display = user.role === 'учитель' ? 'block' : 'none';
    document.getElementById('add-lesson').style.display = user.role === 'учитель' ? 'block' : 'none';
    displayLessons();
}

// Обработчик нажатия кнопки регистрации
document.getElementById('registerButton').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

// Обработчик при отправке формы регистрации
document.getElementById('teacherForm').addEventListener('submit', handleAddUser);

function handleAddUser(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('teacherUsername').value;
    const password = document.getElementById('teacherPassword').value;
    const role = document.getElementById('role').value;

    if (users.find(u => u.username === username)) {
        document.getElementById('registrationError').innerText = 'Логин уже занят!';
        return;
    }

    const user = { id: users.length + 1, role, fullName, username, password };
    users.push(user);
    saveData();
    alert('Пользователь добавлен!');
    this.reset();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Обработчик при отправке формы добавления уроков
document.getElementById('lessonForm').addEventListener('submit', handleAddLesson);

function handleAddLesson(event) {
    event.preventDefault();
    const title = document.getElementById('lessonTitle').value;
    const description = document.getElementById('lessonDescription').value;
    const mediaFiles = document.getElementById('lessonMedia').files;

    const mediaURLs = Array.from(mediaFiles).map(file => URL.createObjectURL(file)); // Генерация URL для каждого файла

    const lesson = {
        id: lessons.length + 1,
        teacher: currentUser.fullName,
        title,
        description,
        media: mediaURLs // Сохраняем сгенерированные URL
    };

    lessons.push(lesson);
    saveData();
    displayLessons();
    alert('Урок добавлен!');
    document.getElementById('lessonForm').reset();
}

// Функция для отображения уроков
function displayLessons() {
    const viewedLessonsList = document.getElementById('viewedLessonsList');
    const unviewedLessonsList = document.getElementById('unviewedLessonsList');

    // Обнуляем содержимое перед добавлением новых уроков
    viewedLessonsList.innerHTML = '<h3>Просмотренные уроки</h3>'; // Заголовок для просмотренных
    unviewedLessonsList.innerHTML = '<h3>Непросмотренные уроки</h3>'; // Заголовок для непросмотренных

    lessons.forEach(lesson => {
        const lessonItem = document.createElement('div');
        lessonItem.classList.add('lesson-item');
        lessonItem.innerHTML = `
            <strong>${lesson.title}</strong><br>
            Учитель: ${lesson.teacher}<br>
            <button onclick="openLesson(${lesson.id})">Перейти</button>
            ${currentUser.role === 'учитель' ? `<button onclick="editLesson(${lesson.id})">Редактировать</button>` : ''}
        `;

        if (viewedLessons[lesson.title]) { // Проверяем, были ли уроки просмотрены
            const views = viewedLessons[lesson.title].map(view => `${view.user} — ${view.time}`).join('<br/>');
            viewedLessonsList.innerHTML += `${lessonItem.outerHTML}<div style="color: grey;">${views}</div>`; // Добавляем информацию о просмотрах
        } else {

            unviewedLessonsList.innerHTML += lessonItem.outerHTML; // Добавляем элемент в список непросмотренных
        }
    });
}

// Проверка, был ли урок просмотрен
function isLessonViewed(lessonTitle) {
    return viewedLessons[lessonTitle] !== undefined;
}

// Функция для открытия урока
function openLesson(id) {
    const lesson = lessons.find(l => l.id === id);

    // Проверка, найден ли урок
    if (!lesson) {
        alert("Урок не найден!");
        return;
    }

    document.getElementById('detailLessonTitle').innerText = lesson.title;
    document.getElementById('detailLessonDescription').innerText = lesson.description;

    const mediaContainer = document.getElementById('detailLessonMedia');
    mediaContainer.innerHTML = '';

    lesson.media.forEach(fileURL => {
        const mediaElement = document.createElement('div');
        const imgElement = document.createElement('img');
        imgElement.src = fileURL; // Задаем src сгенерированного URL
        imgElement.style.width = '100%'; // Меньше для уменьшения размера изображения
        mediaElement.appendChild(imgElement);
        mediaContainer.appendChild(mediaElement);
    });

    logLessonView(lesson.title); // Логгируем просмотр

    document.getElementById('lessonDetail').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
}

// Функция для возврата к списку уроков
function goBackToLessons() {
    document.getElementById('lessonDetail').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

// Логгирование просмотра урока
function logLessonView(lessonTitle) {
    const viewTime = new Date().toLocaleString();
    if (!viewedLessons[lessonTitle]) {
        viewedLessons[lessonTitle] = []; // Создаем новый массив для уроков
    }
    // Проверка полноты currentUser перед сохранением
    if (currentUser && currentUser.fullName) {
        viewedLessons[lessonTitle].push({ user: currentUser.fullName, time: viewTime }); // Сохраняем имя пользователя и время
    }
    saveData(); // Сохраняем в localStorage
}

// Загрузка текущего пользователя при перезагрузке
window.onload = function () {
    const lastUser = localStorage.getItem('currentUser');
    if (lastUser) {
        currentUser = JSON.parse(lastUser);
        authenticateUser(currentUser);  // Аутентификация текущего пользователя
    }
    displayLessons(); // Показываем уроки при загрузке страницы
};
