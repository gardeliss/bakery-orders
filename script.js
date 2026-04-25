// 1. Ορισμός Μεταβλητών στην κορυφή για να τις "βλέπουν" όλες οι συναρτήσεις
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allOrders = []; // Ορισμός της λίστας στην κορυφή
let calendar;

console.log("Το script.js φορτώθηκε και το Supabase αρχικοποιήθηκε.");

// --- ΛΗΨΗ ΠΑΡΑΓΓΕΛΙΩΝ (ADMIN) ---
async function fetchOrders() {
    console.log("Εκτέλεση fetchOrders...");
    try {
        const { data, error } = await _supabase
            .from('orders')
            .select('*')
            .order('delivery_date', { ascending: true });

        if (error) throw error;
        
        allOrders = data;
        displayOrders(data);
        console.log("Φορτώθηκαν " + data.length + " παραγγελίες.");
    } catch (err) {
        console.error("Σφάλμα fetch:", err.message);
    }
}

// --- ΑΠΟΘΗΚΕΥΣΗ ΠΑΡΑΓΓΕΛΙΑΣ (INDEX) ---
async function handleSave() {
    const btn = document.getElementById('submitBtn');
    const orderId = document.getElementById('orderId').value;
    
    const orderData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
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
        
        alert("✅ Επιτυχής αποθήκευση!");
        if (orderId) window.location.href = 'admin.html';
        else document.getElementById('orderForm').reset();
    } catch (err) {
        alert("Σφάλμα: " + err.message);
    } finally {
        btn.disabled = false;
    }
}

// --- ΕΜΦΑΝΙΣΗ ΛΙΣΤΑΣ ---
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
                    <button class="btn-small btn-edit" onclick="window.location.href='index.html?edit=${order.id}'">📝</button>
                    <button class="btn-small" onclick="printOneOrder('${order.id}')">🖨️</button>
                    <button class="btn-small btn-delete" onclick="deleteOrder('${order.id}')">🗑️</button>
                </div>
            </div>`;
    });
}

// --- ΦΙΛΤΡΑΡΙΣΜΑ ---
function filterOrders() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.last_name.toLowerCase().includes(term) || 
        o.first_name.toLowerCase().includes(term) || 
        o.phone.includes(term)
    );
    displayOrders(filtered);
}

// --- ΔΙΑΓΡΑΦΗ ---
async function deleteOrder(id) {
    if (confirm("Θέλετε σίγουρα να διαγράψετε αυτή την παραγγελία;")) {
        const { error } = await _supabase.from('orders').delete().eq('id', id);
        if (!error) fetchOrders();
        else alert("Σφάλμα διαγραφής: " + error.message);
    }
}

// --- ΕΚΤΥΠΩΣΗ ---
function printOneOrder(id) {
    const order = allOrders.find(o => o.id == id);
    if (!order) return;
    const d = order.delivery_date.split('-');
    const formattedDate = `${d[2]}-${d[1]}-${d[0]}`;
    
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
        <div style="text-align:center; border-bottom: 2px solid #000; margin-bottom: 20px;">
            <img src="banner.png" style="max-width:200px;"><br>
            <h2>ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        </div>
        <p><strong>Πελάτης:</strong> ${order.first_name} ${order.last_name}</p>
        <p><strong>Τηλέφωνο:</strong> ${order.phone}</p>
        <p><strong>Παράδοση:</strong> ${formattedDate} (${order.location_type})</p>
        <p><strong>Διεύθυνση:</strong> ${order.address || '-'}</p>
        <hr><p><strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${order.description.replace(/\n/g, '<br>')}</p><hr>
        <h3>Σύνολο: ${order.total_price} €</h3>
        <h3>Προκαταβολή: ${order.deposit} €</h3>
        <h2>Υπόλοιπο: ${(order.total_price - order.deposit).toFixed(2)} €</h2>`;
    window.print();
}

// --- ΗΜΕΡΟΛΟΓΙΟ ---
function openCalendar() {
    document.getElementById('calendarModal').style.display = "block";
    const calendarEl = document.getElementById('calendar');
    
    const events = allOrders.map(o => ({ 
        id: o.id, 
        title: `${o.last_name} ${o.first_name} - 📞 ${o.phone}`, 
        start: o.delivery_date,
        backgroundColor: '#2a5a5a',
        borderColor: '#2a5a5a'
    }));

    if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'el',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth' },
            events: events,
            eventClick: (info) => {
                if (confirm(`Επεξεργασία παραγγελίας: ${info.event.title};`)) {
                    window.location.href = `index.html?edit=${info.event.id}`;
                }
            }
        });
    } else {
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }
    calendar.render();
    setTimeout(() => { calendar.updateSize(); }, 200);
}

function closeCalendar() {
    document.getElementById('calendarModal').style.display = "none";
}

// --- ΦΟΡΤΩΣΗ ΓΙΑ EDIT ---
async function loadOrderToEdit(id) {
    const { data, error } = await _supabase.from('orders').select('*').eq('id', id).single();
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
        if(document.getElementById('cancelBtn')) document.getElementById('cancelBtn').style.display = "block";
    }
}