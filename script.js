// ... οι μεταβλητές SUPABASE παραμένουν ίδιες ...

// --- ΔΙΑΓΡΑΦΗ ΠΑΡΑΓΓΕΛΙΑΣ ---
async function deleteOrder(id) {
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την παραγγελία; Η ενέργεια δεν αναιρείται.")) {
        const { error } = await _supabase.from('orders').delete().eq('id', id);
        if (error) {
            alert("Σφάλμα κατά τη διαγραφή: " + error.message);
        } else {
            alert("Η παραγγελία διαγράφηκε.");
            fetchOrders(); // Ανανέωση της λίστας
        }
    }
}

// --- ΗΜΕΡΟΛΟΓΙΟ ---
let calendar;

function openCalendar() {
    document.getElementById('calendarModal').style.display = "block";
    const calendarEl = document.getElementById('calendar');
    
    // Μετατροπή παραγγελιών σε format που καταλαβαίνει το ημερολόγιο
    const events = allOrders.map(order => ({
        id: order.id,
        title: `${order.last_name} (${order.location_type})`,
        start: order.delivery_date,
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
                right: 'dayGridMonth,timeGridWeek'
            },
            events: events,
            eventClick: function(info) {
                // Όταν πατάς μια παραγγελία στο ημερολόγιο, ανοίγει η επεξεργασία
                if (confirm("Θέλετε να ανοίξετε αυτή την παραγγελία για επεξεργασία;")) {
                    window.location.href = `index.html?edit=${info.event.id}`;
                }
            }
        });
    } else {
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }
    calendar.render();
}

function closeCalendar() {
    document.getElementById('calendarModal').style.display = "none";
}

// --- ΕΝΗΜΕΡΩΣΗ ΤΗΣ DISPLAY ORDERS (για το κουμπί διαγραφής) ---
function displayOrders(orders) {
    const list = document.getElementById('ordersList');
    if(!list) return;
    list.innerHTML = "";
    
    orders.forEach(order => {
        const dateParts = order.delivery_date.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        list.innerHTML += `
            <div class="order-card">
                <div class="card-info">
                    <strong>${order.last_name} ${order.first_name}</strong><br>
                    📅 ${formattedDate} | 📞 ${order.phone}
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="window.location.href='index.html?edit=${order.id}'" title="Επεξεργασία">📝</button>
                    <button class="btn-small" onclick="printOneOrder('${order.id}')" title="Εκτύπωση">🖨️</button>
                    <button class="btn-small btn-delete" onclick="deleteOrder('${order.id}')" title="Διαγραφή">🗑️</button>
                </div>
            </div>
        `;
    });
}

// ... οι υπόλοιπες συναρτήσεις (handleSave, fetchOrders, filterOrders, κλπ) παραμένουν ως είχαν ...