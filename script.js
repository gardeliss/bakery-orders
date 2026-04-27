/* script.js */
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allOrders = [];

// Λήψη δεδομένων
async function fetchOrders() {
    try {
        const { data, error } = await _supabase.from('orders').select('*').order('delivery_date', { ascending: true });
        if (error) throw error;
        allOrders = data;
        if (document.getElementById('ordersList')) displayOrders(data);
    } catch (err) { console.error("Σφάλμα:", err.message); }
}

// Αποθήκευση
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

// Εκτύπωση
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `<div style="text-align:center;"><img src="banner.png" style="max-width:200px;"></div>` + htmlContent;
    window.print();
}

function printFromForm() {
    const id = document.getElementById('orderId').value;
    if (!id) return alert("Αποθηκεύστε πρώτα!");
    printOneOrder(id);
}

function printOneOrder(id) {
    const o = allOrders.find(x => x.id == id) || allOrders[0]; 
    if (!o) return;
    const html = `
        <h2 style="text-align:center">ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        <p><strong>Πελάτης:</strong> ${o.last_name} ${o.first_name}</p>
        <p><strong>Παράδοση:</strong> ${o.delivery_date}</p>
        <hr>
        <p>${o.description.replace(/\n/g, '<br>')}</p>
        <hr>
        <h3>Υπόλοιπο: ${(o.total_price - o.deposit).toFixed(2)}€</h3>
    `;
    renderAndPrint(html);
}

// ΗΜΕΡΟΛΟΓΙΟ (Η συνάρτηση που έλειπε)
function initAdvancedCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'el',
        events: allOrders.map(o => ({
            title: o.last_name,
            start: o.delivery_date,
            extendedProps: { id: o.id }
        })),
        eventClick: (info) => { window.location.href = `index.html?edit=${info.event.extendedProps.id}`; }
    });
    calendar.render();
}

// Load for Edit
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