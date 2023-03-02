const { remote, ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');
const { LIMIT } = require('./utils/contants');

const dbInstance = remote.getGlobal('db');

const BrowserWindow = remote.BrowserWindow;

function createTodoItemView(item) {
    const { stt, title, content, secure, sendPlace, receiveDate, require, expiredDate, approve, progress, searchKeyword } = item;
    const trNode = document.createElement('tr');

    trNode.innerHTML = 
    `
        <th scope="row"><span>${stt}</th>
        <td><span>${title}</span></td>
        <td><span>${secure}</span></td>
        <td><span>${sendPlace}</span></td>
        <td><span>${receiveDate}</span></td>
        <td><span>${content}</span></td>
        <td><span>${require}</span></td>
        <td><span>${expiredDate}</span></td>
        <td><span>${approve}</span></td>
        <td><span>${progress}</span></td>
        <td><span>${searchKeyword}</span></td>
    `

    // trNode.innerHTML = 
    //     `<span>${content}</span>
    //     <div class='d-flex'>
    //         <span onclick="updateWork(${JSON.stringify(item).split('"').join("&quot;")})">${'\&#9999;'}</span>
    //         <span class='close' onclick='removeItem("${_id}", event)'>${'\u00D7'}</span>
    //     </div>
    //     `;
    return trNode;
}

function removeItem(_id, event) {
    dbInstance.delete(_id)
        .then(result => {
            updateView();
        })
}

function updateWork(item) {
    ipcRenderer.send('data-from-edit', item)
}

function navigate(page, event) {
    localStorage.setItem('currentPage', page)
    const sortText = document.getElementById('work-find-input').value;
    updateView(sortText, page);   
}

function updateView(text = "", page = 1) {
    const todolistNode = document.querySelector('.tbody');
    const pagiParent = document.querySelector(".wrap-pagination");

    const currentPage = +localStorage.getItem('currentPage') || 1;

    todolistNode.innerHTML = ``;
    pagiParent.innerHTML = ``;

    dbInstance.totalRecord(text).then(total => {
        console.log(total, LIMIT, 'update view')
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
                        ))
                    }
                    <li disabled class="page-item" onclick="navigate(${currentPage < totalPage ? currentPage + 1 : currentPage}, event)"><a class="page-link" href="#">Sau</a></li>
                </ul>
            </nav>
            `;
            pagiParent.appendChild(pagiNode);
        }
    });

    dbInstance.readAll(text, page)
    .then(allTodolists => {
        allTodolists.forEach((item, index) => {
            const stt = (page - 1) * LIMIT + ++index;
            const trNode = createTodoItemView({...item, stt});
            todolistNode.appendChild(trNode);
        });
    })
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

const handleMouseMove = debounce((ev) => {
    const inputValue = document.getElementById('work-find-input').value;
    updateView(inputValue)
  }, 400);

document.getElementById('work-find-input').addEventListener('keyup',handleMouseMove)

// find document === END
updateView();