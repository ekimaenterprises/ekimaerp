const KEY="ekima_full_system_v2";
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{
sales:[],leads:[],service:[],parts:[],bluebook:[],outstanding:[],marketing:[],audit:[],training:[],po:[],warranty:[],purchases:[],inventory:[],transactions:[],accounts:[],journals:[],reminders:[],settings:{smsEnabled:false,emailEnabled:false,whatsappEnabled:true,aiEnabled:true},users:[
{id:1,name:"Administrator",username:"admin",role:"Admin",password:"1234"}
]};
let current=null, page="dashboard";
const modules={
dashboard:["🏠","Dashboard"],sales:["💰","Sales"],leads:["📞","Enquiry / Leads"],service:["🔧","Service"],parts:["📦","Parts Stock"],bluebook:["🚗","Bluebook Renewal"],outstanding:["💵","Outstanding"],marketing:["📣","Marketing"],audit:["🔍","Audit"],training:["🎓","Training"],po:["🛒","Purchase Order"],warranty:["🛡","Warranty"],purchases:["🧾","Purchases"],inventory:["📋","Inventory Transactions"],transactions:["💳","All Transactions"],accounting:["📊","Advanced Accounting"],reminders:["🔔","Reminders & Messages"],ai:["🤖","AI Control Center"],settings:["⚙️","System Settings"],users:["👥","Users / Staff"]
};
const schemas={
sales:{title:"Sales",fields:[["date","Date","date"],["person","Name of Costumer","text"],["mobil","Contact Number","number"], ["place","Adress","text"],["model","Model","text"],["booking","Booking","number"],["delivery","Delivery","number"],["amount","Sales Amount","number"],["discount","Discount","number"],["cogs","COGS","number"],["collection","Collection","number"],["payment","Payment Method (Cash/Bank/QR)","text"]]},
leads:{title:"Enquiry / Leads",fields:[["date","Date","date"],["customer","Customer","text"],["phone","Phone","text"],["source","Source","text"],["product","Product","text"],["person","Salesperson","text"],["stage","Stage","text"],["next","Next Follow-up","date"]]},
service:{title:"Service",fields:[["date","Date","date"],["job","Job Card","text"],["customer","Customer","text"],["phone","Phone","text"],["vehicle","Vehicle","text"],["service","Service Type","text"],["next","Next Service","date"],["status","Status","text"]]},
parts:{title:"Parts Stock",fields:[["partno","Part No","text"],["name","Part Name","text"],["opening","Opening","number"],["purchase","Purchase","number"],["issue","Issue/Sale","number"],["reorder","Reorder Level","number"]]},
bluebook:{title:"Bluebook Renewal",fields:[["customer","Customer","text"],["phone","Phone","text"],["vehicle","Vehicle No","text"],["expiry","Expiry Date","date"],["follow","Follow-up","text"]]},
outstanding:{title:"Outstanding",fields:[["customer","Customer","text"],["phone","Phone","text"],["invoice","Invoice","text"],["total","Total","number"],["paid","Paid","number"],["due","Due Date","date"],["follow","Follow-up","text"]]},
marketing:{title:"Marketing",fields:[["date","Date","date"],["activity","Activity","text"],["platform","Platform","text"],["cost","Cost","number"],["leads","Leads","number"],["bookings","Bookings","number"],["sales","Sales","number"]]},
audit:{title:"Audit",fields:[["date","Date","date"],["area","Area","text"],["point","Audit Point","text"],["finding","Finding","text"],["responsible","Responsible","text"],["deadline","Deadline","date"],["status","Status","text"]]},
training:{title:"Training",fields:[["date","Date","date"],["staff","Staff","text"],["topic","Topic","text"],["target","Target","text"],["completed","Completed","text"],["score","Score","number"]]},
po:{title:"Purchase Order",fields:[["pono","PO No","text"],["date","Date","date"],["supplier","Supplier","text"],["item","Item","text"],["qty","Qty","number"],["amount","Amount","number"],["expected","Expected Date","date"],["status","Status","text"]]},
warranty:{title:"Warranty",fields:[["claim","Claim No","text"],["date","Date","date"],["customer","Customer","text"],["phone","Phone","text"],["vehicle","Vehicle","text"],["part","Part","text"],["problem","Problem","text"],["claimstatus","Claim Status","text"],["companystatus","Company Status","text"]]}
,
purchases:{title:"Purchase Entry",fields:[["date","Date","date"],["supplier","Supplier","text"],["bill","Bill No","text"],["item","Item / Part","text"],["qty","Qty","number"],["rate","Rate","number"],["discount","Discount","number"],["vat","VAT %","number"],["payment","Payment Method","text"]]},
inventory:{title:"Inventory Transaction",fields:[["date","Date","date"],["item","Item / Part","text"],["type","Type (Purchase/Sale/Issue/Return)","text"],["ref","Reference","text"],["qty","Qty","number"],["rate","Rate","number"],["discount","Discount","number"],["payment","Payment Method","text"]]},
transactions:{title:"All Transaction",fields:[["date","Date","date"],["type","Transaction Type","text"],["ref","Reference","text"],["party","Customer/Supplier","text"],["debit","Debit","number"],["credit","Credit","number"],["discount","Discount","number"],["payment","Payment Method","text"],["note","Narration","text"]]},
accounts:{title:"Chart of Accounts",fields:[["code","Code","text"],["name","Account Name","text"],["type","Type (Asset/Liability/Equity/Income/Expense)","text"],["opening","Opening Balance","number"]]},
journals:{title:"Journal Entry",fields:[["date","Date","date"],["ref","Reference","text"],["account","Account","text"],["debit","Debit","number"],["credit","Credit","number"],["narration","Narration","text"]]}};
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function login(){let u=document.getElementById("user").value,p=document.getElementById("pass").value,r=document.getElementById("role").value;if(u==="admin"&&p==="1234"){current={name:"Administrator",role:r};document.getElementById("login").classList.add("hidden");document.getElementById("app").classList.remove("hidden");document.getElementById("who").textContent=current.name+" ("+current.role+")";buildNav();render()}else alert("Demo login: admin / 1234")}
function logout(){location.reload()}
function buildNav(){document.getElementById("nav").innerHTML=Object.entries(modules).map(([k,v])=>`<button class="navbtn ${page===k?"active":""}" onclick="go('${k}')">${v[0]} ${v[1]}</button>`).join("")}
function go(p){page=p;document.querySelector(".sidebar").classList.remove("open");buildNav();render()}
function money(n){return "Rs. "+Number(n||0).toLocaleString("en-IN")}
function today(){return new Date().toISOString().slice(0,10)}
function days(date){return date?Math.ceil((new Date(date)-new Date())/86400000):99999}
function status(s){s=(s||"").toLowerCase();return s.includes("pending")||s.includes("due")?"yellow":s.includes("expired")||s.includes("low")?"red":"green"}
function add(type,obj){obj.id=Date.now();data[type].push(obj);save();render()}
function form(type,record=null){
let s=schemas[type];
let editId=record?.id||"";
return `<div class="formgrid" id="form" data-edit-id="${editId}">${s.fields.map(([k,l,t])=>k==="payment"?`<select id="f_${k}" title="${l}"><option value="">Payment Method</option>${["Cash","Bank","QR"].map(v=>`<option ${record?.[k]===v?"selected":""}>${v}</option>`).join("")}</select>`:`<input id="f_${k}" type="${t}" placeholder="${l}" value="${esc(record?.[k]??"")}">`).join("")}</div>
<button class="btn" onclick="submitForm('${type}')">${editId?"Update Record":"Save Record"}</button>${editId?` <button class="btn secondary" onclick="render()">Cancel</button>`:""}`;} 
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function submitForm(type){
let obj={};schemas[type].fields.forEach(([k])=>obj[k]=document.getElementById("f_"+k)?.value||"");
let editId=Number(document.getElementById("form")?.dataset.editId||0);
if(editId){let i=data[type].findIndex(x=>x.id===editId);if(i>=0){obj.id=editId;data[type][i]=obj;save();render();return;}}
obj.id=Date.now();data[type].push(obj);postTransaction(type,obj);save();render()
}
function postTransaction(type,o){
let amount=0;
if(type==="sales"){amount=Math.max(0,(+o.amount||0)-(+o.discount||0)); data.transactions.push({id:Date.now()+1,date:o.date||today(),type:"Sales",ref:"SALE-"+o.id,party:o.person||"",debit:amount,credit:0,discount:+o.discount||0,payment:o.payment||"Cash",note:"Sales entry"});
addJournal(o.date||today(),"SALE-"+o.id,"Sales / Customer",amount,0,"Sales invoice");}
if(type==="purchases"){amount=Math.max(0,(+o.qty||0)*(+o.rate||0)-(+o.discount||0)); data.transactions.push({id:Date.now()+2,date:o.date||today(),type:"Purchase",ref:o.bill||("PUR-"+o.id),party:o.supplier||"",debit:0,credit:amount,discount:+o.discount||0,payment:o.payment||"Cash",note:"Purchase entry"});addJournal(o.date||today(),o.bill||("PUR-"+o.id),"Inventory / Supplier",amount,0,"Purchase entry");}
if(type==="inventory"){let total=Math.max(0,(+o.qty||0)*(+o.rate||0)-(+o.discount||0));data.transactions.push({id:Date.now()+3,date:o.date||today(),type:o.type||"Inventory",ref:o.ref||("INV-"+o.id),party:"",debit:total,credit:0,discount:+o.discount||0,payment:o.payment||"Cash",note:o.item||"Inventory transaction"});}
}
function addJournal(date,ref,account,debit,credit,narration){data.journals.push({id:Date.now()+Math.floor(Math.random()*1000),date,ref,account,debit,credit,narration});}
function editRecord(type,id){
let record=(data[type]||[]).find(x=>x.id===id);
if(!record)return;
let s=schemas[type];
document.getElementById("content").innerHTML=`<div class="wrap"><div class="head"><div><h1>Edit ${s.title}</h1><div class="page-note">Edit the saved record and click Update Record.</div></div></div><div class="panel">${form(type,record)}</div></div>`;
window.scrollTo({top:0,behavior:"smooth"});
}
function table(type){let s=schemas[type],rows=data[type]||[];let heads=s.fields.map(x=>x[1]);let out=`<div class="tablewrap"><table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join("")}<th>Action</th></tr></thead><tbody>`;rows.forEach(r=>{out+="<tr>";s.fields.forEach(([k])=>{let v=r[k]||"";if(type==="parts"&&k==="reorder"){out+=`<td>${v}</td>`}else out+=`<td>${v}</td>`});if(type==="bluebook"){let d=days(r.expiry);out+=`<td class="${status(d<0?"expired":d<=30?"pending":"normal")}">${d<0?"Expired":d+" days"}</td>`}else if(type==="parts"){let c=(+r.opening||0)+(+r.purchase||0)-(+r.issue||0);out+=`<td class="${status(c<=(+r.reorder||0)?"low":"normal")}">Closing ${c} ${c<=(+r.reorder||0)?"• LOW":""}</td>`}else if(type==="outstanding"){let o=(+r.total||0)-(+r.paid||0);out+=`<td>${money(o)} ${o>0?`<a class="btn mini wa" href="https://wa.me/${String(r.phone||"").replace(/\\D/g,"")}?text=${encodeURIComponent("Outstanding follow-up for "+(r.invoice||"invoice"))}" target="_blank">WhatsApp</a>`:"Paid"}</td>`}else out+=`<td>${r.status||r.claimstatus||r.companystatus||""}</td>`;out+=`<td><button class="btn mini" onclick="editRecord('${type}',${r.id})">Edit</button> <button class="btn mini danger" onclick="del('${type}',${r.id})">Delete</button></td></tr>`});return out+"</tbody></table></div>"}
function del(type,id){if(confirm("Delete record?")){data[type]=data[type].filter(x=>x.id!==id);save();render()}}
function render(){let c=document.getElementById("content");
if(page==="dashboard"){document.getElementById("title").textContent="Management Dashboard";c.innerHTML=dashboard();draw();return}
if(page==="users"){document.getElementById("title").textContent="Users / Staff";c.innerHTML=usersPage();return}
if(page==="accounting"){document.getElementById("title").textContent="Advanced Accounting";c.innerHTML=accountingPage();return}
if(page==="reminders"){document.getElementById("title").textContent="Reminders & Messages";c.innerHTML=remindersPage();return}
if(page==="ai"){document.getElementById("title").textContent="AI Control Center";c.innerHTML=aiPage();return}
if(page==="settings"){document.getElementById("title").textContent="System Settings";c.innerHTML=settingsPage();return}
let s=schemas[page];document.getElementById("title").textContent=s.title;
let tools=(page==="sales"||page==="purchases"||page==="inventory"||page==="transactions")?`<button class="btn" onclick="exportModule('${page}')">Export Excel</button> <button class="btn" onclick="printLatestVoucher('${page}')">Print Voucher PDF</button>`:"";
c.innerHTML=`<div class="wrap"><div class="head"><div><h1>${s.title}</h1><div class="page-note">Enter daily data. Dashboard and accounting update automatically.</div></div><div>${tools}</div></div><div class="panel">${form(page)}</div><div class="panel"><div class="toolbar"><input class="search" placeholder="Search records..." oninput="filterTable(this.value)"></div><div id="tbl">${table(page)}</div></div></div>`}


function accountingPage(){
let dr=data.journals.reduce((a,r)=>a+(+r.debit||0),0),cr=data.journals.reduce((a,r)=>a+(+r.credit||0),0);
let cash=data.transactions.filter(r=>String(r.payment).toLowerCase()==="cash").reduce((a,r)=>a+(+r.debit||0)-(+r.credit||0),0);
let bank=data.transactions.filter(r=>["bank","qr"].includes(String(r.payment).toLowerCase())).reduce((a,r)=>a+(+r.debit||0)-(+r.credit||0),0);
let income=data.sales.reduce((a,r)=>a+Math.max(0,(+r.amount||0)-(+r.discount||0)),0), cogs=data.sales.reduce((a,r)=>a+(+r.cogs||0),0), expense=data.purchases.reduce((a,r)=>a+Math.max(0,(+r.qty||0)*(+r.rate||0)-(+r.discount||0)),0);
return `<div class="wrap"><div class="head"><div><h1>Advanced Accounting Package</h1><div class="page-note">Double-entry-ready management accounting with Cash, Bank and QR tracking.</div></div><div><button class="btn" onclick="exportModule('transactions')">Excel Transactions</button> <button class="btn" onclick="printVoucher('ACCOUNTING','Accounting Summary')">PDF Summary</button></div></div>
<div class="cards"><div class="card"><label>Total Debit</label><strong>${money(dr)}</strong></div><div class="card"><label>Total Credit</label><strong>${money(cr)}</strong></div><div class="card"><label>Cash Balance</label><strong>${money(cash)}</strong></div><div class="card"><label>Bank + QR</label><strong>${money(bank)}</strong></div><div class="card"><label>Sales Income</label><strong>${money(income)}</strong></div><div class="card"><label>Purchase / Cost</label><strong>${money(expense)}</strong></div><div class="card"><label>Gross Profit</label><strong>${money(income-cogs)}</strong></div><div class="card"><label>Net Movement</label><strong>${money(dr-cr)}</strong></div></div>
<div class="grid"><div class="panel"><h3>Quick Accounting</h3><button class="btn" onclick="go('accounts')">Chart of Accounts</button> <button class="btn" onclick="go('journals')">Journal</button> <button class="btn" onclick="go('transactions')">Ledger / Transactions</button></div><div class="panel"><h3>Payment Controls</h3><p class="muted">Every sales/purchase/inventory entry supports Cash, Bank and QR. Discount is recorded separately.</p></div></div></div><div class="grid"><div class="panel"><h3>Trial Balance</h3><p>Debit: <b>${money(dr)}</b></p><p>Credit: <b>${money(cr)}</b></p><p>Difference: <b>${money(dr-cr)}</b></p></div><div class="panel"><h3>Profit & Loss</h3><p>Income: ${money(income)}</p><p>COGS: ${money(cogs)}</p><p>Purchase/Cost: ${money(expense)}</p><p><b>Estimated Operating Result: ${money(income-cogs-expense)}</b></p></div></div></div>`}
function remindersPage(){let rows=[];(data.outstanding||[]).forEach(r=>{let due=(+r.total||0)-(+r.paid||0);if(due>0)rows.push({type:"Outstanding",name:r.customer,phone:r.phone,text:"Dear "+(r.customer||"Customer")+", your outstanding amount is "+money(due)+". Please contact EKIMA Enterprises."})});(data.bluebook||[]).forEach(r=>{if(days(r.expiry)<=30)rows.push({type:"Bluebook",name:r.customer,phone:r.phone,text:"Dear "+(r.customer||"Customer")+", your Bluebook renewal is due on "+r.expiry+". Please contact EKIMA Enterprises."})});(data.leads||[]).filter(r=>r.next&&days(r.next)<=1).forEach(r=>rows.push({type:"Lead Follow-up",name:r.customer,phone:r.phone,text:"Namaste "+(r.customer||"Customer")+", this is a follow-up from EKIMA Enterprises regarding your enquiry."}));return `<div class="wrap"><div class="head"><div><h1>Reminders & Auto Messages</h1><div class="page-note">Prepare personalized SMS, Email and WhatsApp messages from your live records.</div></div><button class="btn" onclick="sendAllWhatsApp()">Open All WhatsApp</button></div><div class="panel"><table><thead><tr><th>Type</th><th>Customer</th><th>Message</th><th>Action</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${r.type}</td><td>${r.name||""}</td><td>${r.text}</td><td><a class="btn mini wa" target="_blank" href="https://wa.me/${String(r.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(r.text)}">WhatsApp</a> <button class="btn mini" onclick="copyMsg(${i})">Copy</button></td></tr>`).join("")||'<tr><td colspan="4">No reminders currently due.</td></tr>'}</tbody></table></div></div>`}
function sendAllWhatsApp(){let links=[...document.querySelectorAll('.wa')];links.forEach((a,i)=>setTimeout(()=>window.open(a.href,'_blank'),i*500))}
function aiPage(){let tips=[];let out=data.outstanding.reduce((a,r)=>a+Math.max(0,(+r.total||0)-(+r.paid||0)),0),low=data.parts.filter(r=>(+r.opening||0)+(+r.purchase||0)-(+r.issue||0)<=(+r.reorder||0)).length; if(out)tips.push("Prioritize outstanding collection: "+money(out));if(low)tips.push("Create purchase requests for "+low+" low-stock parts.");if(data.leads.length>data.sales.length*3)tips.push("Lead-to-sale conversion may need stronger follow-up.");if(!tips.length)tips.push("No critical rule-based alerts. Keep entering daily transactions for better control.");return `<div class="wrap"><div class="head"><div><h1>AI Control Center</h1><div class="page-note">AI-style decision support using your dashboard data. External AI/API can be connected later for true generative automation.</div></div></div><div class="panel"><h3>Recommended Actions</h3>${tips.map(x=>`<div class="alert yellow">🤖 ${x}</div>`).join("")}</div><div class="grid"><div class="panel"><h3>Automation Engine</h3><p>✓ Transaction monitoring<br>✓ Low-stock detection<br>✓ Outstanding reminders<br>✓ Bluebook/service follow-up<br>✓ Discount tracking<br>✓ Cash/Bank/QR classification</p></div><div class="panel"><h3>External AI & Messaging</h3><p class="muted">To make SMS, email, WhatsApp and AI fully automatic, connect approved provider APIs from System Settings. This browser package currently generates messages and opens WhatsApp safely without storing credentials.</p></div></div></div>`}
function settingsPage(){return `<div class="wrap"><div class="head"><div><h1>System Settings</h1><div class="page-note">Configure automation providers later without changing accounting data.</div></div></div><div class="panel"><h3>Automation</h3><label><input type="checkbox" ${data.settings.whatsappEnabled?'checked':''} onchange="toggleSetting('whatsappEnabled',this.checked)"> WhatsApp enabled</label><br><label><input type="checkbox" ${data.settings.smsEnabled?'checked':''} onchange="toggleSetting('smsEnabled',this.checked)"> SMS enabled</label><br><label><input type="checkbox" ${data.settings.emailEnabled?'checked':''} onchange="toggleSetting('emailEnabled',this.checked)"> Email enabled</label><br><label><input type="checkbox" ${data.settings.aiEnabled?'checked':''} onchange="toggleSetting('aiEnabled',this.checked)"> AI control enabled</label></div><div class="panel"><h3>Provider Integration</h3><p class="muted">API credentials are intentionally not embedded in this offline dashboard. For production, connect an SMS provider, email service, WhatsApp Business provider and secure AI API through a backend.</p></div></div>`}
function toggleSetting(k,v){data.settings[k]=v;save()}
function exportModule(type){let rows=data[type]||[];if(!window.XLSX){alert('Excel library not loaded.');return}let ws=XLSX.utils.json_to_sheet(rows.length?rows:[{}]);let wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,schemas[type]?.title||type);XLSX.writeFile(wb,'EKIMA_'+type+'_export.xlsx')}
function printLatestVoucher(type){let rows=data[type]||[];if(!rows.length){alert('No record available.');return}printVoucher(type,JSON.stringify(rows[rows.length-1],null,2))}
function printVoucher(title,body){if(!window.jspdf){alert('PDF library not loaded.');return}let {jsPDF}=window.jspdf,doc=new jsPDF();doc.setFontSize(18);doc.text('EKIMA ENTERPRISES PVT. LTD.',20,20);doc.setFontSize(14);doc.text(String(title)+' VOUCHER',20,32);doc.setFontSize(10);let lines=String(body).split('\n');let y=45;lines.forEach(line=>{doc.text(line.slice(0,110),20,y);y+=6;if(y>280){doc.addPage();y=20}});doc.text('Generated: '+new Date().toLocaleString(),20,290);doc.save('EKIMA_'+String(title).replace(/\W+/g,'_')+'_voucher.pdf')}
function copyMsg(i){let wa=[...document.querySelectorAll('.wa')][i];if(wa)navigator.clipboard?.writeText(decodeURIComponent((wa.href.split('text=')[1]||'').replace(/\+/g,' '))).then(()=>alert('Message copied.'))}
function dashboard(){let sales=data.sales.reduce((a,r)=>a+(+r.amount||0),0),cogs=data.sales.reduce((a,r)=>a+(+r.cogs||0),0),col=data.sales.reduce((a,r)=>a+(+r.collection||0),0),out=data.outstanding.reduce((a,r)=>a+Math.max(0,(+r.total||0)-(+r.paid||0)),0),blue=data.bluebook.filter(r=>days(r.expiry)<=30).length,low=data.parts.filter(r=>(+r.opening||0)+(+r.purchase||0)-(+r.issue||0)<=(+r.reorder||0)).length,pendingService=data.service.filter(r=>(r.status||"").toLowerCase()!=="complete").length,audit=data.audit.filter(r=>(r.status||"pending").toLowerCase()==="pending").length,po=data.po.filter(r=>(r.status||"pending").toLowerCase()==="pending").length,warranty=data.warranty.filter(r=>(r.claimstatus||"pending").toLowerCase()==="pending"||(r.companystatus||"pending").toLowerCase()==="pending").length;
return `<div class="wrap"><div class="head"><div><h1>Business Management Dashboard</h1><div class="muted">Real-time browser dashboard • ${today()}</div></div><button class="btn" onclick="exportData()">Export Backup</button></div>
<div class="cards">${[
["Sales",money(sales)], ["Purchases",money(data.purchases.reduce((a,r)=>a+Math.max(0,(+r.qty||0)*(+r.rate||0)-(+r.discount||0)),0))],["Gross Profit",money(sales-cogs)],["Collection",money(col)],["Outstanding",money(out)],["Leads",data.leads.length],["Booking",data.sales.reduce((a,r)=>a+(+r.booking||0),0)],["Delivery",data.sales.reduce((a,r)=>a+(+r.delivery||0),0)],["Service Jobs",data.service.length],["Bluebook Due",blue],["Low Stock",low],["Audit Pending",audit],["Warranty Pending",warranty]].map(x=>`<div class="card"><label>${x[0]}</label><strong>${x[1]}</strong></div>`).join("")}</div>
<div class="grid"><div class="panel"><h3>Sales Trend</h3><canvas id="chart"></canvas></div><div class="panel"><h3>Management Alerts</h3>
${out?`<div class="alert red">🔴 Outstanding ${money(out)} — collection follow-up</div>`:""}${blue?`<div class="alert yellow">🟡 ${blue} Bluebook renewal(s) due within 30 days</div>`:""}${low?`<div class="alert red">🔴 ${low} parts below reorder level</div>`:""}${pendingService?`<div class="alert yellow">🟡 ${pendingService} service job(s) not complete</div>`:""}${audit?`<div class="alert yellow">🟡 ${audit} audit finding(s) pending</div>`:""}${po?`<div class="alert yellow">🟡 ${po} PO(s) pending</div>`:""}${warranty?`<div class="alert yellow">🟡 ${warranty} warranty item(s) pending</div>`:""}${!out&&!blue&&!low&&!pendingService&&!audit&&!po&&!warranty?'<div class="alert green">🟢 No major alerts</div>':''}</div></div>
<div class="panel"><h3>Manager Rule</h3><p class="kpi"><b>DATA → KPI → DASHBOARD → ALERT → ACTION → REVIEW</b></p><p class="muted">Manager should start from red alerts, assign a responsible person, set a deadline and review the result.</p></div></div>`}
function usersPage(){return `<div class="wrap"><div class="head"><h1>Users / Staff</h1></div><div class="panel"><p class="page-note">Demo role control is included. Production deployment should use a secure server/database and hashed passwords.</p>${data.users.map(u=>`<p><b>${u.name}</b> — ${u.role} — ${u.username}</p>`).join("")}</div></div>`}
function filterTable(q){let t=document.querySelector("#tbl tbody");if(!t)return;[...t.rows].forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q.toLowerCase())?"":"none")}
function draw(){setTimeout(()=>{let ctx=document.getElementById("chart");if(!ctx)return;let rows=data.sales.slice(-10);new Chart(ctx,{type:"bar",data:{labels:rows.map(r=>r.date||"Sale"),datasets:[{label:"Sales Amount",data:rows.map(r=>+r.amount||0),borderWidth:1}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}})},20)}
function exportData(){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="ekima-backup.json";a.click()}
setInterval(()=>document.getElementById("clock").textContent=new Date().toLocaleString(),1000);

/* EKIMA ERP extension layer
   Additive by design: existing localStorage records and modules remain compatible. */
(function(){
const extraData={
  customers:[],suppliers:[],expenses:[],payments:[],returns:[],items:[],hr:[],crm:[],
  permissions:{
    Admin:{import:true,export:true,edit:true,delete:true,print:true},
    Manager:{import:true,export:true,edit:true,delete:false,print:true},
    Sales:{import:false,export:true,edit:true,delete:false,print:true},
    Service:{import:false,export:true,edit:true,delete:false,print:true},
    Store:{import:true,export:true,edit:true,delete:false,print:true}
  }
};
Object.keys(extraData).forEach(k=>{if(data[k]===undefined)data[k]=extraData[k]});
data.settings=Object.assign({companyName:"EKIMA ENTERPRISES",address:"Kathmandu, Nepal",vat:"",phone:"",email:""},data.settings||{});
data.users=data.users||[];
data.users.forEach(u=>{if(!u.role)u.role="Sales"});
const originalSchemas=schemas;
Object.assign(modules,{
  customers:["👤","Customers"],suppliers:["🏢","Suppliers"],items:["📦","Items"],
  expenses:["💸","Expenses"],payments:["💳","Payments"],returns:["↩","Returns"],
  crm:["🤝","CRM"],hr:["👥","HR / Staff"],imports:["⬆","Import Center"]
});
Object.assign(schemas,{
  customers:{title:"Customers",fields:[["code","Customer Code","text"],["name","Customer Name","text"],["mobile","Mobile Number","tel"],["address","Address","text"],["panvat","PAN / VAT","text"],["opening","Opening Balance","number"],["type","Customer Type","text"]]},
  suppliers:{title:"Suppliers",fields:[["code","Supplier Code","text"],["name","Supplier Name","text"],["mobile","Mobile Number","tel"],["address","Address","text"],["panvat","PAN / VAT","text"],["opening","Opening Balance","number"]]},
  items:{title:"Items",fields:[["code","Item Code","text"],["name","Item Name","text"],["unit","Unit","text"],["opening","Opening Stock","number"],["reorder","Reorder Level","number"],["rate","Rate","number"],["vat","VAT %","number"]]},
  expenses:{title:"Expenses",fields:[["date","Date","date"],["category","Category","text"],["description","Description","text"],["amount","Amount","number"],["vat","VAT %","number"],["payment","Payment Method","text"],["ref","Reference","text"]]},
  payments:{title:"Payments",fields:[["date","Date","date"],["party","Customer / Supplier","text"],["mobile","Mobile Number","tel"],["amount","Amount","number"],["method","Payment Method","text"],["ref","Reference","text"],["note","Note","text"]]},
  returns:{title:"Returns",fields:[["date","Date","date"],["type","Return Type (Sale/Purchase)","text"],["party","Customer / Supplier","text"],["item","Item / Part","text"],["qty","Qty","number"],["rate","Rate","number"],["ref","Reference","text"],["reason","Reason","text"]]},
  crm:{title:"CRM",fields:[["date","Date","date"],["code","Customer Code","text"],["customer","Customer Name","text"],["mobile","Mobile Number","tel"],["source","Source","text"],["stage","Stage","text"],["next","Next Follow-up","date"],["notes","Notes","text"]]},
  hr:{title:"HR / Staff",fields:[["code","Staff Code","text"],["name","Staff Name","text"],["mobile","Mobile Number","tel"],["role","Role","text"],["department","Department","text"],["joining","Joining Date","date"],["status","Status","text"]]}
});
let importState={module:"sales",rows:[],headers:[],errors:[],source:""};
const baseSubmit=submitForm;
function activeRole(){return current?.role||"Admin"}
function can(action){return activeRole()==="Admin" || data.permissions?.[activeRole()]?.[action]!==false}
function guard(action,label){if(can(action))return true;alert("Your role does not have permission to "+label+".");return false}
function notify(message){const n=document.createElement("div");n.className="toast";n.textContent=message;document.body.appendChild(n);setTimeout(()=>n.remove(),2800)}
function keyValue(type,row){
  const keys={customers:["code","mobile","panvat"],suppliers:["code","mobile","panvat"],items:["code","name"],sales:["date","person","model","amount"],purchases:["date","supplier","bill","item"],returns:["date","ref","item","party"],expenses:["date","category","description","amount"],payments:["date","ref","party","amount"],crm:["date","customer","mobile"],hr:["code","name","mobile"]};
  const ks=keys[type]||schemas[type]?.fields.slice(0,3).map(x=>x[0])||[];
  return ks.map(k=>String(row[k]??"").trim().toLowerCase()).filter(Boolean).join("|");
}
function isDuplicate(type,row,ignoreId){
  const key=keyValue(type,row); if(!key)return false;
  return (data[type]||[]).some(r=>r.id!==ignoreId && keyValue(type,r)===key);
}
function contactActions(phone){
  const p=String(phone||"").replace(/\D/g,""); if(!p)return "";
  return `<span class="contact-actions"><a class="contact call" href="tel:${p}" title="Call">Call</a><a class="contact sms" href="sms:${p}" title="SMS">SMS</a><a class="contact wa" target="_blank" href="https://wa.me/${p}" title="WhatsApp">WhatsApp</a></span>`;
}
function partyList(type){
  const list=data[type]||[];
  return `<option value="">Select ${type==="customers"?"customer":"supplier"}…</option>`+
    list.map(r=>`<option value="${esc(r.name||"")}" data-id="${r.id}" data-mobile="${esc(r.mobile||r.phone||"")}" data-address="${esc(r.address||"")}" data-panvat="${esc(r.panvat||"")}" data-balance="${esc(r.opening||"")}">${esc(r.name||r.code||"")}</option>`).join("");
}
function partyPreview(id){
  const el=document.getElementById(id),o=el?.selectedOptions?.[0], box=document.getElementById(id+"_info");
  if(!box)return;
  if(!o||!o.value){box.innerHTML="<span class='muted'>Select a saved party to see contact, tax, balance and history.</span>";return}
  const name=o.value,mobile=o.dataset.mobile||"", history=[...(data.sales||[]),...(data.purchases||[]),...(data.payments||[])].filter(r=>[r.person,r.customer,r.supplier,r.party].includes(name)).length;
  box.innerHTML=`<b>${esc(name)}</b><span>Mobile: ${esc(mobile||"—")} ${contactActions(mobile)}</span><span>Address: ${esc(o.dataset.address||"—")}</span><span>PAN/VAT: ${esc(o.dataset.panvat||"—")}</span><span>Opening balance: ${money(o.dataset.balance||0)} · ${history} transaction(s)</span>`;
  const mobileInput=document.getElementById(id==="f_person"?"f_mobil":"f_mobile"); if(mobileInput&&mobile)mobileInput.value=mobile;
}
window.showPartyInfo=partyPreview;
function enhancedForm(type,record){
  const s=schemas[type], editId=record?.id||"";
  const party=type==="sales"?"person":type==="purchases"?"supplier":null;
  return `<div class="formgrid" id="form" data-edit-id="${editId}">${
    s.fields.map(([k,l,t])=>{
      if(party===k){
        const pt=type==="sales"?"customers":"suppliers";
        const savedParty=record?.[k]||"";
        const partyOptions=partyList(pt)+(savedParty&&!data[pt].some(x=>String(x.name||"")===String(savedParty))?`<option value="${esc(savedParty)}" selected>${esc(savedParty)} (legacy record)</option>`:"");
        return `<div class="field-wide"><select id="f_${k}" title="${l}" onchange="showPartyInfo('f_${k}')">${partyOptions.replace(`value="${esc(savedParty)}"`,`value="${esc(savedParty)}" selected`)}</select><div id="f_${k}_info" class="party-info"></div></div>`;
      }
      if(["payment","method"].includes(k))return `<select id="f_${k}" title="${l}"><option value="">Payment Method</option>${["Cash","Bank","QR","Credit"].map(v=>`<option ${record?.[k]===v?"selected":""}>${v}</option>`).join("")}</select>`;
      return `<input id="f_${k}" type="${t}" placeholder="${l}" aria-label="${l}" value="${esc(record?.[k]??"")}">`;
    }).join("")
  }</div><div class="form-actions"><button class="btn" onclick="submitForm('${type}')">${editId?"Update Record":"Save Record"}</button>${editId?` <button class="btn secondary" onclick="render()">Cancel</button>`:""} <button class="btn outline" onclick="printCurrentEntry('${type}')">Print Entry</button></div>`;
}
function saveRecord(type,obj,notifyUser=true){
  if(!guard("edit","edit records"))return false;
  if(isDuplicate(type,obj,obj.id)){alert("Duplicate entry prevented. Match found for this record.");return false}
  obj.id=obj.id||Date.now()+Math.floor(Math.random()*1000);
  if(!data[type])data[type]=[]; data[type].push(obj); afterRecordSaved(type,obj); save(); if(notifyUser)notify("Record saved"); render(); return true;
}
function submitEnhanced(type){
  const obj={}; (schemas[type]?.fields||[]).forEach(([k])=>obj[k]=document.getElementById("f_"+k)?.value||"");
  const editId=Number(document.getElementById("form")?.dataset.editId||0);
  if(editId){
    if(!guard("edit","edit records"))return;
    if(isDuplicate(type,obj,editId)){alert("Duplicate entry prevented.");return}
    const i=(data[type]||[]).findIndex(x=>x.id===editId); if(i>=0){obj.id=editId;data[type][i]=obj;afterRecordSaved(type,obj);save();notify("Record updated");render()} return;
  }
  saveRecord(type,obj);
}
window.submitForm=submitEnhanced;
function afterRecordSaved(type,o){
  if(["purchases","inventory","returns"].includes(type))updateStock(type,o);
  if(type==="sales"&&o.person&&!data.customers.some(c=>String(c.name).toLowerCase()===String(o.person).toLowerCase())&&o.mobil){
    data.customers.push({id:Date.now()+9,code:"AUTO-"+Date.now().toString().slice(-5),name:o.person,mobile:o.mobil,address:o.place||"",panvat:"",opening:0,type:"Auto-created"});
  }
}
function updateStock(type,o){
  const name=o.item||o.model; if(!name)return;
  let item=data.items.find(x=>String(x.name).toLowerCase()===String(name).toLowerCase()||String(x.code).toLowerCase()===String(name).toLowerCase());
  if(!item){item={id:Date.now()+8,code:"AUTO-"+Date.now().toString().slice(-5),name,unit:"pcs",opening:0,reorder:0,rate:o.rate||0,vat:o.vat||0};data.items.push(item)}
  let delta=0;
  if(type==="purchases"||(type==="inventory"&&/purchase|return/i.test(o.type||"")))delta=+o.qty||0;
  if(type==="returns")delta=/purchase/i.test(o.type||"")?(+o.qty||0):-(+o.qty||0);
  if(type==="inventory"&&/sale|issue/i.test(o.type||""))delta=-(+o.qty||0);
  item.stock=(+item.stock||+item.opening||0)+delta;
  const part=data.parts.find(x=>String(x.name||"").toLowerCase()===String(name).toLowerCase()||String(x.partno||"").toLowerCase()===String(name).toLowerCase());
  if(part){
    if(delta>0)part.purchase=(+part.purchase||0)+delta;
    if(delta<0)part.issue=(+part.issue||0)+Math.abs(delta);
  }
}
function actionButtons(type){
  return `<div class="export-actions">${can("export")?`<button class="btn mini" onclick="exportModule('${type}')">Export Excel</button><button class="btn mini" onclick="exportDocument('${type}','pdf')">Export PDF</button><button class="btn mini" onclick="exportDocument('${type}','word')">Export Word</button>`:""}${can("print")?`<button class="btn mini outline" onclick="exportDocument('${type}','print')">Print</button>`:""}</div>`;
}
function rowPhone(r){
  return r.mobile||r.mobil||r.phone||((r.customer&&data.customers.find(c=>c.name===r.customer)?.mobile)||"");
}
function enhancedTable(type){
  const s=schemas[type],rows=data[type]||[];
  if(!s)return "";
  let out=`<div class="tablewrap"><table><thead><tr>${s.fields.map(x=>`<th>${x[1]}</th>`).join("")}<th>Contact</th><th>Status / Balance</th><th>Actions</th></tr></thead><tbody>`;
  rows.forEach(r=>{
    out+="<tr>";
    s.fields.forEach(([k])=>out+=`<td>${esc(r[k]??"")}</td>`);
    out+=`<td>${contactActions(rowPhone(r))}</td>`;
    let statusCell="";
    if(type==="customers"||type==="suppliers")statusCell=money(r.opening||0);
    else if(type==="items")statusCell=`Stock ${(+r.stock||+r.opening||0)}${(+r.stock||+r.opening||0)<=(+r.reorder||0)?" · LOW":""}`;
    else if(type==="outstanding"){const due=(+r.total||0)-(+r.paid||0);statusCell=money(due)+(due>0?` ${contactActions(r.phone)}`:" Paid")}
    else statusCell=esc(r.status||r.stage||r.claimstatus||r.companystatus||"");
    out+=`<td>${statusCell}</td><td>${can("edit")?`<button class="btn mini" onclick="editRecord('${type}',${r.id})">Edit</button>`:""} ${can("delete")?`<button class="btn mini danger" onclick="del('${type}',${r.id})">Delete</button>`:""}</td></tr>`;
  });
  return out+"</tbody></table></div>";
}
window.table=enhancedTable;
function enhancedEdit(type,id){
  const record=(data[type]||[]).find(x=>x.id===id); if(!record)return;
  if(!guard("edit","edit records"))return;
  document.getElementById("content").innerHTML=`<div class="wrap"><div class="head"><div><h1>Edit ${schemas[type].title}</h1><div class="page-note">Update the saved record and keep the duplicate check enabled.</div></div>${actionButtons(type)}</div><div class="panel">${enhancedForm(type,record)}</div></div>`;
  if(type==="sales")partyPreview("f_person"); if(type==="purchases")partyPreview("f_supplier");
}
window.editRecord=enhancedEdit;
window.del=function(type,id){if(!guard("delete","delete records"))return;if(confirm("Delete record? This cannot be undone.")){data[type]=(data[type]||[]).filter(x=>x.id!==id);save();render();notify("Record deleted")}};
function renderEnhanced(){
  const c=document.getElementById("content");
  if(page==="imports"){document.getElementById("title").textContent="Import Center";c.innerHTML=importPage();return}
  if(page==="dashboard"){document.getElementById("title").textContent="Management Dashboard";c.innerHTML=dashboard().replace('<button class="btn" onclick="exportData()">Export Backup</button>','<div class="export-actions"><button class="btn" onclick="exportData()">Export Backup</button>'+actionButtons("sales")+'</div>');draw();return}
  if(page==="users"){document.getElementById("title").textContent="Users / Staff";c.innerHTML=usersPageEnhanced();return}
  if(page==="settings"){document.getElementById("title").textContent="System Settings";c.innerHTML=settingsPageEnhanced();return}
  if(page==="accounting"||page==="reminders"||page==="ai"){document.getElementById("title").textContent=modules[page]?.[1]||page;c.innerHTML=(page==="accounting"?accountingPage():page==="reminders"?remindersPage():aiPage()).replace(/<div class="head">/,'<div class="head"><div class="report-actions">'+actionButtons("transactions")+'</div>');return}
  const s=schemas[page]; if(!s){c.innerHTML="<div class='wrap'><div class='panel'>Module unavailable.</div></div>";return}
  document.getElementById("title").textContent=s.title;
  c.innerHTML=`<div class="wrap"><div class="head"><div><h1>${s.title}</h1><div class="page-note">Search by name, mobile, code, PAN/VAT or any saved field.</div></div><div>${actionButtons(page)}</div></div><div class="panel">${can("edit")?enhancedForm(page):"<p class='muted'>Your role can view and export this module but cannot add or edit records.</p>"}</div><div class="panel"><div class="toolbar"><input class="search" placeholder="Search Name, Mobile, Code or PAN/VAT…" oninput="filterTable(this.value)"><span class="muted">${(data[page]||[]).length} record(s)</span></div><div id="tbl">${enhancedTable(page)}</div></div></div>`;
  if(page==="sales")partyPreview("f_person"); if(page==="purchases")partyPreview("f_supplier");
}
window.render=renderEnhanced;
function exportRows(type){return data[type]||[]}
function exportModuleEnhanced(type){
  if(!guard("export","export data"))return;
  const rows=exportRows(type),fields=schemas[type]?.fields||[];
  if(window.XLSX){const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,schemas[type]?.title||type);XLSX.writeFile(wb,`ekima-${type}.xlsx`)}
  else notify("Excel library is not available. Check your internet connection.");
}
window.exportModule=exportModuleEnhanced;
function reportHtml(type){
  const rows=exportRows(type),s=schemas[type]||{title:type,fields:[]};
  const headers=s.fields.map(x=>x[1]), body=rows.map(r=>`<tr>${s.fields.map(([k])=>`<td>${esc(r[k]??"")}</td>`).join("")}</tr>`).join("");
  let total=rows.reduce((a,r)=>a+(+r.amount||+r.total||(+r.qty||0)*(+r.rate||0)||0),0),vat=rows.reduce((a,r)=>a+(+r.vat||0),0);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(s.title)} - EKIMA</title><style>body{font-family:Arial;color:#172033;margin:36px}header{border-bottom:3px solid #1976d2;padding-bottom:14px;margin-bottom:24px}h1{margin:0;color:#102a43}h2{margin:12px 0 4px}small{color:#64748b}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #dce5ef;padding:7px;text-align:left}th{background:#eaf2fb}.totals{margin:18px 0 0 auto;width:280px}.totals div{display:flex;justify-content:space-between;padding:5px;border-bottom:1px solid #e2e8f0}.sign{display:flex;justify-content:space-between;margin-top:80px}.sign span{width:180px;border-top:1px solid #172033;padding-top:8px;text-align:center}</style></head><body><header><h1>${esc(data.settings.companyName||"EKIMA ENTERPRISES")}</h1><small>${esc(data.settings.address||"")} · ${esc(data.settings.phone||"")} ${data.settings.vat?"· VAT: "+esc(data.settings.vat):""}</small><h2>${esc(s.title)} Report</h2><small>Date: ${today()} · Prepared by: ${esc(current?.name||"Administrator")}</small></header><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${body||`<tr><td colspan="${Math.max(headers.length,1)}">No records</td></tr>`}</tbody></table><div class="totals"><div><b>Subtotal</b><b>${money(total)}</b></div><div><span>VAT</span><span>${money(vat)}</span></div><div><b>Total</b><b>${money(total+vat)}</b></div></div><div class="sign"><span>Prepared By</span><span>Approved By</span></div></body></html>`;
}
function exportDocument(type,kind){
  if(kind==="print"&&!guard("print","print reports"))return;
  if(kind!=="print"&&!guard("export","export documents"))return;
  const html=reportHtml(type);
  if(kind==="word"){const blob=new Blob([html],{type:"application/msword"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ekima-${type}.doc`;a.click();return}
  if(kind==="print"){const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),300)}return}
  if(window.jspdf?.jsPDF){const doc=new jspdf.jsPDF({orientation:"landscape"});const rows=exportRows(type),s=schemas[type]||{title:type,fields:[]};doc.setFontSize(16);doc.setTextColor(16,42,67);doc.text(data.settings.companyName||"EKIMA ENTERPRISES",14,15);doc.setFontSize(11);doc.text(`${s.title} Report | ${today()}`,14,23);doc.setFontSize(8);let y=32;const cols=s.fields.map(x=>x[1]).join(" | ");doc.text(cols.slice(0,170),14,y);y+=6;rows.forEach(r=>{const line=s.fields.map(([k])=>String(r[k]??"")).join(" | ");if(y>190){doc.addPage();y=15}doc.text(line.slice(0,170),14,y);y+=5});const total=rows.reduce((a,r)=>a+(+r.amount||+r.total||(+r.qty||0)*(+r.rate||0)||0),0);doc.text(`Subtotal: ${money(total)}   VAT: ${money(rows.reduce((a,r)=>a+(+r.vat||0),0))}   Total: ${money(total)}`,14,Math.min(y+8,200));doc.text("Prepared By: ____________________    Approved By: ____________________",14,Math.min(y+20,210));doc.save(`ekima-${type}.pdf`)}else{const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();w.print()}}
}
window.exportDocument=exportDocument;
window.printCurrentEntry=function(type){if(!guard("print","print entries"))return;exportDocument(type,"print")};
function normalizeHeader(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
function mapImportRow(raw,type){
  const fields=schemas[type]?.fields||[], normalized={};
  fields.forEach(([key,label])=>{
    const wanted=[normalizeHeader(key),normalizeHeader(label)];
    const found=Object.keys(raw).find(h=>wanted.includes(normalizeHeader(h))||wanted.some(w=>normalizeHeader(h).includes(w)||w.includes(normalizeHeader(h))));
    normalized[key]=found?String(raw[found]??"").trim():"";
  });
  return normalized;
}
function validateImport(){
  const required={customers:["name"],suppliers:["name"],items:["name"],sales:["person","amount"],purchases:["supplier","item","qty"],returns:["item","qty"],expenses:["amount"],payments:["amount"],crm:["customer","mobile"],hr:["name"]};
  const seen=new Set(),errors=[];
  importState.rows.forEach((r,i)=>{
    const missing=(required[importState.module]||[]).filter(k=>!String(r[k]??"").trim());
    const key=keyValue(importState.module,r);
    if(missing.length)errors.push({row:i,field:missing.join(", "),message:"Required field missing"});
    else if(seen.has(key)||isDuplicate(importState.module,r))errors.push({row:i,field:"duplicate",message:"Duplicate record"});
    seen.add(key);
  });
  importState.errors=errors; return errors;
}
function importPage(){
  const stage=importState.rows.length?`<div class="import-stage"><div class="step done">1 Upload</div><div class="step active">2 Preview & Validate</div><div class="step">3 Confirm</div></div><div class="import-summary"><b>${importState.rows.length} row(s)</b> loaded from ${esc(importState.source)} · ${importState.errors.length} validation issue(s)</div><div class="tablewrap"><table class="import-table"><thead><tr>${importState.headers.map(h=>`<th>${esc(h)}</th>`).join("")}<th>Validation</th></tr></thead><tbody>${importState.rows.map((r,i)=>`<tr class="${importState.errors.some(e=>e.row===i)?"row-error":""}">${schemas[importState.module].fields.map(([k])=>`<td><input data-import-row="${i}" data-import-key="${k}" value="${esc(r[k]??"")}" oninput="updateImportCell(this)"></td>`).join("")}<td>${importState.errors.filter(e=>e.row===i).map(e=>esc(e.message)).join(", ")||"Ready"}</td></tr>`).join("")}</tbody></table></div><div class="form-actions"><button class="btn" onclick="validateAndRefreshImport()">Validate Again</button>${can("edit")?`<button class="btn success" onclick="confirmImport()">Confirm Import & Save</button>`:""}<button class="btn secondary" onclick="resetImport()">Clear</button></div>`:
  `<div class="upload-card"><div><h3>Upload a spreadsheet safely</h3><p class="muted">Choose a module, upload .xlsx/.xls/.csv, preview every row, correct validation errors, then confirm.</p></div><div class="import-controls"><select id="import-module">${Object.keys(schemas).map(k=>`<option value="${k}" ${k===importState.module?"selected":""}>${schemas[k].title}</option>`).join("")}</select><input id="import-file" type="file" accept=".xlsx,.xls,.csv" onchange="handleImportFile(this)"><button class="btn outline" onclick="downloadTemplate()">Download Template</button></div></div>`;
  return `<div class="wrap"><div class="head"><div><h1>Import Center</h1><div class="page-note">Import is permission-controlled and never overwrites records silently.</div></div>${actionButtons("sales")}</div><div class="panel">${stage}</div></div>`;
}
window.handleImportFile=function(input){
  if(!guard("import","import data")){input.value="";return}
  const file=input.files?.[0];if(!file||!window.XLSX)return;
  const reader=new FileReader();reader.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:"array"}),sheet=wb.Sheets[wb.SheetNames[0]],raw=XLSX.utils.sheet_to_json(sheet,{defval:""});importState.module=document.getElementById("import-module").value;importState.source=file.name;importState.headers=schemas[importState.module].fields.map(x=>x[1]);importState.rows=raw.map(r=>mapImportRow(r,importState.module));validateImport();render()}catch(err){alert("Could not read this spreadsheet: "+err.message)}};reader.readAsArrayBuffer(file);
};
window.updateImportCell=function(el){importState.rows[+el.dataset.importRow][el.dataset.importKey]=el.value};
window.validateAndRefreshImport=function(){validateImport();render();notify(importState.errors.length?`${importState.errors.length} issue(s) found`:"All rows are ready to import")};
window.resetImport=function(){importState={module:"sales",rows:[],headers:[],errors:[],source:""};render()};
window.confirmImport=function(){
  if(!guard("import","import data"))return;validateImport();if(importState.errors.length){alert("Fix all validation issues before confirming.");render();return}
  let added=0;importState.rows.forEach(r=>{if(!isDuplicate(importState.module,r)){r.id=Date.now()+added+Math.floor(Math.random()*1000);data[importState.module].push(r);afterRecordSaved(importState.module,r);added++}});save();notify(`${added} record(s) imported safely`);resetImport();
};
window.downloadTemplate=function(){const type=document.getElementById("import-module")?.value||"sales",headers=schemas[type].fields.map(x=>x[1]);if(window.XLSX){const ws=XLSX.utils.aoa_to_sheet([headers]);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Template");XLSX.writeFile(wb,`ekima-${type}-template.xlsx`)}};
function usersPageEnhanced(){
  const actions=["import","export","edit","delete","print"],roles=["Manager","Sales","Service","Store"];
  return `<div class="wrap"><div class="head"><div><h1>Users & Permissions</h1><div class="page-note">Admin always has full access. Changes apply immediately in this browser.</div></div></div><div class="panel"><div class="permission-table"><table><thead><tr><th>Role</th>${actions.map(a=>`<th>${a[0].toUpperCase()+a.slice(1)}</th>`).join("")}</tr></thead><tbody>${roles.map(role=>`<tr><th>${role}</th>${actions.map(a=>`<td><input type="checkbox" ${data.permissions?.[role]?.[a]!==false?"checked":""} onchange="setPermission('${role}','${a}',this.checked)"></td>`).join("")}</tr>`).join("")}</tbody></table></div></div><div class="panel"><h3>Staff accounts</h3>${data.users.map(u=>`<div class="user-row"><b>${esc(u.name)}</b><span>${esc(u.username)} · ${esc(u.role)}</span></div>`).join("")}</div></div>`;
}
window.setPermission=function(role,action,value){data.permissions[role]=data.permissions[role]||{};data.permissions[role][action]=value;save();notify(`${role} ${action} permission ${value?"enabled":"disabled"}`)};
function settingsPageEnhanced(){return `<div class="wrap"><div class="head"><div><h1>System Settings</h1><div class="page-note">These company details appear on PDF, Word and print reports.</div></div>${actionButtons("transactions")}</div><div class="panel"><div class="settings-grid"><label>Company name<input id="set-company" value="${esc(data.settings.companyName)}"></label><label>Address<input id="set-address" value="${esc(data.settings.address)}"></label><label>Phone<input id="set-phone" value="${esc(data.settings.phone)}"></label><label>Email<input id="set-email" value="${esc(data.settings.email)}"></label><label>PAN / VAT<input id="set-vat" value="${esc(data.settings.vat)}"></label></div><button class="btn" onclick="saveCompanySettings()">Save Company Details</button></div><div class="panel"><p class="muted">Use Users & Permissions to control Import, Export, Edit, Delete and Print for each role.</p></div></div>`}
window.saveCompanySettings=function(){["companyName","address","phone","email","vat"].forEach(k=>data.settings[k]=document.getElementById("set-"+(k==="companyName"?"company":k))?.value||"");save();notify("Company details saved");render()};
})();

