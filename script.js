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

// 3. Διαγραφή Παραγγελίας
async function deleteOrder(id) {
    if (!confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την παραγγελία;")) return;
    try {
        const { error } = await _supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        alert("Η παραγγελία διαγράφηκε.");
        fetchOrders(); // Ανανέωση λίστας
    } catch (err) { alert("Σφάλμα διαγραφής: " + err.message); }
}

// 4. Εμφάνιση Λίστας στην Αναζήτηση
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
                <button class="btn-small" onclick="window.location.href='index.html?edit=${o.id}'" title="Επεξεργασία">📝</button>
                <button class="btn-small" onclick="printOneOrder('${o.id}')" title="Εκτύπωση">🖨️</button>
                <button class="btn-small" onclick="deleteOrder('${o.id}')" style="color:red" title="Διαγραφή">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Φιλτράρισμα στην αναζήτηση
function filterOrders() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.first_name.toLowerCase().includes(val) || 
        o.last_name.toLowerCase().includes(val) || 
        o.phone.includes(val)
    );
    displayOrders(filtered);
}

// 5. Εκτύπωση
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;
    printArea.innerHTML = `<div style="text-align:center; margin-bottom:20px;"><img src="banner.png" style="max-width:200px;"></div>` + htmlContent;
    window.print();
    setTimeout(() => { printArea.innerHTML = ""; }, 500);
}

function printOneOrder(id) {
    const o = allOrders.find(x => x.id == id);
    if (!o) return;
    const html = `
        <h2 style="text-align:center">ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        <p><strong>Πελάτης:</strong> ${o.last_name} ${o.first_name}</p>
        <p><strong>Τηλέφωνο:</strong> ${o.phone}</p>
        <p><strong>Παράδοση:</strong> ${o.delivery_date.split('-').reverse().join('-')} (${o.location_type})</p>
        <p><strong>Διεύθυνση:</strong> ${o.address || '-'}</p>
        <hr>
        <p><strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${o.description.replace(/\n/g, '<br>')}</p>
        <hr>
        <h3>Σύνολο: ${o.total_price.toFixed(2)}€ | Προκαταβολή: ${o.deposit.toFixed(2)}€</h3>
        <h2 style="color:#2a5a5a">Υπόλοιπο: ${(o.total_price - o.deposit).toFixed(2)} €</h2>
    `;
    renderAndPrint(html);
}

// Εκτύπωση απευθείας από τη φόρμα (index.html)
function printFromForm() {
    const id = document.getElementById('orderId').value;
    if (!id) return alert("Αποθηκεύστε πρώτα την παραγγελία.");
    printOneOrder(id);
}

// 6. Αναφορές (Reports)
function printWeeklyList() {
    const today = new Date().toISOString().split('T')[0];
    const startStr = prompt("Ημερομηνία έναρξης εβδομάδας:", today);
    if (!startStr) return;
    const start = new Date(startStr);
    const end = new Date(start); end.setDate(start.getDate() + 7);

    const filtered = allOrders.filter(o => {
        const d = new Date(o.delivery_date);
        return d >= start && d < end;
    });

    let content = `<h2 style="text-align:center">🖨️ Εβδομαδιαίο Πλάνο</h2>`;
    const days = [...new Set(filtered.map(o => o.delivery_date))].sort();
    
    days.forEach(day => {
        const dObj = new Date(day);
        const dayName = dObj.toLocaleDateString('el-GR', { weekday: 'long' });
        content += `<div style="border-bottom: 2px solid #333; margin-top:20px; padding-bottom:10px;">
            <h3 style="background:#f0f0f0; padding:8px;">📅 ${dayName.toUpperCase()} - ${day.split('-').reverse().join('-')}</h3>`;
        filtered.filter(o => o.delivery_date === day).forEach(o => {
            content += `<p style="margin:10px 0;"><strong>• ${o.last_name} ${o.first_name}</strong>: ${o.description} <span style="float:right">📞 ${o.phone}</span></p>`;
        });
        content += `</div>`;
    });
    renderAndPrint(content);
}

function printWeeklyTable() {
    const today = new Date().toISOString().split('T')[0];
    const startStr = prompt("Ημερομηνία έναρξης εβδομάδας:", today);
    if (!startStr) return;
    const start = new Date(startStr);
    const end = new Date(start); end.setDate(start.getDate() + 7);

    const filtered = allOrders.filter(o => {
        const d = new Date(o.delivery_date);
        return d >= start && d < end;
    });

    let html = `<h2 style="text-align:center">📊 Πίνακας Εβδομάδας</h2>
                <table border="1" style="width:100%; border-collapse:collapse; text-align:left;">
                <tr style="background:#eee"><th>Ημ/νία</th><th>Πελάτης</th><th>Περιγραφή</th></tr>`;
    filtered.forEach(o => {
        html += `<tr>
            <td style="padding:5px">${o.delivery_date.split('-').reverse().join('-')}</td>
            <td style="padding:5px">${o.last_name}</td>
            <td style="padding:5px">${o.description}</td>
        </tr>`;
    });
    html += `</table>`;
    renderAndPrint(html);
}

// 7. Ημερολόγιο
function initAdvancedCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'el',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
        events: allOrders.map(o => ({
            title: `${o.last_name} (${o.location_type})`,
            start: o.delivery_date,
            extendedProps: { id: o.id },
            backgroundColor: o.location_type === 'Σπίτι' ? '#2a5a5a' : '#d4a373'
        })),
        eventClick: (info) => { window.location.href = `index.html?edit=${info.event.extendedProps.id}`; }
    });
    calendar.render();
}

// 8. Edit Mode
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
        document.getElementById('submitBtn').innerText = "Ενημέρωση Παραγγελίας";
        document.getElementById('formPrintBtn').style.display = "block";
    }
}