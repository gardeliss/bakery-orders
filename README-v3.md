# 🍰 Ζαχαροπλαστείο "Ζάχαρη" - Sistema v3.0

## 📋 Πλήρης Οδηγός Εγκατάστασης & Χρήσης

---

## 🎯 Τι Άλλαξε στο v3.0

### ✨ Νέες Λειτουργίες

#### 1. **Σύστημα Ανεβάσματος Εικόνων**
- 📸 Upload JPEG/PNG (max 5MB)
- 🖼️ Lightbox preview
- 🖨️ Thumbnails στην εκτύπωση

#### 2. **Email Auto-Sync**
- ✉️ Προαιρετικό πεδίο email στις παραγγελίες
- 🔄 Αυτόματη ενημέρωση πελατολογίου

#### 3. **CSV Export με UTF-8 BOM**
- ✅ Σωστή εμφάνιση ελληνικών χαρακτήρων
- 📥 Export από Activity Log

#### 4. **Default Filters**
- 🔍 Προεπιλογή: "Ενεργές" (εξαιρεί completed)
- ⚡ Γρηγορότερη πρόσβαση

#### 5. **Compact UI**
- 📏 20% μικρότερα paddings
- 📊 Περισσότερες πληροφορίες ανά οθόνη

#### 6. **Flatpickr Date Picker**
- 📅 Modern date picker
- 🇬🇷 Ελληνική γλώσσα
- 📍 Dot indicators στο calendar

#### 7. **Username-Based Login**
- 👤 Login με username (όχι email)
- 🔐 Password visibility toggle

---

## 🎨 UI/UX Αλλαγές

### **Desktop**
- 🏆 **Horizontal Ribbon Dashboard** - 6 stats σε μία σειρά
- 🎯 **Center-aligned Banner** - Κεντραρισμένο logo
- 🧭 **Sub-header Navigation** - Navbar κάτω από το banner
- 🖼️ **Logo-only Branding** - Χωρίς κείμενο "Ζάχαρη"

### **Mobile**
- 📱 **Bottom Navigation** - 5 items (Home, Orders, Customers, Calendar, More)
- ➕ **FAB Button** - Floating για νέα παραγγελία
- 👤 **Top-right User Icon** - Για profile/logout
- 📊 **3-Column Stats Grid** - Compact dashboard
- 🗂️ **Responsive Cards** - Tables → Cards σε mobile
- 📅 **Agenda View Calendar** - Custom implementation με Flatpickr

---

## 🚀 Εγκατάσταση

### **Βήμα 1: Supabase Setup**

#### A. Τρέξε το Migration Script
```sql
-- Ανοιξε το Supabase Dashboard → SQL Editor
-- Copy-paste το περιεχόμενο του v3-migration.sql
-- Πάτα RUN
```

#### B. Δημιούργησε Storage Bucket
1. Πήγαινε στο **Storage** → **New Bucket**
2. Όνομα: `order-images`
3. Public: ✅ **true**
4. File size limit: `5MB`
5. Allowed MIME types: `image/jpeg, image/png`

#### C. Storage Policy
1. Πήγαινε στο bucket `order-images` → **Policies**
2. **New Policy**:
   - Name: "Public Access"
   - Operation: SELECT
   - Target roles: `anon`, `authenticated`
   - Policy: `true`

---

### **Βήμα 2: GitHub Upload**

#### Αρχεία που πρέπει να ανεβάσεις:

```
bakery-orders/
├── index.html (μετονόμασε το v3-index.html)
├── dashboard.html (v3-dashboard.html)
├── order-form.html (v3-order-form.html)
├── orders-list.html (v3-orders-list.html)
├── calendar.html (v3-calendar.html)
├── customers.html (v3-customers.html)
├── customer-profile.html (v3-customer-profile.html)
├── activity-log.html (v3-activity-log.html)
├── backup.html (v3-backup.html)
├── users.html (v3-users.html)
├── app.js (v3-app.js)
├── modern-style.css (v3-modern-style.css)
└── banner.png (το υπάρχον)
```

**ΣΗΜΑΝΤΙΚΟ:** Μετονόμασε όλα τα `v3-*.html` αφαιρώντας το `v3-`

---

### **Βήμα 3: Demo Users**

Μετά το migration, έχεις:
- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

---

## 📖 Οδηγίες Χρήσης

### **1. File Upload**

#### Πώς να ανεβάσεις εικόνες:
1. Άνοιξε **Order Form**
2. Scroll στο "Φωτογραφίες"
3. Επίλεξε έως 5 αρχεία (JPEG/PNG, max 5MB)
4. Preview εμφανίζεται αμέσως
5. Αποθήκευσε την παραγγελία

#### Πώς να δεις τις εικόνες:
- **Lightbox**: Κλικ στο thumbnail
- **Εκτύπωση**: Thumbnails 4x4 grid

---

### **2. Email Auto-Sync**

#### Πώς δουλεύει:
1. Γράψε email στην παραγγελία
2. Αποθήκευσε
3. Το email συγχρονίζεται αυτόματα στο πελατολόγιο

---

### **3. CSV Export**

#### Για Activity Log:
1. **Activity Log** → **Export CSV**
2. Το αρχείο ανοίγει σωστά στο Excel με ελληνικούς χαρακτήρες

---

### **4. Default Filters**

#### Orders List:
- Προεπιλογή: **"Ενεργές"** (Pending + Confirmed)
- Για όλες: Άλλαξε σε **"Όλες"**

---

### **5. Mobile Navigation**

#### Bottom Nav (5 items):
- 🏠 **Home** → Dashboard
- 📋 **Παραγγελίες** → Orders List
- 👥 **Πελάτες** → Customers
- 📅 **Ημερολόγιο** → Calendar
- ⋮ **Άλλα** → Overflow menu (Activity Log, Backup, Users)

#### FAB Button:
- ➕ **Floating Button** → Νέα Παραγγελία

#### User Menu:
- 👤 **Top-right Icon** → Profile, Logout

---

### **6. Calendar Agenda View**

#### Πώς να το χρησιμοποιήσεις:
1. Επίλεξε ημερομηνία από το calendar
2. Οι παραγγελίες εμφανίζονται δεξιά
3. Dots στις ημερομηνίες δείχνουν παραγγελίες

#### Print Options:
- 🖨️ **Εβδομαδιαία Λίστα** - Grouped by day
- 🖨️ **Πίνακας** - Weekly table
- 🖨️ **Μηνιαίος** - Monthly table

---

## 🛠️ Troubleshooting

### **Πρόβλημα: File upload δεν δουλεύει**
✅ **Λύση:**
1. Έλεγξε το Storage bucket: `order-images`
2. Βεβαιώσου ότι είναι public
3. Έλεγξε το storage policy

---

### **Πρόβλημα: Ελληνικοί χαρακτήρες στο CSV**
✅ **Λύση:**
- Το v3.0 χρησιμοποιεί UTF-8 BOM
- Ανοίξτε το Excel και θα εμφανιστούν σωστά

---

### **Πρόβλημα: Bottom nav δεν φαίνεται**
✅ **Λύση:**
- Bottom nav είναι **μόνο για mobile** (< 768px)
- Desktop δείχνει το navbar

---

### **Πρόβλημα: Login με νέο χρήστη δεν δουλεύει**
✅ **Λύση:**
- Έλεγξε ότι έτρεξες το **v3-migration.sql**
- Οι χρήστες πρέπει να έχουν το πεδίο `username`

---

## 📊 Τεχνικά Στοιχεία

### **Dependencies:**
- Supabase JS v2
- Flatpickr (date picker)
- Flatpickr Greek locale

### **Browser Support:**
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

### **File Structure:**
```
CSS:
- v3-modern-style.css (Mobile-first, compact)

JavaScript:
- v3-app.js (Auth, File Upload, Navigation)

HTML Pages:
- v3-index.html (Login)
- v3-dashboard.html (Horizontal ribbon)
- v3-order-form.html (File upload, Flatpickr)
- v3-orders-list.html (Default filter)
- v3-calendar.html (Agenda view)
- v3-customers.html (Responsive cards)
- v3-customer-profile.html
- v3-activity-log.html (CSV UTF-8 BOM)
- v3-backup.html
- v3-users.html (Username-based)

SQL:
- v3-migration.sql (Database changes)
```

---

## 🎓 Tips & Best Practices

### **1. Backup Strategy**
- 💾 **Εβδομαδιαία backups** στη βάση
- 📥 **Μηνιαία downloads** σε τοπικό PC

### **2. User Management**
- 🔒 Δώσε **user** role για υπαλλήλους
- 👑 Κράτα **admin** role μόνο για εσένα

### **3. File Upload**
- 📸 Ανέβαζε max **3-4 εικόνες** ανά παραγγελία
- 🗜️ Compress εικόνες πριν το upload για ταχύτητα

### **4. Mobile Experience**
- 📱 Χρησιμοποίησε το **FAB** για γρήγορη πρόσβαση
- 📊 Dashboard σε 3 columns = faster overview

---

## 🆘 Support

### **Για βοήθεια:**
1. Έλεγξε το **Troubleshooting** section
2. Έλεγξε το **Supabase Dashboard** → Logs
3. Άνοιξε το **Browser Console** (F12) για errors

---

## 📝 Changelog

### **v3.0 (2025-05-02)**
- ✨ File upload system
- ✉️ Email auto-sync
- 📥 CSV UTF-8 BOM export
- 🔍 Default filters (exclude completed)
- 📏 Compact UI (20% less padding)
- 📅 Flatpickr date picker
- 👤 Username-based authentication
- 🎨 Desktop: Horizontal ribbon + centered logo
- 📱 Mobile: Bottom nav + FAB + Agenda calendar
- 🗂️ Responsive cards for tables

---

## 🎉 Ευχαριστούμε που χρησιμοποιείτε το Ζάχαρη v3.0!

**Καλή δουλειά!** 🍰
