console.log("Το script.js φορτώθηκε επιτυχώς!");

const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';

// Δημιουργία client με έλεγχο αν υπάρχει η βιβλιοθήκη
let _supabase;
try {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Το Supabase αρχικοποιήθηκε!");
} catch (e) {
    console.error("Σφάλμα στην αρχικοποίηση του Supabase client:", e);
}

// --- ΔΙΑΧΕΙΡΙΣΗ ΑΠΟΘΗΚΕΥΣΗΣ ---
async function handleSave() {
    console.log("Κλήση handleSave...");
    const submitBtn = document.getElementById('submitBtn');
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

    submitBtn.disabled = true;
    try {
        let res;
        if (orderId) {
            res = await _supabase.from('orders').update(orderData).eq('id', orderId);
        } else {
            res = await _supabase.from('orders').insert([orderData]);
        }
        if (res.error) throw res.error;
        alert("Επιτυχής αποθήκευση!");
        if (orderId) window.location.href = 'admin.html';
        else document.getElementById('orderForm').reset();
    } catch (err) {
        alert("Σφάλμα: " + err.message);
    } finally {
        submitBtn.disabled = false;
    }
}

// --- ΛΗΨΗ ΠΑΡΑΓΓΕΛΙΩΝ ---
let allOrders = [];
async function fetchOrders() {
    console.log("Κλήση fetchOrders...");
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

function printOneOrder(id) {
    const order = allOrders.find(o => o.id == id);
    const d = order.delivery_date.split('-');
    const formattedDate = `${d[2]}-${d[1]}-${d[0]}`;
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
        <div style="text-align:center;">
            <img src="banner.png" style="max-width:200px;"><br>
            <h2>ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        </div>
        <p><strong>Πελάτης:</strong> ${order.first_name} ${order.last_name}</p>
        <p><strong>Τηλέφωνο:</strong> ${order.phone}</p>
        <p><strong>Παράδοση:</strong> ${formattedDate} (${order.location_type})</p>
        <hr><p>${order.description.replace(/\n/g, '<br>')}</p><hr>
        <h3>Υπόλοιπο: ${(order.total_price - order.deposit).toFixed(2)} €</h3>`;
    window.print();
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
        document.getElementById('totalPrice').value = data.total_price;
        document.getElementById('deposit').value = data.deposit;
        document.getElementById('formTitle').innerText = "📝 Επεξεργασία";
        document.getElementById('submitBtn').innerText = "Ενημέρωση";
    }
}

// Ημερολόγιο
let calendar;
function openCalendar() {
    document.getElementById('calendarModal').style.display = "block";
    const calendarEl = document.getElementById('calendar');
    const events = allOrders.map(o => ({ id: o.id, title: o.last_name, start: o.delivery_date }));
    if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'el',
            events: events,
            eventClick: (info) => window.location.href = `index.html?edit=${info.event.id}`
        });
    }
    calendar.render();
}
function closeCalendar() { document.getElementById('calendarModal').style.display = "none"; }