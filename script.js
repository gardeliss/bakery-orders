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