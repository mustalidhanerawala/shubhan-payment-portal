export function employeeDashboard() {

    return `

<div class="cards">

<div class="card">

<h3>Pending Finance</h3>

<h1 id="pendingCount">0</h1>

</div>

<div class="card">

<h3>Pending Payment</h3>

<h1 id="approvedCount">0</h1>

</div>

<div class="card">

<h3>Completed</h3>

<h1 id="completedCount">0</h1>

</div>

</div>

<div class="action-bar">

<button id="newRequestBtn">

+ New Payment Request

</button>

</div>

<div class="table-card">

<h2>My Requests</h2>

<br>

<table>

<thead>

<tr>

<th>Date</th>

<th>Pay To</th>

<th>Amount</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody id="requestTable">

<tr>

<td colspan="5">

No Requests Found

</td>

</tr>

</tbody>

</table>

</div>

`;

}

export function financeDashboard() {

    return employeeDashboard() + `

<br><br>

<div class="table-card">

<h2>Pending Finance Approvals</h2>

<br>

<table>

<thead>

<tr>

<th>Requested By</th>

<th>Pay To</th>

<th>Amount</th>

<th>Document</th>

<th>Approve</th>

<th>Decline</th>

</tr>

</thead>

<tbody id="financeTable">

<tr>

<td colspan="6">

No Pending Requests

</td>

</tr>

</tbody>

</table>

</div>

`;

}

export function approverDashboard() {

    return `

<div class="table-card">

<h2>Awaiting Payment</h2>

<br>

<table>

<thead>

<tr>

<th>Requested By</th>

<th>Pay To</th>

<th>Amount</th>

<th>Document</th>

<th>Complete</th>

</tr>

</thead>

<tbody id="approverTable">

<tr>

<td colspan="5">

No Approved Requests

</td>

</tr>

</tbody>

</table>

</div>

`;

}