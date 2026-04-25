const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function saveOrder() {
    // 1. Λήψη στοιχείων από το HTML
    // ΠΡΟΣΟΧΗ: Τα IDs μέσα στο getElementById πρέπει να υπάρχουν στο index.html
    const fName = document.getElementById('firstName').value;
    const lName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const desc = document.getElementById('description').value;
    const dDate = document.getElementById('deliveryDate').value;

    // Απλό validation
    if (!fName || !lName || !phone || !desc || !dDate) {
        alert("Παρακαλώ συμπληρώστε τα βασικά πεδία (Όνομα, Επώνυμο, Τηλέφωνο, Περιγραφή, Ημερομηνία)");
        return;
    }

    // 2. Προετοιμασία αντικειμένου για το Supabase
    // Τα κλειδιά (αριστερά) πρέπει να είναι ΙΔΙΑ με τα ονόματα των στηλών στην SQL
    const orderData = {
        first_name: fName,
        last_name: lName,
        phone: phone,
        email: document.getElementById('email').value || null,
        description: desc,
        delivery_date: dDate,
        location_type: document.getElementById('locationType').value,
        address: document.getElementById('address').value || null,
        total_price: parseFloat(document.getElementById('totalPrice').value) || 0,
        deposit: parseFloat(document.getElementById('deposit').value) || 0
    };

    console.log("Προσπάθεια αποστολής:", orderData);

    try {
        const { data, error } = await _supabase
            .from('orders')
            .insert([orderData])
            .select(); // Ζητάμε πίσω τα δεδομένα για επιβεβαίωση

        if (error) throw error;

        console.log("Η εγγραφή έγινε επιτυχώς:", data);
        alert("Η παραγγελία καταχωρήθηκε στη βάση!");
        
        // Μόνο αν πετύχει η βάση, προχωράμε στην εκτύπωση
        preparePrint();

    } catch (err) {
        console.error("Σφάλμα κατά την αποθήκευση:", err);
        alert("Αποτυχία σύνδεσης με τη βάση: " + err.message);
    }
}