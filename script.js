// 1. Καθαρή Εκτύπωση μόνο του παραστατικού
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    // Καθαρίζουμε την περιοχή και βάζουμε το περιεχόμενο
    printArea.innerHTML = htmlContent;
    
    window.print();
    
    // Μετά την εκτύπωση, καθαρίζουμε για να μην φαίνεται στην οθόνη
    setTimeout(() => { printArea.innerHTML = ""; }, 500);
}

// 2. Εβδομαδιαία Λίστα με Ημέρες και Εικονίδιο
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

    let content = `<div style="text-align:center"><img src="banner.png" style="max-width:200px;"></div>`;
    content += `<h2 style="text-align:center">🖨️ Εβδομαδιαίο Πλάνο Παραγωγής</h2>`;
    
    const days = [...new Set(filtered.map(o => o.delivery_date))].sort();
    
    days.forEach(day => {
        const dObj = new Date(day);
        const dayName = dObj.toLocaleDateString('el-GR', { weekday: 'long' });
        const formattedDate = day.split('-').reverse().join('-');

        content += `<div style="border-bottom: 2px solid #333; margin-top:20px; padding-bottom:10px;">
            <h3 style="background:#eee; padding:5px;">📅 ${dayName.toUpperCase()} - ${formattedDate}</h3>`;
        
        filtered.filter(o => o.delivery_date === day).forEach(o => {
            content += `<p style="margin:10px 0;"><strong>• ${o.last_name} ${o.first_name}</strong>: ${o.description} <span style="float:right">📞 ${o.phone}</span></p>`;
        });
        content += `</div>`;
    });
    renderAndPrint(content);
}