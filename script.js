// 1. Ρυθμίσεις Supabase
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allOrders = []; 
let calendar;

console.log("Το script.js φορτώθηκε επιτυχώς.");

// --- ΛΗΨΗ ΠΑΡΑΓΓΕΛΙΩΝ ---
async function fetchOrders() {
    try {
        const { data, error } = await _supabase
            .from('orders')
            .select('*')
            .order('delivery_date', { ascending: true });

        if (error) throw error;
        allOrders = data;
        if (document.getElementById('ordersList')) displayOrders(data);
    } catch (err) {
        console.error("Σφάλμα fetch:", err.message);
    }
}

// --- ΑΠΟΘΗΚΕΥΣΗ ΠΑΡΑΓΓΕΛΙΑΣ ---
async function handleSave() {
    const btn = document.getElementById('submitBtn');
    const orderId = document.getElementById('orderId').value;
    
    const orderData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email') ? document.getElementById('email').value : '',
        description: document.getElementById('description').value,
        delivery_date: document.getElementById('deliveryDate').value,
        location_type: document.getElementById('locationType').value,
        address: document.getElementById('address').value,
        total_price: parseFloat(document.getElementById('totalPrice').value) || 0,
        deposit: parseFloat(document.getElementById('deposit').value) || 0
    };

    if (!orderData.first_name || !orderData.last_name || !orderData.delivery_date) {
        alert("Συμπληρώστε Όνομα, Επώνυμο και Ημερομηνία.");
        return;
    }

    btn.disabled = true;
    try {
        let res;
        if (orderId) {
            res = await _supabase.from('orders').update(orderData).eq('id', orderId);
        } else {
            res = await _supabase.from('orders').insert([orderData]);
        }
        if (res.error) throw res.error;
        alert("✅ Η παραγγελία αποθηκεύτηκε!");
        if (orderId) window.location.href = 'admin.html';
        else document.getElementById('orderForm').reset();
    } catch (err) {
        alert("Σφάλμα: " + err.message);
    } finally {
        btn.disabled = false;
    }
}

// --- ΕΜΦΑΝΙΣΗ ΛΙΣΤΑΣ (ADMIN) ---
function displayOrders(orders) {
    const list = document.getElementById('ordersList');
    if (!list) return;
    list.innerHTML = "";
    
    orders.forEach(order => {
        const d = order.delivery_date.split('-');
        const formattedDate = `${d[2]}-${d[1]}-${d[0]}`;

        list.innerHTML += `
            <div class="order-card">
                <div class="card-info">
                    <strong>${order.last_name} ${order.first_name}</strong><br>
                    📅 ${formattedDate} | 📞 ${order.phone}
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="window.location.href='index.html?edit=${order.id}'" title="Επεξεργασία">📝</button>
                    <button class="btn-small" onclick="printOneOrder('${order.id}')" title="Εκτύπωση">🖨️</button>
                    <button class="btn-small btn-delete" onclick="deleteOrder('${order.id}')" title="Διαγραφή">🗑️</button>
                </div>
            </div>`;
    });
}

function filterOrders() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.last_name.toLowerCase().includes(term) || 
        o.first_name.toLowerCase().includes(term) || 
        o.phone.includes(term)
    );
    displayOrders(filtered);
}

async function deleteOrder(id) {
    if (confirm("Διαγραφή παραγγελίας;")) {
        const { error } = await _supabase.from('orders').delete().eq('id', id);
        if (!error) fetchOrders();
    }
}

// --- ΕΚΤΥΠΩΣΕΙΣ ---
function printOneOrder(id) {
    const order = allOrders.find(o => o.id == id);
    if (!order) return;
    const d = order.delivery_date.split('-');
    const formattedDate = `${d[2]}-${d[1]}-${d[0]}`;
    
    const html = `
        <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom:10px; margin-bottom:20px;">
            <img src="banner.png" style="max-width:200px;"><br>
            <h2>ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        </div>
        <p><strong>Πελάτης:</strong> ${order.first_name} ${order.last_name}</p>
        <p><strong>Τηλέφωνο:</strong> ${order.phone}</p>
        <p><strong>Παράδοση:</strong> ${formattedDate} (${order.location_type})</p>
        <p><strong>Διεύθυνση:</strong> ${order.address || '-'}</p>
        <hr><p><strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${order.description.replace(/\n/g, '<br>')}</p><hr>
        <h3>Σύνολο: ${order.total_price} € | Προκαταβολή: ${order.deposit} €</h3>
        <h2>Υπόλοιπο: ${(order.total_price - order.deposit).toFixed(2)} €</h2>`;
    
    renderAndPrint(html);
}

function printFromForm() {
    const orderId = document.getElementById('orderId').value;
    if (orderId) {
        // Εύρεση της παραγγελίας από την allOrders (που φορτώθηκε στο window.onload)
        printOneOrder(orderId);
    } else {
        alert("Πρέπει πρώτα να αποθηκεύσετε την παραγγελία.");
    }
}

function renderAndPrint(html) {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;
    printArea.innerHTML = html;
    window.print();
}

// --- ΗΜΕΡΟΛΟΓΙΟ (ADVANCED) ---
function initAdvancedCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const events = allOrders.map(o => ({ 
        id: o.id, 
        title: `${o.last_name} ${o.first_name} - 📞 ${o.phone}`, 
        start: o.delivery_date,
        backgroundColor: '#2a5a5a',
        borderColor: '#2a5a5a'
    }));

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'el',
        height: 'auto',
        events: events,
        eventClick: (info) => {
            if (confirm(`Επεξεργασία παραγγελίας: ${info.event.title};`)) {
                window.location.href = `index.html?edit=${info.event.id}`;
            }
        }
    });
    calendar.render();

    // Swipe για κινητά
    if (typeof Hammer !== 'undefined') {
        const mc = new Hammer(calendarEl);
        mc.on("swipeleft", () => calendar.next());
        mc.on("swiperight", () => calendar.prev());
    }
}

// --- ΕΒΔΟΜΑΔΙΑΙΕΣ ΑΝΑΦΟΡΕΣ ---
function printWeeklyList() {
    const startStr = prompt("Ημερομηνία έναρξης εβδομάδας (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!startStr) return;

    const startDate = new Date(startStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const filtered = allOrders.filter(o => {
        const d = new Date(o.delivery_date);
        return d >= startDate && d < endDate;
    });

    let content = `<h2>Εβδομαδιαία Λίστα (Ανά Ημέρα)</h2>`;
    const days = [...new Set(filtered.map(o => o.delivery_date))].sort();
    
    days.forEach(day => {
        const d = day.split('-');
        content += `<div style="border-bottom:1px solid #ccc; margin-top:20px;"><h3>📅 ${d[2]}-${d[1]}-${d[0]}</h3>`;
        filtered.filter(o => o.delivery_date === day).forEach(o => {
            content += `<p><strong>${o.last_name} ${o.first_name}</strong>: ${o.description} (📞 ${o.phone})</p>`;
        });
        content += `</div>`;
    });
    renderAndPrint(content);
}

function printWeeklyTable() {
    const startStr = prompt("Ημερομηνία έναρξης (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!startStr) return;

    const startDate = new Date(startStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const filtered = allOrders.filter(o => {
        const d = new Date(o.delivery_date);
        return d >= startDate && d < endDate;
    });

    let tableHtml = `<h2>Πίνακας Εβδομάδας</h2><table style="width:100%; border-collapse:collapse;" border="1">
        <tr style="background:#f2f2f2;"><th>Ημ/νία</th><th>Πελάτης</th><th>Περιγραφή</th><th>Υπόλοιπο</th></tr>`;
    
    filtered.forEach(o => {
        const d = o.delivery_date.split('-');
        tableHtml += `<tr>
            <td style="padding:5px;">${d[2]}-${d[1]}-${d[0]}</td>
            <td style="padding:5px;">${o.last_name} ${o.first_name}</td>
            <td style="padding:5px;">${o.description}</td>
            <td style="padding:5px;">${(o.total_price - o.deposit).toFixed(2)}€</td>
        </tr>`;
    });
    tableHtml += `</table>`;
    renderAndPrint(tableHtml);
}

// --- ΦΟΡΤΩΣΗ ΓΙΑ EDIT ---
async function loadOrderToEdit(id) {
    // Φορτώνουμε όλες τις παραγγελίες πρώτα για να μπορούμε να τυπώσουμε
    await fetchOrders(); 
    
    const { data } = await _supabase.from('orders').select('*').eq('id', id).single();
    if (data) {
        document.getElementById('orderId').value = data.id;
        document.getElementById('firstName').value = data.first_name;
        document.getElementById('lastName').value = data.last_name;
        document.getElementById('phone').value = data.phone;
        if(document.getElementById('email')) document.getElementById('email').value = data.email || '';
        document.getElementById('description').value = data.description;
        document.getElementById('deliveryDate').value = data.delivery_date;
        document.getElementById('locationType').value = data.location_type;
        document.getElementById('address').value = data.address || '';
        document.getElementById('totalPrice').value = data.total_price;
        document.getElementById('deposit').value = data.deposit;
        
        document.getElementById('formTitle').innerText = "📝 Επεξεργασία Παραγγελίας";
        document.getElementById('submitBtn').innerText = "Ενημέρωση Αλλαγών";
        
        // Εμφάνιση του κουμπιού εκτύπωσης μόνο στο Edit
        if(document.getElementById('formPrintBtn')) {
            document.getElementById('formPrintBtn').style.display = "block";
        }
    }
}