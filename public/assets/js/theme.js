const funcContent = (content, i) => {
    content.forEach((c, nbr) => {
        c.classList.add("d-none");
        if (nbr == i) {
            c.classList.remove("d-none");
        }
    });
};

const navigate = document.querySelectorAll('[navigate]');
const content = document.querySelectorAll('[contente]');

navigate.forEach((n, index) => {
    n.addEventListener("click", (event) => {
        event.preventDefault();
        navigate.forEach(s => {
            s.classList.remove("btn-primary");
        });
        funcContent(content, index);
        n.classList.add("btn-primary");
    });
});

$(document).ready(function () {
    var max = 200;
    $(".readMore").each(function () {
        var str = $(this).text();
        if ($.trim(str).length > max) {
            var subStr = str.substring(0, max);
            var hiddenStr = str.substring(max, $.trim(str).length);
            $(this).empty().html(subStr);
            $(this).append(' <a href="javascript:void(0);" class="lire-plus">(...)</a>');
            $(this).append('<span class="addText">' + hiddenStr + '</span>');
        }
    });
});

async function urllink(dataToEncrypt) {
    let data = dataToEncrypt.toLowerCase();
    data = data.replace(/[^a-zA-Z0-9]/g, '');
    return data;
}

fetch("/all/organes")
    .then((response) => response.json())
    .then(async (data) => {
        const org = document.querySelector("[data-org]");
        data.forEach(async (item) => {
            const dataurl = await urllink(item.name);
            let organe = `<div class="card rounded-1 p-3 mt-2 organe" id-data-organe="${item.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="">
                        <a href="/presse/${dataurl}" class="text-primary">
                            <img src="/assets/logos/${item.logo}" width="52" >
                            ${item.name}</a>
                    </div>
                </div>
            </div>`;
            org.innerHTML += organe;
            await urll();
        });

    })
    .catch((error) => {
        console.error("Erreur:", error);
    });

const urll = () => {
    let data = document.querySelector('[organe_id]');
    if (data) {
        data = data.getAttribute('organe_id');
        let org = document.querySelectorAll('[id-data-organe]');
        if (org) {
            org.forEach((item) => {
                if (item.getAttribute('id-data-organe') == data) {
                    item.classList.add("active");
                }
            });
        }
    }
}

const formSearch = document.querySelector('#search');
if (formSearch) {
    formSearch.addEventListener("submit", (event) => {
        event.preventDefault();
        const submit = formSearch.querySelector('[type="search"]');
        window.location.href = "/search/" + submit.value;
    });
}
