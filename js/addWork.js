const { ipcRenderer, remote } = require('electron');

const dbInstance = remote.getGlobal('db');

const titleField = document.querySelector('.input-title');
const contentField = document.querySelector('.input-content');
const secureField = document.querySelector('.select-secure');
const sendPlaceField = document.querySelector('.input-send-place');
const receiveDateField = document.querySelector('.input-receive-date');
const requireField = document.querySelector('.input-require');
const expiredDateField = document.querySelector('.input-expired-date');
const approveField = document.querySelector('.select-approve');
const progressField = document.querySelector('.select-progress');
const searchKeywordField = document.querySelector('.input-search-keyword');

const btnAddWork = document.querySelector('.btn-add-work');
const titleModal = document.querySelector('.add-work__title');
const addBtnText = document.querySelector('.btn-add-work');

ipcRenderer.on('item-work', (event, item) => {
    const { content, _id } = item;
    if (_id) {
        titleField.value = content;
        contentField.value = content;
        titleModal.innerText = 'Sửa công việc';
        addBtnText.innerText = 'Sửa';
    } else {
        titleModal.innerText = 'Thêm công việc';
        addBtnText.innerText = 'Thêm';
    }
    
    console.log(item, 'event from main')

    btnAddWork.addEventListener('click', (e) => {
        e.preventDefault();
        const body = {
            title: titleField.value,
            content: contentField.value,
            secure: secureField.value,
            sendPlace: sendPlaceField.value,
            receiveDate: receiveDateField.value,
            require: requireField.value,
            expiredDate: expiredDateField.value,
            approve: approveField.value,
            progress: progressField.value,
            searchKeyword: searchKeywordField.value,
        }
        if (!_id) {
            dbInstance.create(body)
            .then(res => {
                console.log(res, 'res')
                remote.getCurrentWindow().close();
            })
        } else {
            dbInstance.archive(_id, body)
            .then(res => {
                remote.getCurrentWindow().close();
            })
        }
    })
})



