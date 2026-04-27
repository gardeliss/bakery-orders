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
    printArea.innerHTML = `<div style="text-align:center; margin-bottom:20px;"><img src="banner.png" style="max-width:200px;"></div>` + htmlContent;
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
    const html = `<h2>ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2><p><strong>Πελάτης:</strong> ${o.last_name} ${o.first_name}</p><p><strong>Παράδοση:</strong> ${o.delivery_date}</p><hr><p>${o.description.replace(/\n/g, '<br>')}</p><hr><h3>Υπόλοιπο: ${(o.total_price - o.deposit).toFixed(2)}€</h3>`;
    renderAndPrint(html);
}

function printWeeklyList() {
    const startStr = prompt("Ημερομηνία έναρξης (YYYY-MM-DD):");
    if (!startStr) return;
    const filtered = allOrders.filter(o => o.delivery_date >= startStr);
    let content = `<h2>📋 Εβδομαδιαίο Πλάνο</h2>`;
    filtered.forEach(o => { content += `<p><strong>${o.delivery_date}</strong>: ${o.last_name} - ${o.description}</p>`; });
    renderAndPrint(content);
}

// 4. Ημερολόγιο
function initAdvancedCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'el',
        events: allOrders.map(o => ({ title: o.last_name, start: o.delivery_date, extendedProps: { id: o.id } })),
        eventClick: (info) => { window.location.href = `index.html?edit=${info.event.extendedProps.id}`; }
    });
    calendar.render();
}

// 5. Edit Mode
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
        document.getElementById('formPrintBtn').style.display = "block";
    }
}