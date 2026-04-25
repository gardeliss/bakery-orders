// 1. Στοιχεία Σύνδεσης (Αντικατάστησε με τα δικά σου)
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Η κύρια συνάρτηση αποθήκευσης
async function saveOrder() {
    console.log("Η διαδικασία ξεκίνησε..."); // Έλεγχος στην κονσόλα

    // Συλλογή δεδομένων
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

    try {
        // Αποστολή στο Supabase
        const { data, error } = await _supabase
            .from('orders')
            .insert([orderData]);

        if (error) {
            throw error; // Αν υπάρχει σφάλμα, πήγαινε στο catch
        }

        console.log("Επιτυχία:", data);
        alert("Η παραγγελία αποθηκεύτηκε στη βάση δεδομένων!");
        
        // Μόνο αν πετύχει η αποθήκευση, προχωράμε στην εκτύπωση
        preparePrint();

    } catch (err) {
        console.error("Σφάλμα Supabase:", err.message);
        alert("Σφάλμα κατά την αποθήκευση: " + err.message);
    }
}

// 3. Η συνάρτηση εκτύπωσης (όπως την είχαμε)
function preparePrint() {
    const data = {
        "Πελάτης": document.getElementById('firstName').value + " " + document.getElementById('lastName').value,
        "Τηλέφωνο": document.getElementById('phone').value,
        "Περιγραφή": document.getElementById('description').value,
        "Παράδοση": document.getElementById('deliveryDate').value,
        "Σύνολο": document.getElementById('totalPrice').value + " €",
        "Προκαταβολή": document.getElementById('deposit').value + " €"
    };

    let htmlContent = "";
    for (let key in data) {
        htmlContent += `<p><strong>${key}:</strong> ${data[key]}</p>`;
    }
    document.getElementById('printContent').innerHTML = htmlContent;
    
    // Preview εικόνων αν υπάρχουν
    const preview = document.getElementById('imagePreview');
    document.getElementById('printImages').innerHTML = preview.innerHTML;

    window.print();
}

// Image Preview logic
document.getElementById('photoInput').addEventListener('change', function() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = "";
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});