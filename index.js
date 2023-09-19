const CREATE_POST_BTN = '.create-blog__btn';
const POST_TITLE = '.create-blog__title';
const LIST_OF_POSTS = 'list-of-posts';
const LIST_OF_POSTS_CONTAINER = '.list-of-posts';
const POST_DESCRIPTION = '.create-blog__description';
const MODAL_EDIT_POST = '.modal__edit-post';
const MODAL_WATCH_POST = '.modal__watch-post';
const POST_EDIT_BTN = '.post__edit-btn';
const MODAL_SAVE_BTN = '.modal__save-btn';
const MODAL_CLOSE_BTN = '.modal__close-btn';
const MODAL_TITLE = '.modal__title';
const MODAL_DESCRIPTION = '.modal__description';

const createPostBtn = document.querySelector(CREATE_POST_BTN);
const createPostTitle = document.querySelector(POST_TITLE).querySelector('input');
const createPostDescription = document.querySelector(POST_DESCRIPTION).querySelector('input');
const listOfPostsContainer = document.querySelector(LIST_OF_POSTS_CONTAINER);
const modalEditPost = document.querySelector(MODAL_EDIT_POST);
const modalWatchPost = document.querySelector(MODAL_WATCH_POST);


// Создаем элемент поста
function createPostElement(title, description = '', id) {
    const container = document.createElement('div');
    container.className = 'post';
    container.addEventListener('click', () => openPostModal(id));

    container.innerHTML = `
        <div class="post__content">
            <p class="post__title">${title}</p>
            <p class="post__description">${description}</p>
        </div>

        <div class="post__edit-btn">
            Изменить
        </div>
    `;

    return container;
}


// При нажатии на карточку поста, открывается модалка поста
function openPostModal(id) {
    const {
        title,
        description,
        timeOfCreation,
        timeOfEditing
    } = getPostById(id);

    modalWatchPost.style.display = 'flex';

    modalWatchPost.innerHTML = `
        <div class="modal__content">
            <div class="modal__title">${title}</div>
            <div class="modal__description">${description}</div>
            <div class="modal__time-of-creation">Время создания: ${timeOfCreation}</div>
            <div class="modal__time-of-edit">Время последнего редактирования: ${timeOfEditing}</div>

            <div class="modal__close-btn">Закрыть</div>
        </div>
    `;

    document.querySelectorAll(MODAL_CLOSE_BTN).forEach((btn) => btn.addEventListener('click', handleCloseModals));
}


// При нажатии на кнопку "Изменить", открывается модалка с возможностью поменять пост
function editPostModal(id, event) {
    event.stopPropagation();

    const {
        title,
        description,
        timeOfCreation,
        timeOfEditing
    } = getPostById(id);

    modalEditPost.style.display = 'flex';

    modalEditPost.innerHTML = `
        <div class="modal__content">
            <input class="modal__title" type="text" value="${title}">
            <input class="modal__description" type="text" value="${description}">
            <div class="modal__time-of-creation">Время создания: ${timeOfCreation}</div>
            <div class="modal__time-of-edit">Время последнего редактирования: ${timeOfEditing}</div>

            <div class="modal__save-btn">Сохранить</div>
            <div class="modal__close-btn">Закрыть</div>
        </div>
    `;

    let listOfPosts = storage.get(LIST_OF_POSTS, []);

    const modalSaveBtn = document.querySelector(MODAL_SAVE_BTN);
    modalSaveBtn.addEventListener('click', () => {
        listOfPosts = listOfPosts.map((post) => {
            if (id === post.id) {
                post.title = document.querySelector(MODAL_TITLE).value;
                post.description = document.querySelector(MODAL_DESCRIPTION).value;
                post.timeOfEditing = new Date();
            }

            return post;
        });

        storage.set(LIST_OF_POSTS, listOfPosts);
        renderPostList();
    });

    document.querySelectorAll(MODAL_CLOSE_BTN).forEach((btn) => btn.addEventListener('click', handleCloseModals));
}


// Создаем объект поста и сохраняем его в ls
function createPostObject(title, description = '') {
    const timeOfCreation = new Date();
    const timeOfEditing = new Date();
    const postId = timeOfCreation + Math.random().toString(16).slice(2);

    const listOfPosts = storage.get(LIST_OF_POSTS, []);

    const newPostObject = {
        id: postId,
        title,
        description,
        timeOfCreation,
        timeOfEditing
    }

    listOfPosts.push(newPostObject);

    storage.set(LIST_OF_POSTS, listOfPosts);
}


// Обрабатываем нажатие на кнопку создание поста
createPostBtn && createPostBtn.addEventListener('click', () => {
    const title = createPostTitle.value;
    const description = createPostDescription.value;
    if (title !== '') {
        createPostObject(title, description);

        createPostTitle.value = '';
        createPostDescription.value = '';

        return renderPostList();
    }
});


// Отрендериваем список постов
function renderPostList() {
    const listOfPosts = storage.get(LIST_OF_POSTS, []).reverse();
    listOfPostsContainer.innerHTML = '';

    listOfPosts.map(({
        id,
        title,
        description
    }) => {
        const post = createPostElement(title, description, id);
        post.querySelector(POST_EDIT_BTN)
            .addEventListener('click', (event) => editPostModal(id, event));

        listOfPostsContainer.append(post);
    });
}


// Сохраняем в localStorage
const storage = {
    get: (key, defaultValue) => {
        try {
            const result = localStorage.getItem(key)
            if (!result) return defaultValue
            try {
                return JSON.parse(result)
            } catch {
                return result
            }
        } catch {
            return defaultValue
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(
                key,
                typeof value === 'string' ? value : JSON.stringify(value)
            )
        } catch {
            return null
        }
    },
    clear: () => {
        localStorage.clear()
    }
}


// Получить пост по id
function getPostById(id) {
    const listOfPosts = storage.get(LIST_OF_POSTS, []);

    return listOfPosts.find(({id: postId}) => postId === id);
}


// Закрыть все модалки
function handleCloseModals() {
    modalEditPost.style.display = 'none';
    modalWatchPost.style.display = 'none';
}


// Рендерим посты
renderPostList();
