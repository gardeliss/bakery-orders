// 1. Εμφάνιση Ημέρας στην Εβδομαδιαία Λίστα
function printWeeklyList() {
    const startStr = prompt("Ημερομηνία έναρξης (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!startStr) return;

    const startDate = new Date(startStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const filtered = allOrders.filter(o => {
        const d = new Date(o.delivery_date);
        return d >= startDate && d < endDate;
    });

    let content = `<h2>Εβδομαδιαία Λίστα</h2>`;
    const days = [...new Set(filtered.map(o => o.delivery_date))].sort();
    
    days.forEach(day => {
        const dateObj = new Date(day);
        // Λήψη ονόματος ημέρας στα Ελληνικά
        const dayName = dateObj.toLocaleDateString('el-GR', { weekday: 'long' });
        const d = day.split('-');
        
        content += `<div style="border-bottom:1px solid #ccc; margin-top:20px;">
            <h3 style="text-transform: capitalize;">📅 ${dayName} ${d[2]}-${d[1]}-${d[0]}</h3>`;
        
        filtered.filter(o => o.delivery_date === day).forEach(o => {
            content += `<p><strong>${o.last_name} ${o.first_name}</strong>: ${o.description} (📞 ${o.phone})</p>`;
        });
        content += `</div>`;
    });
    renderAndPrint(content);
}

// 2. Καθαρή Εκτύπωση (Μόνο το παραστατικό, όχι την οθόνη)
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    // Προσθήκη του banner στην κορυφή της εκτύπωσης
    const bannerHtml = `<div style="text-align:center; margin-bottom:20px;">
        <img src="banner.png" style="max-width:250px;">
    </div>`;

    printArea.innerHTML = bannerHtml + htmlContent;
    window.print();
    
    // Καθαρισμός μετά την εκτύπωση για να μην μένει "σκουπίδι" στην οθόνη
    setTimeout(() => { printArea.innerHTML = ""; }, 500);
}