if (!Cookies.get('user')) {
    window.location.replace('auth.html')
}

const logout = document.querySelector('#buttonLogout');

const rootPopup = document.querySelector('.root-popup');
const popupCats = document.querySelector('.popup_type_cats-info');
const popupAddCats = document.querySelector('.popup_type_cats-add');
const popupEditCats = document.querySelector('.popup_type_cats-edit');

const formAdd = popupAddCats.querySelector('.popup__form');
const formEdit = popupEditCats.querySelector('.popup__form');

const inputId = formAdd.querySelector('#id');
const inputName = formAdd.querySelector('#name');
const inputImg = formAdd.querySelector('#img_link');
const inputDesc = formAdd.querySelector('#description');

const popupCatsImage = popupCats.querySelector('.popup__image');
const popupCatsText = popupCats.querySelector('.popup__text');
const popupCatsName = popupCats.querySelector('.popup__name');

const catImages = document.querySelectorAll('.cat__image');
const closePopupCats = document.querySelector('.popup__close');
const cardTemplate = document.querySelector('#card-tempalte');
const cardListContainer = document.querySelector('.cats-list');

const buttonReloadData = document.querySelector('.reload-data');
const buttonAddCat = document.querySelector('#button-add-cat');

function formSerialize(form) {
    const result = {}
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        result[input.name] = input.value;
    })
    return result;
}

function setLocalStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getLocalStorageData(key) {
    return JSON.parse(localStorage.getItem(key));
}

function openPopup(popup) {
    popup.classList.add('popup_opened');
}

function closePopup() {
    const popupActive = document.querySelector('.popup_opened');
    if (popupActive) {
        popupActive.classList.remove('popup_opened');
    }
}

function handleClickCloseBtn(event) {
    if (event.target.classList.contains('popup__close')) {
        closePopup();
    }
}

function createCardCat(dataCat) {
    const newCardElement = cardTemplate.content.querySelector('.cats-list__item').cloneNode(true);
    const cardImage = newCardElement.querySelector('.cat__image');
    const cardName = newCardElement.querySelector('.cat__title');
    const cardButtonEdit = newCardElement.querySelector('.cat__edit');
    const cardButtonDelete = newCardElement.querySelector('.cat__delete');

    cardImage.src = dataCat.img_link;
    cardImage.dataset.id = dataCat.id;
    cardName.textContent = dataCat.name;

    function handleClickCatImage() {
        popupCatsImage.src = dataCat.img_link;
        popupCatsName.textContent = dataCat.name;
        popupCatsText.textContent = dataCat.description;
        openPopup(popupCats)
    }

    function handleClickCatEdit() {
        const inputs = formEdit.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = dataCat[input.name];
        });
        openPopup(popupEditCats)
        formEdit.addEventListener('submit', (evt) => {
            evt.preventDefault();
            const bodyJSON = formSerialize(formEdit)
            fetch(`https://sb-cats.herokuapp.com/api/update/${dataCat.id}`, {
                method: 'PUT',
                body: JSON.stringify(bodyJSON),
                headers: {
                    "Content-type": "application/json"
                }
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(response)
                })
                .then((data) => {
                    if (data.message === 'ok') {
                        reloadData();
                        closePopup();
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        })
    }

    function handleClickButtonDelete() {
        if (window.confirm('Удалить?', true)) {
            fetch(`https://sb-cats.herokuapp.com/api/delete/${dataCat.id}`, {
                method: 'DELETE'
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(response)
                })
                .then((data) => {
                    console.log(data);
                    if (data.message === 'ok') {
                        newCardElement.remove();
                        const oldData = getLocalStorageData('cats');
                        const newData = oldData.filter(item => item.id !== dataCat.id);
                        setLocalStorageData('cats', newData);
                    }
                })
        }

    }

    cardButtonEdit.addEventListener('click', handleClickCatEdit)
    cardButtonDelete.addEventListener('click', handleClickButtonDelete)
    cardImage.addEventListener('click', handleClickCatImage)

    return newCardElement;
}

function cardAddToContainer(elementNode, container) {
    container.prepend(elementNode)
}

function getCats() {
    fetch('https://sb-cats.herokuapp.com/api/show')
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response)
        })
        .then(({ data }) => {
            localStorage.setItem('cats', JSON.stringify(data))
            data.forEach(dataCat => cardAddToContainer(createCardCat(dataCat), cardListContainer))
        })
        .catch(err => {
            console.log(err);
        })
}

function handleClickButtonAdd() {
    openPopup(popupAddCats)
}

formAdd.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const bodyJSON = formSerialize(formAdd)
    fetch('https://sb-cats.herokuapp.com/api/add', {
        method: 'POST',
        body: JSON.stringify(bodyJSON),
        headers: {
            "Content-type": "application/json"
        }
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response)
        })
        .then((data) => {
            if (data.message === 'ok') {
                reloadData();
                closePopup();
            }
        })
        .catch(err => {
            console.log(err);
        })
})

function reloadData() {
    localStorage.clear();
    cardListContainer.innerHTML = "";
    getCats()
}

buttonAddCat.addEventListener('click', handleClickButtonAdd);
rootPopup.addEventListener('click', handleClickCloseBtn);
buttonReloadData.addEventListener('click', reloadData);

logout.addEventListener('click', (e) => {
    window.location.replace('auth.html');
    Cookies.remove('user');
    localStorage.clear();
})

getCats();

