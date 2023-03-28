require("bootstrap-datepicker")

const { remote, ipcRenderer } = require('electron');
const moment = require('moment');
const $ = require('jquery');

const Notification = remote.Notification;

const dbInstance = remote.getGlobal('db');

const fromReceiveDateField = document.querySelector('.from-receive-date');
const toReceiveDateField = document.querySelector('.to-receive-date');
const secureField = document.querySelector('.filter-secure');
const findInput = 
document.querySelector('#work-find-input');
const secureInput = document.querySelector('.filter-secure');
const sendPlaceInput = document.querySelector('.filter-send-place');

let objFilter = {
    findName: '',
    secure: '',
    sendPlace: '',
}

secureField.innerHTML = `
    <option disabled selected value="">Mức độ mật</option>
    ${Object.values(MUC_DO_MAT).map(item => (
        `<option value=${item.value}>${item.label}</option>`
    ))}
`

function createTodoItemView(item) {
    const { _id, stt, filePath, title, content, secure, sendPlace, receiveDate, require, remind, approve, progress, searchKeyword } = item;
    const trNode = document.createElement('tr');
    trNode.onclick = () => {
        openFileInFolder(filePath?.path);
    }

    trNode.innerHTML = 
    `
        <th scope="row"><span>${stt}</th>
        <td><span>${title}</span></td>
        <td><span class='text-nowrap ${MUC_DO_MAT[`${secure}`]?.style}'>${MUC_DO_MAT[`${secure}`]?.label}</span></td>
        <td><span>${sendPlace}</span></td>
        <td><span class='text-nowrap'>${moment(receiveDate).format('DD/MM/YYYY')}</span></td>
        <td><span>${content}</span></td>
        <td><span>${require || '-'}</span></td>
        <td>
            ${
                remind 
                    ? remind.map(item => {
                        return (
                            `<span class='text-nowrap'>${item.time}</span>`
                        )
                    }).join("")
                    : '-'
            }
        </td>
        <td><span>${approve}</span></td>
        <td><span class='${QUA_TRINH[progress]?.style}'>${QUA_TRINH[progress]?.label || '-'}</span></td>
        <td><span>${searchKeyword || '-'}</span></td>
        <td>
            <div class='d-flex'>
                <button 
                    class='btn btn-info mr-2' 
                    onclick="updateWork(${JSON.stringify(item).split('"').join("&quot;")}, event)"
                >Sửa</button>
                <button 
                    onclick='removeItem("${_id}", event)'
                    class='btn btn-danger'
                >Xoá</button>
            </div>
        </td>
    `
    return trNode;
}

function removeItem(_id, event) {
    event.stopPropagation();
    dbInstance.delete(_id)
        .then(result => {
            updateView(objFilter);
        })
}

function updateWork(item, event) {
    event.stopPropagation();
    ipcRenderer.send('data-from-edit', item)
}

function navigate(page, event) {
    localStorage.setItem('currentPage', page)
    updateView(objFilter, page);   
}

function openFileInFolder(filePath) {
    if (filePath) {
        const fullPath = `file://${filePath}`
        remote.shell.openExternal(fullPath);
    }
}

function updateView(objFilter = {}) {
    const todolistNode = document.querySelector('.tbody');
    const pagiParent = document.querySelector(".wrap-pagination");

    const currentPage = +localStorage.getItem('currentPage') || 1;

    todolistNode.innerHTML = ``;
    pagiParent.innerHTML = ``;

    dbInstance.totalRecord(objFilter).then(total => {
        if (total > LIMIT) {
            const totalPage = Math.ceil(total / LIMIT);
            const pagiNode = document.createElement('div');
            const basePaginationList = Array.from({length: totalPage}, (v, k) => k + 1);
            const startPage = currentPage - 4 > 0 ? currentPage - 4 : 0;
            const endPage = currentPage - 4 > 0 ? currentPage + 1 : currentPage + 1 + Math.abs(currentPage - 4) ;
            const currentPaginationList = basePaginationList.slice(startPage, endPage);

            pagiNode.innerHTML = `
            <nav>
                <ul class="pagination">
                    <li class="page-item" onclick="navigate(${+currentPage > 1 ? currentPage - 1 : currentPage}, event)"><a class="page-link" href="#">Trước</a></li>
                    ${
                        currentPaginationList.map(item => (
                            `<li class="page-item ${currentPage == item ? 'active' : ''}" onclick="navigate(${item}, event)">
                                <a class="page-link" href="#">${item}</a>
                            </li>`
                        )).join("")
                    }
                    <li disabled class="page-item" onclick="navigate(${currentPage < totalPage ? currentPage + 1 : currentPage}, event)"><a class="page-link" href="#">Sau</a></li>
                </ul>
            </nav>
            `;
            pagiParent.appendChild(pagiNode);
        }
    });

    dbInstance.readAll(objFilter, currentPage)
    .then(allTodolists => {
        allTodolists.forEach((item, index) => {
            const stt = (currentPage - 1) * LIMIT + ++index;
            const trNode = createTodoItemView({...item, stt});
            todolistNode.appendChild(trNode);
        });
    })
}

function sendNotification() {
    try {
        let format = 'DD/MM/YYYY';
        let today = new Date();
        let tomorrow = moment(today).add(1, 'days').format(format);
        let afterTomorrow = moment(today).add(2, 'days').format(format);

        const dateList = [tomorrow, afterTomorrow];
        dbInstance.remind(dateList).then(data => {
            data.forEach(item => {
                const isSentNotifi = JSON.parse(localStorage.getItem('isSentNotifi'));
                
                if (!isSentNotifi) {
                    item.remind.forEach(val => {
                        if (dateList.includes(val.time)) {
                            const noti = new Notification({title: val.time, body: val.title});
                    
                            // noti.on('close', () => {
                            //     localStorage.setItem("isSentNotifi", true)
                            // })

                            // noti.on('click', () => {
                            //     localStorage.setItem("isSentNotifi", true)
                            // })

                            setTimeout(() => {
                                localStorage.setItem("isSentNotifi", true)
                            }, 3000);

                            noti.show();
                        }
                    })
                    
                }
            })
        })
    } catch (e) {
        console.log(e)
    }
  }

document.getElementById('btn-add').addEventListener('click', (e) => {
    ipcRenderer.send('data-from-edit', {})
})

// find document === START

const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
}

const handleMouseMove = debounce((e) => {
    localStorage.setItem('currentPage', 1)
    let { name, value = ' ' } = e.target.value;

    objFilter = {
        fromReceiveDate: moment(fromReceiveDateField.value, 'DD/MM/YYYY').valueOf(),
        toReceiveDate: moment(toReceiveDateField.value, 'DD/MM/YYYY').valueOf(),
        findName: findInput.value.toUpperCase(),
        secure: secureInput.value,
        sendPlace: sendPlaceInput.value.toUpperCase(),
        [name]: value.toUpperCase()
    }

    updateView(objFilter)
  }, 400);

fromReceiveDateField.addEventListener('changeDate',handleMouseMove)
toReceiveDateField.addEventListener('changeDate',handleMouseMove)
findInput.addEventListener('keyup',handleMouseMove)
secureInput.addEventListener('change',handleMouseMove)
sendPlaceInput.addEventListener('keyup',handleMouseMove)


// find document === END
updateView(objFilter);

sendNotification();

$(".datepicker").datepicker({
    format: "dd/mm/yyyy"
}).on('change', (e, v) => {
    const { name, value } = e.target;
    localStorage.setItem('currentPage', 1);
    
    objFilter = {
        ...objFilter,
        [name]: moment(value, 'DD/MM/YYYY').valueOf(),
    }
    updateView(objFilter)
})

ipcRenderer.on('add-edit-success', (event) => {
    updateView(objFilter)
})