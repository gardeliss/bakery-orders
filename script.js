/* script.js */
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allOrders = [];

// 1. Λήψη Παραγγελιών
async function fetchOrders() {
    try {
        const { data, error } = await _supabase.from('orders').select('*').order('delivery_date', { ascending: true });
        if (error) throw error;
        allOrders = data;
        if (document.getElementById('ordersList')) displayOrders(data);
    } catch (err) { console.error("Σφάλμα:", err.message); }
}

// 2. Εμφάνιση Λίστας & Αναζήτηση
function displayOrders(orders) {
    const list = document.getElementById('ordersList');
    if (!list) return;
    list.innerHTML = orders.map(o => `
        <div class="order-card">
            <div>
                <strong>${o.last_name} ${o.first_name}</strong><br>
                📅 ${o.delivery_date.split('-').reverse().join('-')} | 📞 ${o.phone}
            </div>
            <div class="card-actions">
                <button class="btn-small" onclick="window.location.href='index.html?edit=${o.id}'">📝</button>
                <button class="btn-small" onclick="printOneOrder('${o.id}')">🖨️</button>
            </div>
        </div>
    `).join('');
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

// 3. Αποθήκευση & Φόρμα
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

    if (!orderData.first_name || !orderData.last_name || !orderData.delivery_date) {
        alert("Συμπληρώστε τα υποχρεωτικά πεδία!");
        return;
    }

    btn.disabled = true;
    try {
        let res = orderId ? await _supabase.from('orders').update(orderData).eq('id', orderId) : await _supabase.from('orders').insert([orderData]);
        if (res.error) throw res.error;
        alert("✅ Επιτυχής αποθήκευση!");
        window.location.href = 'admin.html';
    } catch (err) { alert("Σφάλμα: " + err.message); }
    btn.disabled = false;
}

// 4. Εκτυπώσεις
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;
    printArea.innerHTML = `<div style="text-align:center; margin-bottom:20px;"><img src="banner.png" style="max-width:200px;"></div>` + htmlContent;
    window.print();
    setTimeout(() => { printArea.innerHTML = ""; }, 500);
}

function printFromForm() {
    const id = document.getElementById('orderId').value;
    if (!id) return alert("Αποθηκεύστε πρώτα!");
    printOneOrder(id);
}

function printOneOrder(id) {
    const o = allOrders.find(x => x.id == id);
    if (!o) {
        _supabase.from('orders').select('*').eq('id', id).single().then(({data}) => {
            if (data) formatOne(data);
        });
    } else {
        formatOne(o);
    }
}

function formatOne(o) {
    const html = `
        <h2 style="text-align:center">ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        <p><strong>Πελάτης:</strong> ${o.last_name} ${o.first_name} | 📞 ${o.phone}</p>
        <p><strong>Παράδοση:</strong> ${o.delivery_date.split('-').reverse().join('-')} (${o.location_type})</p>
        <p><strong>Διεύθυνση:</strong> ${o.address || '-'}</p>
        <hr><p><strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${o.description.replace(/\n/g, '<br>')}</p><hr>
        <h3>Σύνολο: ${o.total_price.toFixed(2)}€ | Προκαταβολή: ${o.deposit.toFixed(2)}€</h3>
        <h2 style="color:#2a5a5a">Υπόλοιπο: ${(o.total_price - o.deposit).toFixed(2)} €</h2>
    `;
    renderAndPrint(html);
}

function printWeeklyList() {
    const startStr = prompt("Ημερομηνία έναρξης (YYYY-MM-DD):");
    if (!startStr) return;
    const start = new Date(startStr);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    const filtered = allOrders.filter(o => { const d = new Date(o.delivery_date); return d >= start && d < end; });
    
    let content = `<h2 style="text-align:center">📋 Εβδομαδιαίο Πλάνο</h2>`;
    const days = [...new Set(filtered.map(o => o.delivery_date))].sort();
    days.forEach(day => {
        const dObj = new Date(day);
        const dayName = dObj.toLocaleDateString('el-GR', { weekday: 'long' });
        content += `<div style="border-bottom: 1px solid #ccc; margin-top:15px;">
            <h3 style="background:#f9f9f9; padding:5px;">📅 ${dayName.toUpperCase()} - ${day.split('-').reverse().join('-')}</h3>`;
        filtered.filter(o => o.delivery_date === day).forEach(o => {
            content += `<p><strong>• ${o.last_name}</strong>: ${o.description} (📞 ${o.phone})</p>`;
        });
        content += `</div>`;
    });
    renderAndPrint(content);
}

function printWeeklyTable() {
    alert("Η λειτουργία Πίνακα θα προστεθεί σύντομα. Χρησιμοποιήστε τη Λίστα Εβδομάδας.");
}

// 5. Ημερολόγιο
function initAdvancedCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'el',
        events: allOrders.map(o => ({ title: `${o.last_name} (${o.location_type})`, start: o.delivery_date, extendedProps: { id: o.id } })),
        eventClick: (info) => { window.location.href = `index.html?edit=${info.event.extendedProps.id}`; }
    });
    calendar.render();
}

// 6. Edit Mode
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
        
        document.getElementById('formTitle').innerText = "📝 Επεξεργασία";
        document.getElementById('submitBtn').innerText = "Ενημέρωση";
        document.getElementById('formPrintBtn').style.display = "block";
    }
}