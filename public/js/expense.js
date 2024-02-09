async function createExpense(){
    const money=document.getElementById("moneySpent");
    const desc=document.getElementById("expenseDescription");
    const category=document.getElementById("expenseCategory");
    const userId=localStorage.getItem("userId");
    const data={money:money.value,description:desc.value,category:category.value,userId:userId};
    await axios.post("http://localhost:3000/create-expense",data).then(res=>{
        money.value=""
        desc.value=""
        category.value=""
        createRow(res.data);
    })
}

async function getAllData(){
    const userId=localStorage.getItem("userId");
    await axios.get(`http://localhost:3000/get-expenses/${userId}`,{headers:{
            "authorization":rowNumber
        }}).then(res=>{
        createRow(res.data)
    })
    await axios.get("http://localhost:3000/find-user",{headers:{
        "authorization":userId
        }}).then(res=>{
            if(res.data.isPremiumUser){
                showSubscribedBtn()
            }
            else {
                showSubscribeBtn()
            }
    })
}
function showSubscribedBtn(){
    const premiumList=document.getElementById("premium");
    premiumList.classList.remove("visually-hidden")
    const subscribed=document.getElementById("subscribed");
    subscribed.classList.remove("visually-hidden")
}

function showSubscribeBtn(){
    const subscribeBtn=document.getElementById("subscribe");
    subscribeBtn.classList.remove("visually-hidden");
    const notPremiumList=document.getElementById("notPremium");
    notPremiumList.classList.remove("visually-hidden")
}
function hideSubscribeBtn(){
    const subscribeBtn=document.getElementById("subscribe");
    subscribeBtn.classList.add("visually-hidden")
    const premiumList=document.getElementById("notPremium");
    premiumList.classList.add("visually-hidden")
}
function createRow(data){
    const tBody=document.getElementById("expenseTableBody");
    if(data.pageChanged){
        tBody.innerHTML=""
    }
    for (const trow of data.products) {
        const row=document.createElement("tr");
        row.id=trow.id;
        row.innerHTML=`<td>${trow.expense}</td>
    <td>${trow.description}</td>
    <td>${trow.category}</td>
    <td>
      <button class="btn btn-danger btn-sm" onclick=deleteData(${trow.id})>Delete</button>
    </td>`
        tBody.appendChild(row)
    }
    createPagination(data)
}

function createPagination(data){
    let totalPages = data.lastPage;
    if(totalPages===0) {
        totalPages++;
    }
    const paginationContainer = document.getElementById('expensePagination');
    paginationContainer.innerHTML="";
    if(data.hasPreviousPage){
        paginationContainer.innerHTML = `
            <li class="page-item">
                <a class="page-link" onclick="getPageData(${data.currentPage-1})" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
    }
    // Add numbered buttons
    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `
                <li id="page${i}" class="page-item"><a class="page-link"  onclick="getPageData(${i})">${i}</a></li>
            `;
    }
    const btn=document.getElementById(`page${data.currentPage}`)
    btn.classList.add("active")
    // Add "Next" button
    if(data.hasNextPage){
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" onclick="getPageData(${data.currentPage+1})" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
    }
}
async function getPageData(page){
    const userId=localStorage.getItem("userId");
    await axios.get(`http://localhost:3000/get-expenses/${userId}?page=${page}`,{headers:{
            "authorization":rowNumber
        }}).then(res=>{
        document.getElementById("expenseTableBody").innerHTML="";
        createRow(res.data);
    })
}
let rowNumber=5;
async function updateTable(){
    document.getElementById("expenseTableBody").innerHTML=""
    rowNumber=document.getElementById("rowsPerPage").value;
    await getAllData();
}
async function deleteData(id){
    const tRow=document.getElementById(id);
    const money=tRow.children[0].innerText;
    const userId=localStorage.getItem("userId");
    const data={money:money,userId:userId}
    await axios.post(`http://localhost:3000/delete-expense/${id}`,data).then(res=>{
        const tBody=document.getElementById("expenseTableBody");
        tBody.removeChild(tRow);
        if(res.data.removePage){
            getPageData(res.data.currentPage)
            createPagination(res.data)
        }
    })
}


function showNotPremium() {
    alert("Become premium member to access this feature");
}

async function subscribe(){
    const userId=localStorage.getItem("userId");
    const res=await axios.get("http://localhost:3000/purchase/purchase-premium",{headers:{"authorization":userId}})
    const options={
        "key":res.data.key_id,
        "order_id":res.data.id,
        "handler":async (res)=>{
            await axios.post("http://localhost:3000/purchase/update-payment-status",{
                orderId:options.order_id,
                paymentId: res.razorpay_payment_id
            },{headers: {"authorization":userId}}).then(()=>{
                hideSubscribeBtn()
                showSubscribedBtn()
                alert("You are a premium user now")
            })


        },
        "modal": {
            "ondismiss":async function(){
                await axios.post("http://localhost:3000/purchase/payment-failed",{
                    orderId:options.order_id,
                    status:"FAILED"
                })
            }
        }
    }
    const razorpay=new Razorpay(options);
    razorpay.open()
    razorpay.on("payment.failed",async()=>{
        await axios.post("http://localhost:3000/purchase/payment-failed",{
            orderId:options.order_id,
            status: "FAILED"
        })
        alert("Payment Failed")
    })
}

async function showLeaderBoard(){
    await axios.get("http://localhost:3000/premium/leaderboard").then(res=>{
        const mainBody=document.getElementById("mainBody");
        mainBody.innerHTML=`<div id="leaderboardTable">
                <h3 class="mt-5 text-center">Leaderboard</h3>
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Name</th>
                        <th scope="col">Expense</th>
                    </tr>
                    </thead>
                    <tbody id="leaderboardTableBody">
                        <!-- Leaderboard data will be loaded here dynamically -->
                    </tbody>
                </table>
            </div>`;
        const tbody=document.getElementById("leaderboardTableBody");
        for (let i = 0; i < res.data.length; i++) {
            const tr=document.createElement("tr");
            tr.innerHTML=`<tr>
                        <td>${i+1}</td>
                        <td>${res.data[i].name}</td>
                        <td>${res.data[i].totalExpense||0}</td>
                    </tr>`;
            tbody.appendChild(tr)
        }
    })
}

async function showExpense(){
    const mainBody=document.getElementById("mainBody");
    mainBody.innerHTML=`
<div class="container mt-5 bg-light p-4 rounded shadow">
    <h2 class="mb-4">Expense and Income Tracker</h2>

    <!-- Filter Buttons -->
    <div class="btn-group mb-3">
<!--        <button class="btn btn-primary filter-btn active" data-filter="all">All</button>-->
        <button class="btn btn-secondary" id="daily" onclick="dailyBtnClicked()"  data-filter="daily">Daily</button>
<!--        <button class="btn btn-secondary filter-btn" data-filter="weekly">Weekly</button>-->
        <button class="btn btn-secondary" id="monthly" onclick="monthlyBtnClicked()" data-filter="monthly">Monthly</button>
    </div>
    <div id="calender"></div>
    <!-- Responsive Table Container -->
    <div class="table-responsive">
        <table class="table table-bordered table-striped">
            <thead class="bg-primary text-light">
            <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>         
                <th scope="col">Amount</th>
            </tr>
            </thead>
            <tbody id="expenseTableBody">
                <!-- Expenses and Incomes will be loaded here dynamically -->
            </tbody>
        </table>
    </div>

</div>
    `
}
function showDailyBtnActive(){
    const dailyBtn=document.getElementById("daily");
    const monthlyBtn=document.getElementById("monthly")
    dailyBtn.classList.add("active");
    monthlyBtn.classList.remove("active")
}
function showMonthlyBtnActive(){
    const dailyBtn=document.getElementById("daily");
    const monthlyBtn=document.getElementById("monthly")
    dailyBtn.classList.remove("active");
    monthlyBtn.classList.add("active")
}
function dailyBtnClicked(){
    showDailyBtnActive()
    const div=document.getElementById("calender");
    div.innerHTML=`
  <div class="row">
    <div>
      <h2>Select a Date</h2>
      <input type="date" onchange="getDailyExpense()" id="datepicker" class="form-control mb-2">
    </div>
  </div>
`
}

function monthlyBtnClicked(){
    showMonthlyBtnActive();
    const div=document.getElementById("calender");
    div.innerHTML=`
  <div class="row">
    <div class="">
      <h2>Select a Month</h2>
      <input type="month" onchange="getMonthlyExpense()" id="monthPicker" class="form-control mb-2">
    </div>
  </div>
`
}
async function getDailyExpense(){
    const id=localStorage.getItem("userId")
    await axios.post("http://localhost:3000/premium/dailyReport",{
        id:id,
        date:document.getElementById("datepicker").value
    }).then((res)=>{
        renderTable(res.data)
    })
}

async function getMonthlyExpense(){
    const id=localStorage.getItem("userId")
    let month=document.getElementById("monthPicker").value.split("-")[1];
    console.log(month);
    const data={
        id:id,
        month:month
    }
    await axios.post("http://localhost:3000/premium/monthlyReport",data).then((res)=>{
        renderTable(res.data)
    })
}

// Function to render the table based on the selected filter
function renderTable(data) {
    const filteredData = data
    const tableBody = document.getElementById('expenseTableBody');
    tableBody.innerHTML = '';

    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${item.createdAt}</td>
                <td>${item.description}</td>
                <td>${item.category}</td>
                <td>${item.expense}</td>
            `;
        tableBody.appendChild(row);
    });
}

// Function to filter data based on the selected filter
function filterData(filter) {
    const currentDate = new Date();
    switch (filter) {
        case 'daily':
            return data.filter(item => new Date(item.date).toDateString() === currentDate.toDateString());
        case 'weekly':
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            return data.filter(item => new Date(item.date) >= startOfWeek);
        case 'monthly':
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            return data.filter(item => new Date(item.date) >= startOfMonth);
        default:
            return data;
    }
}

// Event listener for filter buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        renderTable(filter);
    });
});

// Function to download data as CSV
// function downloadData() {
//     const filteredData = filterData('all');
//     const csvContent = "data:text/csv;charset=utf-8,"
//         + "Date,Description,Category,Type,Amount\n"
//         + filteredData.map(item => `${item.date},${item.description},${item.category},${item.type},${item.amount}`).join("\n");
//
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "expense_income_data.csv");
//     document.body.appendChild(link);
//     link.click();
// }

async function downloadExpense() {
    const data=await axios.get("http://localhost:3000/premium/download",{
        headers:{"authorization":localStorage.getItem("userId")}
    })
   window.location=data.data.url;
    const downloadData=await axios.get("http://localhost:3000/premium/prevDownload",{
        headers:{"authorization":localStorage.getItem("userId")}})
    const mainBody=document.getElementById("mainBody");
    mainBody.innerHTML=`
        <div class="container mt-5">
    <h2 class="mb-4 text-primary">Previous Downloads</h2>

    <table class="table table-bordered table-hover">
        <thead class="table-primary">
        <tr>
            <th scope="col">Filename</th>
            <th scope="col">Download</th>
        </tr>
        </thead>
        <tbody id="download-table-body">
            
            <!-- Add more rows as needed -->
        </tbody>
    </table>
</div>
    `
    const tbody=document.getElementById("download-table-body");
    for (const file of downloadData.data) {
        const tr=document.createElement("tr");
        tr.innerHTML=`
            <td>${file.name}</td>
            <td>
                <a href=${file.url} class="btn btn-success">
                    <i class="fas fa-download"></i> Download
                </a>
            </td>
        `
        tbody.appendChild(tr);
    }
}