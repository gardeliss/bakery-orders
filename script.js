// Τοποθέτησε αυτά στην κορυφή του script.js
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co'; // Βάλε το δικό σου URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';      // Βάλε το δικό σου Anon Key

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Τώρα μπορείς να χρησιμοποιήσεις τη μεταβλητή _supabase για να στείλεις δεδομένα
function preparePrint() {
    // Λήψη τιμών από τη φόρμα
    const data = {
        "Ονοματεπώνυμο": document.getElementById('firstName').value + " " + document.getElementById('lastName').value,
        "Τηλέφωνο": document.getElementById('phone').value,
        "Email": document.getElementById('email').value,
        "Περιγραφή": document.getElementById('description').value,
        "Ημ. Παράδοσης": document.getElementById('deliveryDate').value,
        "Τοποθεσία": document.getElementById('locationType').value,
        "Διεύθυνση": document.getElementById('address').value,
        "Σύνολο": document.getElementById('totalPrice').value + " €",
        "Προκαταβολή": document.getElementById('deposit').value + " €",
        "Υπόλοιπο": (document.getElementById('totalPrice').value - document.getElementById('deposit').value).toFixed(2) + " €"
    };

    // Δημιουργία περιεχομένου για εκτύπωση
    let htmlContent = "";
    for (let key in data) {
        htmlContent += `<p><strong>${key}:</strong> ${data[key]}</p>`;
    }
    document.getElementById('printContent').innerHTML = htmlContent;

    // Μεταφορά εικόνων στο εκτυπωτικό
    const preview = document.getElementById('imagePreview');
    document.getElementById('printImages').innerHTML = preview.innerHTML;

    // Εντολή Εκτύπωσης
    window.print();
}

// Preview των εικόνων μόλις επιλεγούν
document.getElementById('photoInput').addEventListener('change', function() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = "";
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
});
