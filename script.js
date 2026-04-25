const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ΔΙΑΧΕΙΡΙΣΗ ΑΠΟΘΗΚΕΥΣΗΣ (NEW & UPDATE) ---
async function handleSave() {
    const orderId = document.getElementById('orderId').value;
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;

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

    let result;
    if (orderId) {
        // Update υπάρχουσας
        result = await _supabase.from('orders').update(orderData).eq('id', orderId);
    } else {
        // Insert νέας
        result = await _supabase.from('orders').insert([orderData]);
    }

    if (result.error) {
        alert("Σφάλμα: " + result.error.message);
    } else {
        alert(orderId ? "✅ Η παραγγελία ενημερώθηκε!" : "✅ Η παραγγελία αποθηκεύτηκε!");
        if (orderId) window.location.href = 'admin.html';
        else document.getElementById('orderForm').reset();
    }
    btn.disabled = false;
}

// --- ΦΟΡΤΩΣΗ ΓΙΑ EDIT ---
async function loadOrderToEdit(id) {
    const { data, error } = await _supabase.from('orders').select('*').eq('id', id).single();
    if (data) {
        document.getElementById('orderId').value = data.id;
        document.getElementById('firstName').value = data.first_name;
        document.getElementById('lastName').value = data.last_name;
        document.getElementById('phone').value = data.phone;
        document.getElementById('email').value = data.email;
        document.getElementById('description').value = data.description;
        document.getElementById('deliveryDate').value = data.delivery_date;
        document.getElementById('locationType').value = data.location_type;
        document.getElementById('address').value = data.address;
        document.getElementById('totalPrice').value = data.total_price;
        document.getElementById('deposit').value = data.deposit;
        
        document.getElementById('formTitle').innerText = "📝 Επεξεργασία Παραγγελίας";
        document.getElementById('submitBtn').innerText = "Ενημέρωση Αλλαγών";
        document.getElementById('cancelBtn').style.display = "block";
    }
}

function resetForm() { window.location.href = 'index.html'; }

// --- ΑΝΑΖΗΤΗΣΗ & ΤΑΞΙΝΟΜΗΣΗ ---
let allOrders = [];
async function fetchOrders() {
    const { data, error } = await _supabase
        .from('orders')
        .select('*')
        .order('delivery_date', { ascending: true }); // Ταξινόμηση: Οι πιο κοντινές πάνω

    if (!error) {
        allOrders = data;
        displayOrders(data);
    }
}

function displayOrders(orders) {
    const list = document.getElementById('ordersList');
    if(!list) return;
    list.innerHTML = "";
    
    orders.forEach(order => {
        // Format ημερομηνίας DD-MM-YYYY
        const dateParts = order.delivery_date.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        list.innerHTML += `
            <div class="order-card">
                <div class="card-info">
                    <strong>${order.last_name} ${order.first_name}</strong><br>
                    📅 ${formattedDate} | 📞 ${order.phone}
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="window.location.href='index.html?edit=${order.id}'">Επεξεργασία</button>
                    <button class="btn-small" onclick="printOneOrder('${order.id}')">Εκτύπωση</button>
                </div>
            </div>
        `;
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

// --- ΕΚΤΥΠΩΣΗ ---
function printOneOrder(id) {
    const order = allOrders.find(o => o.id == id);
    const dateParts = order.delivery_date.split('-');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
        <div class="print-header">
            <img src="banner.png" style="max-width:200px;"><br>
            <h2>ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h2>
        </div>
        <p><strong>Πελάτης:</strong> ${order.first_name} ${order.last_name}</p>
        <p><strong>Τηλέφωνο:</strong> ${order.phone} | <strong>Email:</strong> ${order.email || '-'}</p>
        <p><strong>Ημερομηνία Παράδοσης:</strong> ${formattedDate}</p>
        <p><strong>Τοποθεσία:</strong> ${order.location_type} - ${order.address || ''}</p>
        <hr>
        <p><strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${order.description}</p>
        <hr>
        <p>Σύνολο: ${order.total_price} € | Προκαταβολή: ${order.deposit} €</p>
        <h2>Υπόλοιπο Πληρωμής: ${(order.total_price - order.deposit).toFixed(2)} €</h2>
    `;
    window.print();
}