/* =========================================================
   PERSONAL FINANCE APP
   GitHub Pages + LocalStorage
========================================================= */


/* ================= CONFIG ================= */

const STORAGE_KEY = "personal_finance_transactions";

const categories = {

    income: [
        "เงินเดือน",
        "โบนัส",
        "ธุรกิจ",
        "ลงทุน",
        "รายได้อื่นๆ"
    ],

    expense: [
        "อาหาร",
        "เดินทาง",
        "ที่พัก",
        "ช้อปปิ้ง",
        "บิล / ค่าสาธารณูปโภค",
        "สุขภาพ",
        "การศึกษา",
        "บันเทิง",
        "ครอบครัว",
        "หนี้สิน",
        "อื่นๆ"
    ]

};


/* ================= STATE ================= */

let transactions =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let deleteId = null;


/* ================= DOM ================= */

const dashboardSection =
    document.getElementById("dashboardSection");

const transactionsSection =
    document.getElementById("transactionsSection");

const addSection =
    document.getElementById("addSection");

const pageTitle =
    document.getElementById("pageTitle");

const transactionForm =
    document.getElementById("transactionForm");

const amount =
    document.getElementById("amount");

const description =
    document.getElementById("description");

const category =
    document.getElementById("category");

const date =
    document.getElementById("date");

const note =
    document.getElementById("note");

const transactionType =
    document.getElementById("transactionType");

const editId =
    document.getElementById("editId");


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

    initialize();

});


function initialize() {

    const now = new Date();

    const today =
        now.toISOString().split("T")[0];

    date.value = today;

    dashboardMonth.value =
        today.substring(0, 7);

    loadCategories();

    updateCategoryFilter();

    renderDashboard();

    renderTransactions();

    setupEvents();

}


/* ================= EVENTS ================= */

function setupEvents() {


    /* Navigation */

    document.querySelectorAll(".nav-item[data-section]")
        .forEach(button => {

            button.addEventListener("click", () => {

                showSection(
                    button.dataset.section
                );

            });

        });


    /* Quick Add */

    document.getElementById("quickAddBtn")
        .addEventListener("click", () => {

            resetForm();

            showSection("add");

        });


    document.getElementById("addTransactionBtn")
        .addEventListener("click", () => {

            resetForm();

            showSection("add");

        });


    /* View all */

    document.getElementById("viewAllBtn")
        .addEventListener("click", () => {

            showSection("transactions");

        });


    /* Cancel */

    document.getElementById("cancelBtn")
        .addEventListener("click", () => {

            resetForm();

            showSection("dashboard");

        });


    /* Form */

    transactionForm
        .addEventListener("submit", saveTransaction);


    /* Type */

    document.querySelectorAll(".type-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                setTransactionType(
                    button.dataset.type
                );

            });

        });


    /* Filters */

    document.getElementById("searchInput")
        .addEventListener(
            "input",
            renderTransactions
        );


    document.getElementById("typeFilter")
        .addEventListener(
            "change",
            renderTransactions
        );


    document.getElementById("categoryFilter")
        .addEventListener(
            "change",
            renderTransactions
        );


    /* Dashboard Month */

    document.getElementById("dashboardMonth")
        .addEventListener(
            "change",
            renderDashboard
        );


    document.getElementById("thisMonthBtn")
        .addEventListener("click", () => {

            const now = new Date();

            dashboardMonth.value =
                now.toISOString()
                    .substring(0, 7);

            renderDashboard();

        });


    /* Dark mode */

    document.getElementById("darkModeBtn")
        .addEventListener(
            "click",
            toggleDarkMode
        );


    /* Export */

    document.getElementById("exportBtn")
        .addEventListener(
            "click",
            exportCSV
        );


    /* Modal */

    document.getElementById("closeModal")
        .addEventListener("click", closeDeleteModal);


    document.getElementById("confirmDelete")
        .addEventListener("click", confirmDelete);

}


/* ================= NAVIGATION ================= */

function showSection(section) {

    document.querySelectorAll(".section")
        .forEach(s => s.classList.remove("active"));


    document.querySelectorAll(".nav-item[data-section]")
        .forEach(b => b.classList.remove("active"));


    if (section === "dashboard") {

        dashboardSection.classList.add("active");

        pageTitle.textContent = "Dashboard";

    }


    if (section === "transactions") {

        transactionsSection.classList.add("active");

        pageTitle.textContent =
            "รายการทั้งหมด";

    }


    if (section === "add") {

        addSection.classList.add("active");

        pageTitle.textContent =
            editId.value
                ? "แก้ไขรายการ"
                : "เพิ่มรายการ";

    }


    const navButton =
        document.querySelector(
            `.nav-item[data-section="${section}"]`
        );

    if (navButton) {

        navButton.classList.add("active");

    }

}


/* ================= CATEGORIES ================= */

function loadCategories() {

    updateFormCategories();

}


function updateFormCategories() {

    category.innerHTML = "";

    const type =
        transactionType.value;

    categories[type].forEach(item => {

        const option =
            document.createElement("option");

        option.value = item;

        option.textContent = item;

        category.appendChild(option);

    });

}


function updateCategoryFilter() {

    const filter =
        document.getElementById("categoryFilter");

    filter.innerHTML =
        `<option value="all">ทุกหมวดหมู่</option>`;


    const allCategories = [
        ...categories.income,
        ...categories.expense
    ];


    [...new Set(allCategories)]
        .forEach(item => {

            const option =
                document.createElement("option");

            option.value = item;

            option.textContent = item;

            filter.appendChild(option);

        });

}


/* ================= TYPE ================= */

function setTransactionType(type) {

    transactionType.value = type;

    document.querySelectorAll(".type-btn")
        .forEach(button => {

            button.classList.remove("active");

        });


    document.querySelector(
        `.type-btn[data-type="${type}"]`
    ).classList.add("active");


    updateFormCategories();

}


/* ================= SAVE ================= */

function saveTransaction(event) {

    event.preventDefault();


    const data = {

        type: transactionType.value,

        amount:
            Number(amount.value),

        description:
            description.value.trim(),

        category:
            category.value,

        date:
            date.value,

        note:
            note.value.trim()

    };


    if (
        !data.amount ||
        data.amount <= 0 ||
        !data.description ||
        !data.date
    ) {

        alert("กรุณากรอกข้อมูลให้ครบ");

        return;

    }


    if (editId.value) {

        const id =
            Number(editId.value);

        const index =
            transactions.findIndex(
                item => item.id === id
            );

        if (index !== -1) {

            transactions[index] = {

                ...transactions[index],

                ...data

            };

        }

    } else {

        transactions.push({

            id: Date.now(),

            ...data

        });

    }


    saveData();

    resetForm();

    renderDashboard();

    renderTransactions();

    showSection("transactions");

}


/* ================= EDIT ================= */

function editTransaction(id) {

    const item =
        transactions.find(
            transaction =>
                transaction.id === id
        );


    if (!item) return;


    editId.value = item.id;

    amount.value = item.amount;

    description.value =
        item.description;

    date.value = item.date;

    note.value = item.note || "";


    setTransactionType(item.type);

    category.value =
        item.category;


    document.getElementById("formTitle")
        .textContent =
        "แก้ไขรายการ";


    showSection("add");

}


/* ================= DELETE ================= */

function deleteTransaction(id) {

    deleteId = id;

    document.getElementById("deleteModal")
        .classList.add("show");

}


function closeDeleteModal() {

    deleteId = null;

    document.getElementById("deleteModal")
        .classList.remove("show");

}


function confirmDelete() {

    if (!deleteId) return;


    transactions =
        transactions.filter(
            item => item.id !== deleteId
        );


    saveData();

    closeDeleteModal();

    renderDashboard();

    renderTransactions();

}


/* ================= STORAGE ================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );

}


/* ================= RESET FORM ================= */

function resetForm() {

    transactionForm.reset();

    editId.value = "";

    document.getElementById("formTitle")
        .textContent =
        "เพิ่มรายการ";


    transactionType.value = "income";

    setTransactionType("income");


    const now = new Date();

    date.value =
        now.toISOString()
            .split("T")[0];

}


/* ================= DASHBOARD ================= */

function renderDashboard() {

    const month =
        dashboardMonth.value;


    const filtered =
        transactions.filter(item =>
            item.date.startsWith(month)
        );


    const income =
        filtered
            .filter(item =>
                item.type === "income"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const expense =
        filtered
            .filter(item =>
                item.type === "expense"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const balance =
        income - expense;


    document.getElementById("totalIncome")
        .textContent =
        formatMoney(income);


    document.getElementById("totalExpense")
        .textContent =
        formatMoney(expense);


    document.getElementById("totalBalance")
        .textContent =
        formatMoney(balance);


    document.getElementById("transactionCount")
        .textContent =
        filtered.length;


    renderMonthlyChart(filtered);

    renderCategoryChart(filtered);

    renderRecentTransactions(filtered);

}


/* ================= MONEY ================= */

function formatMoney(value) {

    return new Intl.NumberFormat(
        "th-TH",
        {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 2
        }
    ).format(value);

}


/* ================= RECENT ================= */

function renderRecentTransactions(items) {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    const sorted =
        [...items]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    if (!sorted.length) {

        container.innerHTML =
            `<div class="empty">
                ยังไม่มีรายการในเดือนนี้
            </div>`;

        return;

    }


    container.innerHTML =
        sorted.map(item => {

            const sign =
                item.type === "income"
                    ? "+"
                    : "-";


            const color =
                item.type === "income"
                    ? "amount-income"
                    : "amount-expense";


            return `

                <div class="transaction-row">

                    <div>

                        <strong>
                            ${escapeHTML(item.description)}
                        </strong>

                        <div class="muted">
                            ${escapeHTML(item.category)}
                            · ${formatDate(item.date)}
                        </div>

                    </div>

                    <strong class="${color}">
                        ${sign}${formatMoney(item.amount)}
                    </strong>

                </div>

            `;

        }).join("");

}


/* ================= TRANSACTION TABLE ================= */

function renderTransactions() {

    const tbody =
        document.getElementById(
            "transactionTable"
        );


    const search =
        document.getElementById(
            "searchInput"
        ).value.toLowerCase();


    const type =
        document.getElementById(
            "typeFilter"
        ).value;


    const categoryValue =
        document.getElementById(
            "categoryFilter"
        ).value;


    let filtered =
        transactions.filter(item => {


            const matchesSearch =
                item.description
                    .toLowerCase()
                    .includes(search) ||

                item.category
                    .toLowerCase()
                    .includes(search) ||

                (item.note || "")
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "all" ||
                item.type === type;


            const matchesCategory =
                categoryValue === "all" ||
                item.category === categoryValue;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    if (!filtered.length) {

        tbody.innerHTML = `

            <tr>
                <td colspan="6">

                    <div class="empty">
                        ไม่พบรายการ
                    </div>

                </td>
            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(item => {

            const isIncome =
                item.type === "income";


            return `

                <tr>

                    <td>
                        ${formatDate(item.date)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(item.description)}
                        </strong>

                        ${
                            item.note
                                ? `<div class="muted">
                                    ${escapeHTML(item.note)}
                                   </div>`
                                : ""
                        }

                    </td>

                    <td>
                        ${escapeHTML(item.category)}
                    </td>

                    <td>

                        <span class="
                            badge
                            ${
                                isIncome
                                    ? "badge-income"
                                    : "badge-expense"
                            }
                        ">

                            ${
                                isIncome
                                    ? "รายรับ"
                                    : "รายจ่าย"
                            }

                        </span>

                    </td>

                    <td class="
                        ${
                            isIncome
                                ? "amount-income"
                                : "amount-expense"
                        }
                    ">

                        ${
                            isIncome
                                ? "+"
                                : "-"
                        }

                        ${formatMoney(item.amount)}

                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="icon-btn"
                                onclick="editTransaction(${item.id})"
                                title="แก้ไข"
                            >
                                ✏️
                            </button>

                            <button
                                class="icon-btn"
                                onclick="deleteTransaction(${item.id})"
                                title="ลบ"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/* ================= MONTHLY CHART ================= */

function renderMonthlyChart(items) {

    const canvas =
        document.getElementById(
            "monthlyChart"
        );


    const ctx =
        canvas.getContext("2d");


    resizeCanvas(canvas);


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const width = canvas.width;

    const height = canvas.height;


    const padding = 45;


    const income =
        items
            .filter(x => x.type === "income")
            .reduce(
                (sum, x) =>
                    sum + Number(x.amount),
                0
            );


    const expense =
        items
            .filter(x => x.type === "expense")
            .reduce(
                (sum, x) =>
                    sum + Number(x.amount),
                0
            );


    const max =
        Math.max(income, expense, 1);


    const chartHeight =
        height - padding * 2;


    const values = [
        {
            label: "รายรับ",
            value: income
        },
        {
            label: "รายจ่าย",
            value: expense
        }
    ];


    const barWidth = 80;

    const gap = 50;


    values.forEach((item, index) => {

        const x =
            padding +
            index *
            (barWidth + gap) +
            60;


        const barHeight =
            (item.value / max) *
            chartHeight;


        const y =
            height -
            padding -
            barHeight;


        ctx.fillStyle =
            item.label === "รายรับ"
                ? "#16a34a"
                : "#dc2626";


        ctx.fillRect(
            x,
            y,
            barWidth,
            barHeight
        );


        ctx.fillStyle =
            getComputedStyle(document.body)
                .getPropertyValue("--text");


        ctx.font =
            "bold 13px sans-serif";


        ctx.textAlign = "center";


        ctx.fillText(
            item.label,
            x + barWidth / 2,
            height - 15
        );


        ctx.font =
            "12px sans-serif";


        ctx.fillText(
            formatShortMoney(item.value),
            x + barWidth / 2,
            Math.max(y - 8, 15)
        );

    });

}


/* ================= CATEGORY CHART ================= */

function renderCategoryChart(items) {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    const ctx =
        canvas.getContext("2d");


    resizeCanvas(canvas);


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const expenses =
        {};


    items
        .filter(item =>
            item.type === "expense"
        )
        .forEach(item => {

            expenses[item.category] =
                (expenses[item.category] || 0)
                + Number(item.amount);

        });


    const entries =
        Object.entries(expenses)
            .sort(
                (a, b) => b[1] - a[1]
            )
            .slice(0, 7);


    if (!entries.length) {

        ctx.fillStyle =
            getComputedStyle(document.body)
                .getPropertyValue("--muted");

        ctx.font =
            "14px sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "ยังไม่มีข้อมูลค่าใช้จ่าย",
            canvas.width / 2,
            canvas.height / 2
        );

        return;

    }


    const total =
        entries.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );


    let startAngle = -Math.PI / 2;


    const centerX =
        canvas.width * 0.35;

    const centerY =
        canvas.height / 2;

    const radius =
        Math.min(
            canvas.width,
            canvas.height
        ) * 0.3;


    entries.forEach((entry, index) => {

        const percentage =
            entry[1] / total;


        const endAngle =
            startAngle +
            percentage * Math.PI * 2;


        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        ctx.closePath();


        ctx.fillStyle =
            chartColor(index);


        ctx.fill();


        startAngle = endAngle;

    });


    /* Legend */

    entries.forEach((entry, index) => {

        const y =
            25 + index * 30;


        ctx.fillStyle =
            chartColor(index);


        ctx.fillRect(
            canvas.width * 0.68,
            y,
            12,
            12
        );


        ctx.fillStyle =
            getComputedStyle(document.body)
                .getPropertyValue("--text");


        ctx.font =
            "12px sans-serif";


        ctx.textAlign =
            "left";


        ctx.fillText(
            `${entry[0]} ${Math.round(entry[1] / total * 100)}%`,
            canvas.width * 0.68 + 18,
            y + 11
        );

    });

}


/* ================= CHART HELPERS ================= */

function resizeCanvas(canvas) {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;


    canvas
        .getContext("2d")
        .scale(dpr, dpr);


    /*
       หลัง scale แล้วใช้ขนาด CSS
       เพื่อให้คำนวณง่าย
    */

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

}


/* ================= COLORS ================= */

function chartColor(index) {

    const colors = [

        "#4f46e5",
        "#16a34a",
        "#f59e0b",
        "#dc2626",
        "#0891b2",
        "#9333ea",
        "#ea580c"

    ];


    return colors[index % colors.length];

}


/* ================= FORMAT ================= */

function formatShortMoney(value) {

    if (value >= 1000000) {

        return (
            (value / 1000000)
                .toFixed(1)
            + "M"
        );

    }


    if (value >= 1000) {

        return (
            (value / 1000)
                .toFixed(1)
            + "K"
        );

    }


    return Math.round(value);

}


function formatDate(value) {

    const date =
        new Date(value + "T00:00:00");


    return date.toLocaleDateString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* ================= DARK MODE ================= */

function toggleDarkMode() {

    document.body.classList.toggle("dark");


    const enabled =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "finance_dark_mode",
        enabled
    );


    renderDashboard();

}


if (
    localStorage.getItem(
        "finance_dark_mode"
    ) === "true"
) {

    document.body.classList.add("dark");

}


/* ================= CSV EXPORT ================= */

function exportCSV() {

    if (!transactions.length) {

        alert("ยังไม่มีข้อมูลให้ Export");

        return;

    }


    const header = [

        "วันที่",
        "ประเภท",
        "รายการ",
        "หมวดหมู่",
        "จำนวนเงิน",
        "หมายเหตุ"

    ];


    const rows =
        transactions.map(item => [

            item.date,

            item.type === "income"
                ? "รายรับ"
                : "รายจ่าย",

            item.description,

            item.category,

            item.amount,

            item.note || ""

        ]);


    const csv = [

        header,

        ...rows

    ]
        .map(row =>
            row.map(csvEscape).join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            ["\uFEFF" + csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `personal-finance-${new Date()
            .toISOString()
            .substring(0, 10)}.csv`;


    link.click();


    URL.revokeObjectURL(url);

}


function csvEscape(value) {

    const string =
        String(value ?? "");


    if (
        string.includes(",") ||
        string.includes('"') ||
        string.includes("\n")
    ) {

        return `"${string.replaceAll('"', '""')}"`;

    }


    return string;

}


/* ================= SECURITY ================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ================= RESPONSIVE CHART ================= */

window.addEventListener(
    "resize",
    () => {

        renderDashboard();

    }
);