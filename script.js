// --- ΗΜΕΡΟΛΟΓΙΟ ---
let calendar;
function openCalendar() {
    document.getElementById('calendarModal').style.display = "block";
    const calendarEl = document.getElementById('calendar');
    
    // Εδώ φτιάχνουμε τον τίτλο που θα φαίνεται στο ημερολόγιο
    const events = allOrders.map(o => ({ 
        id: o.id, 
        // Συνδυάζουμε Επώνυμο, Όνομα και Τηλέφωνο για τον τίτλο
        title: `${o.last_name} ${o.first_name} - 📞 ${o.phone}`, 
        start: o.delivery_date,
        backgroundColor: '#2a5a5a',
        borderColor: '#2a5a5a'
    }));

    if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'el',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            events: events,
            eventClick: (info) => {
                if (confirm(`Άνοιγμα παραγγελίας: ${info.event.title}\nΘέλετε να προχωρήσετε σε επεξεργασία;`)) {
                    window.location.href = `index.html?edit=${info.event.id}`;
                }
            }
        });
    } else {
        // Αν το ημερολόγιο υπάρχει ήδη, απλά ανανεώνουμε τα δεδομένα
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }
    calendar.render();
    
    // Μικρό fix για να εμφανίζεται σωστά το μέγεθος όταν ανοίγει το modal
    setTimeout(() => { calendar.updateSize(); }, 200);
}