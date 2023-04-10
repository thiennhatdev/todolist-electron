require("bootstrap-datepicker")

const { ipcRenderer, remote } = require('electron');
const path = require('path');
const $ = require('jquery');
const moment = require('moment');


const Notification = remote.Notification;

const dbInstance = remote.getGlobal('db');

const fileField = document.querySelector('.input-file');
const titleField = document.querySelector('.input-title');
const contentField = document.querySelector('.input-content');
const secureField = document.querySelector('.select-secure');
const sendPlaceField = document.querySelector('.input-send-place');
const receiveDateField = document.querySelector('.input-receive-date');
const requireField = document.querySelector('.input-require');
const approveField = document.querySelector('.input-approve');
const progressField = document.querySelector('.select-progress');
const searchKeywordField = document.querySelector('.input-search-keyword');

const btnAddNotification = document.querySelector('.btn-add-notification');

const btnAddWork = document.querySelector('.btn-add-work');
const titleModal = document.querySelector('.add-work__title');
const addBtnText = document.querySelector('.btn-add-work');

window.addEventListener('DOMContentLoaded', (event) => {
    const secureList = Object.values(MUC_DO_MAT);
    secureList.shift();
    secureField.innerHTML = `
        <option disabled selected value="">Mức độ mật</option>
        ${secureList.map(item => (
            `<option value=${item.value}>${item.label}</option>`
        ))}
    `

    progressField.innerHTML = `
        <option disabled selected value="">Quá trình thực hiện</option>
        ${Object.values(QUA_TRINH).map(item => (
            `<option value=${item.value}>${item.label}</option>`
        ))}
    `

    btnAddNotification.addEventListener('click', () => {
        const formAddNotification = document.querySelector('.form-add-notification');
        const newNode = document.createElement("div");
        newNode.innerHTML = `
            <div class='d-flex item-add-notification mt-2'>
                <input name='content-notification' type='text' placeholder='Nội dung thông báo' class='form-control input-title-notification' />
                <input type="text" name="date-notification" class="form-control datepicker input-date-notification" placeholder="Chọn ngày" autocomplete="off" autofill="off">
            </div>
        `

        formAddNotification.appendChild(newNode);
        $(".datepicker").datepicker({
            format: "dd/mm/yyyy",
          })
    })

    $(".datepicker").datepicker({
        format: "dd/mm/yyyy",
        // endDate: "0d",
        //   clearBtn: true,
        //   todayBtn: true,
        // todayHighlight: true
      })
});

ipcRenderer.on('item-work', (event, item) => {
    const { _id , filePath, title, content, secure, sendPlace, receiveDate, require, remind, approve, progress, searchKeyword} = item;
    const fullPath = `file://${filePath?.path}favicon.ico`;
    let fileName = filePath?.name;
    let file = new File([fullPath], fileName,{type:"image/jpeg", lastModified:new Date().getTime()}, 'utf-8');
    let container = new DataTransfer(); 
    container.items.add(file);

    
    if (_id) {
        const formAddNotification = document.querySelector('.form-add-notification');
        formAddNotification.innerHTML = ``;

        remind && remind.forEach(item => {
            const newNode = document.createElement("div");
            newNode.innerHTML = `
                <div class='d-flex item-add-notification mt-2'>
                    <input name='content-notification' type='text' placeholder='Nội dung thông báo' class='form-control input-title-notification' value="${item.title}" />
                    <input type="text" name="date-notification" class="form-control datepicker input-date-notification" placeholder="Chọn ngày" autocomplete="off" autofill="off" value="${item.time}">
                </div>
            `
            formAddNotification.appendChild(newNode)
            $(".datepicker").datepicker({
            format: "dd/mm/yyyy",
            })
        })

        
        fileField.files = container.files;
        titleField.value = title;
        contentField.value = content;
        secureField.value = secure;
        sendPlaceField.value = sendPlace;
        receiveDateField.value = moment(receiveDate).format('DD/MM/YYYY');
        requireField.value = require;
        progressField.value = progress;
        searchKeywordField.value = searchKeyword;
        titleModal.innerText = 'SỬA CÔNG VIỆC';
        addBtnText.innerText = 'Sửa';
    } else {
        titleModal.innerText = 'THÊM CÔNG VIỆC';
        addBtnText.innerText = 'Thêm';
    }

    btnAddWork.addEventListener('click', (e) => {
        let regexSplitFileNameOnWin = /[^\\]*$/;
        let regexSplitFileNameOnMac = /[^\/]*$/;
        let fileName = fileField.files[0]?.name;
        let fullPath = fileField.files[0]?.path;
        
        let pathContainFile = fullPath?.replace(regexSplitFileNameOnWin, '') 
                                || fullPath?.replace(regexSplitFileNameOnMac, '') 
                                || filePath?.path;
        let validateText = '';
        let itemAddNotification = document.querySelectorAll('.item-add-notification');
        let notificationList = [];

        itemAddNotification.forEach(item => {
            notificationList.push({
                title: item.children[0].value,
                time: item.children[1].value
            })
        })

        const body = {
            filePath: {
                path: pathContainFile,
                name: fileName
            },
            title: titleField.value,
            content: contentField.value,
            secure: secureField.value,
            sendPlace: sendPlaceField.value.toUpperCase(),
            receiveDate: moment(receiveDateField.value, 'DD/MM/YYYY').valueOf(),
            require: requireField.value,
            remind: notificationList,
            approve: approveField.value,
            progress: progressField.value,
            searchKeyword: searchKeywordField.value,
            filterText: `${titleField.value.toUpperCase()} ${contentField.value.toUpperCase()} ${searchKeywordField.value.toUpperCase()}`
        }

        if (!pathContainFile) validateText = 'Chọn file là bắt buộc!';
        if (!body.title) validateText = 'Tên văn bản là bắt buộc!';
        if (!body.content) validateText = 'Nội dung là bắt buộc!';
        if (!body.secure) validateText = 'Độ mật là bắt buộc!';
        if (!body.sendPlace) validateText = 'Nơi gửi là bắt buộc!';
        if (!body.receiveDate) validateText = 'Ngày nhận là bắt buộc!';

        if (validateText) {
            new Notification({title: "Yêu cầu", body: validateText}).show()
            e.preventDefault();
            e.stopPropagation();
            return
        }

        try {
            if (!_id) {
                dbInstance.create(body)
                .then(res => {
                    new Notification({title: "Thành công!", body: 'Thêm mới thành công!'}).show();
                    ipcRenderer.send('add-edit-success', {})
                    remote.getCurrentWindow().close();
                })
            } else {
                dbInstance.archive(_id, body)
                .then(res => {
                    new Notification({title: "Thành công!", body: 'Sửa thành công!'}).show()
                    ipcRenderer.send('add-edit-success', {})
                    remote.getCurrentWindow().close();
                })
            }
        } catch (e) {
        }

    })
})



