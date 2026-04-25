const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ΛΕΙΤΟΥΡΓΙΑ ΚΑΤΑΧΩΡΗΣΗΣ ---
async function saveOrder() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "Αποστολή...";
    submitBtn.disabled = true;

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

    const { data, error } = await _supabase.from('orders').insert([orderData]);

    if (error) {
        alert("Σφάλμα: " + error.message);
    } else {
        alert("✅ Η παραγγελία αποθηκεύτηκε!");
        document.getElementById('orderForm').reset();
    }
    submitBtn.innerText = "✅ Αποθήκευση Παραγγελίας";
    submitBtn.disabled = false;
}

// --- ΛΕΙΤΟΥΡΓΙΑ ΑΝΑΖΗΤΗΣΗΣ ---
let allOrders = [];

async function fetchOrders() {
    const { data, error } = await _supabase
        .from('orders')
        .select('*')
        .order('delivery_date', { ascending: true });

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
        list.innerHTML += `
            <div class="order-card">
                <div>
                    <strong>${order.last_name} ${order.first_name}</strong><br>
                    📅 ${order.delivery_date} | 📞 ${order.phone}
                </div>
                <button class="print-btn" onclick="printOneOrder('${order.id}')">Εκτύπωση</button>
            </div>
        `;
    });
}

function filterOrders() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.last_name.toLowerCase().includes(term) || o.phone.includes(term)
    );
    displayOrders(filtered);
}

// --- ΛΕΙΤΟΥΡΓΙΑ ΕΚΤΥΠΩΣΗΣ ---
function printOneOrder(id) {
    const order = allOrders.find(o => o.id == id);
    const printArea = document.getElementById('printArea');
    
    printArea.innerHTML = `
        <div class="print-header">
            <h1>ΑΠΟΔΕΙΞΗ ΠΑΡΑΓΓΕΛΙΑΣ</h1>
        </div>
        <p><strong>Πελάτης:</strong> ${order.first_name} ${order.last_name}</p>
        <p><strong>Τηλέφωνο:</strong> ${order.phone}</p>
        <p><strong>Ημερομηνία Παράδοσης:</strong> ${order.delivery_date}</p>
        <p><strong>Τοποθεσία:</strong> ${order.location_type} - ${order.address || ''}</p>
        <hr>
        <p><strong>ΠΕΡΙΓΡΑΦΗ:</strong><br>${order.description}</p>
        <hr>
        <h3>Σύνολο: ${order.total_price} €</h3>
        <h3>Προκαταβολή: ${order.deposit} €</h3>
        <h2>Υπόλοιπο: ${(order.total_price - order.deposit).toFixed(2)} €</h2>
    `;
    
    window.print();
}