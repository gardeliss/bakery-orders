/* script.js */
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allOrders = [];

// 1. Λήψη & Εμφάνιση
async function fetchOrders() {
    try {
        const { data, error } = await _supabase.from('orders').select('*').order('delivery_date', { ascending: true });
        if (error) throw error;
        allOrders = data;
        if (document.getElementById('ordersList')) displayOrders(data);
    } catch (err) { console.error("Σφάλμα:", err.message); }
}

function displayOrders(orders) {
    const list = document.getElementById('ordersList');
    if (!list) return;
    list.innerHTML = orders.map(o => `
        <div class="order-card">
            <div>
                <strong>${o.last_name} ${o.first_name}</strong><br>
                📅 ${o.delivery_date.split('-').reverse().join('-')} | 📞 ${o.phone}
            </div>
            <div class="card-actions" style="display:flex; gap:8px;">
                <button class="btn-small" title="Επεξεργασία" onclick="window.location.href='index.html?edit=${o.id}'">📝</button>
                <button class="btn-small" title="Εκτύπωση" onclick="printOneOrder('${o.id}')">🖨️</button>
                <button class="btn-small" title="Διαγραφή" style="color:red;" onclick="deleteOrder('${o.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function deleteOrder(id) {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την παραγγελία;")) return;
    const { error } = await _supabase.from('orders').delete().eq('id', id);
    if (error) alert("Σφάλμα κατά τη διαγραφή: " + error.message);
    else {
        alert("Η παραγγελία διαγράφηκε.");
        fetchOrders(); // Ανανέωση λίστας
    }
}

function filterOrders() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.first_name.toLowerCase().includes(term) || 
        o.last_name.toLowerCase().includes(term) || 
        o.phone.includes(term)
    );
    displayOrders(filtered);
}

// 2. Αποθήκευση
async function handleSave() {
    const btn = document.getElementById('submitBtn');
    const orderId = document.getElementById('orderId').value;
    const orderData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        description: document.getElementById('description').value,
        delivery_date: document.getElementById('deliveryDate').value,
        location_type: document.getElementById('locationType').value,
        address: document.getElementById('address').value,
        total_price: parseFloat(document.getElementById('totalPrice').value) || 0,
        deposit: parseFloat(document.getElementById('deposit').value) || 0
    };
    btn.disabled = true;
    try {
        let res = orderId ? await _supabase.from('orders').update(orderData).eq('id', orderId) : await _supabase.from('orders').insert([orderData]);
        alert("✅ Επιτυχής αποθήκευση!");
        window.location.href = 'admin.html';
    } catch (err) { alert(err.message); }
    btn.disabled = false;
}

// 3. Εκτυπώσεις
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `<div style="text-align:center; margin-bottom:20px;"><img src="banner.png" style="max-width:250px;"></div>` + htmlContent;
    window.print();
}

function printFromForm() {
    const id = document.getElementById('orderId').value;
    if (!id) return alert("Αποθηκεύστε πρώτα!");
    printOneOrder(id);
}

function printOneOrder(id) {
    const o = allOrders.find(x => x.id == id);
    if (!o) {
        _supabase.from('orders').select('*').eq('id', id).single().then(({data}) => { if (data) formatOne(data); });
    } else { formatOne(o); }
}

function formatOne(o) {
    const html = `
        <h2 style="text-align:center; border-bottom:2px solid #2a5a5a;">ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        <p><strong>Πελάτης:</strong> ${o.last_name} ${o.first_name} | 📞 ${o.phone}</p>
        <p><strong>Ημερομηνία:</strong> ${o.delivery_date.split('-').reverse().join('-')} (${o.location_type})</p>
        <div style="border:1px solid #ccc; padding:15px; margin:20px 0; min-height:100px;">
            <strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${o.description.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align:right;">
            <p>Σύνολο: ${o.total_price.toFixed(2)}€ | Προκαταβολή: ${o.deposit.toFixed(2)}€</p>
            <h2 style="color:#2a5a5a">Υπόλοιπο: ${(o.total_price - o.deposit).toFixed(2)}€</h2>
        </div>
    `;
    renderAndPrint(html);
}

function getWeeklyData() {
    const today = new Date().toISOString().split('T')[0];
    const startStr = prompt("Ημερομηνία έναρξης (YYYY-MM-DD):", today);
    if (!startStr) return null;
    const start = new Date(startStr);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    const filtered = allOrders.filter(o => {
        const d = new Date(o.delivery_date);
        return d >= start && d < end;
    }).sort((a,b) => new Date(a.delivery_date) - new Date(b.delivery_date));
    return { filtered, startStr };
}

function printWeeklyList() {
    const data = getWeeklyData();
    if (!data) return;
    let content = `<h2 style="text-align:center;">📋 Λίστα Εβδομάδας (από ${data.startStr})</h2>`;
    data.filtered.forEach(o => {
        content += `<div style="border-bottom:1px solid #eee; padding:10px 0;">
            <strong>${o.delivery_date.split('-').reverse().join('-')}</strong>: ${o.last_name} - ${o.description} (📞 ${o.phone})
        </div>`;
    });
    renderAndPrint(content);
}

function printWeeklyTable() {
    const data = getWeeklyData();
    if (!data) return;
    let content = `<h2 style="text-align:center;">📊 Πίνακας Εβδομάδας</h2>
    <table border="1" style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead><tr style="background:#f2f2f2;"><th>Ημερομηνία</th><th>Πελάτης</th><th>Περιγραφή</th><th>Τηλέφωνο</th></tr></thead>
        <tbody>`;
    data.filtered.forEach(o => {
        content += `<tr>
            <td style="padding:5px;">${o.delivery_date.split('-').reverse().join('-')}</td>
            <td style="padding:5px;">${o.last_name}</td>
            <td style="padding:5px;">${o.description}</td>
            <td style="padding:5px;">${o.phone}</td>
        </tr>`;
    });
    content += `</tbody></table>`;
    renderAndPrint(content);
}

// 4. Ημερολόγιο & Edit
function initAdvancedCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', locale: 'el',
        events: allOrders.map(o => ({ title: `${o.last_name} (${o.location_type})`, start: o.delivery_date, extendedProps: { id: o.id } })),
        eventClick: (info) => { window.location.href = `index.html?edit=${info.event.extendedProps.id}`; }
    });
    calendar.render();
}

async function loadOrderToEdit(id) {
    const { data } = await _supabase.from('orders').select('*').eq('id', id).single();
    if (data) {
        document.getElementById('orderId').value = data.id;
        document.getElementById('firstName').value = data.first_name;
        document.getElementById('lastName').value = data.last_name;
        document.getElementById('phone').value = data.phone;
        document.getElementById('description').value = data.description;
        document.getElementById('deliveryDate').value = data.delivery_date;
        document.getElementById('locationType').value = data.location_type;
        document.getElementById('address').value = data.address;
        document.getElementById('totalPrice').value = data.total_price;
        document.getElementById('deposit').value = data.deposit;
        document.getElementById('formTitle').innerText = "📝 Επεξεργασία Παραγγελίας";
        document.getElementById('formPrintBtn').style.display = "block";
    }
}