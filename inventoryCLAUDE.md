# Inventory & Shipments Manager — Claude Code Guide

## Project overview

Mobile-first web app for managing a small warehouse: tracking inventory stock, logging incoming/outgoing items, creating shipments to military units, and managing a contact list and document tracker.

Two users, equal access, no role separation required initially.

---

## Tech stack

- **Frontend**: React + Vite
- **UI**: Tailwind CSS (mobile-first, `sm:` breakpoints for desktop enhancement)
- **Backend/DB**: Firebase Firestore (NoSQL)
- **Auth**: Firebase Authentication (email/password, 2 users)
- **Storage**: Firebase Storage (item photos)
- **Hosting**: Firebase Hosting
- **Offline**: Firestore offline persistence enabled

```
firebase init → Firestore, Auth, Storage, Hosting
```

---

## Data model

Firestore collections mirror the schema below. Use `auto-id` for all document IDs unless noted.

### `categories`
```
name: string
```

### `subcategories`
```
name: string
categoryId: string  // ref → categories
```

### `item_models`
```
name: string
subcategoryId: string       // ref → subcategories
description: string
photoUrl: string            // Firebase Storage URL
currentStock: number        // DERIVED — do not write directly
                            // = sum(incoming transactions) - sum(outgoing transactions)
                            // Recompute on every transaction write via a helper function
```

### `inventory_transactions`
```
itemModelId: string         // ref → item_models
type: 'incoming' | 'outgoing'
quantity: number
date: timestamp
notes: string
shipmentId: string | null   // ref → shipments, set for outgoing tied to a shipment
```

### `units`
```
name: string                // e.g. "117 Brigade", "82 Brigade"
notes: string
```

### `people`
```
fullName: string
phone: string
unitId: string              // ref → units
```

### `addresses`
```
personId: string            // ref → people
label: string               // e.g. "HQ", "Base"
fullAddress: string
```

### `documents`
```
title: string
googleDocLink: string       // URL
type: 'Act' | 'Letter'
status: 'Preparing' | 'Sent to Unit' | 'Received from Unit'
notes: string
```

### `shipments`
```
createdDate: timestamp
trackingNumber: string
status: 'Preparing' | 'Take into packaging' | 'Sent' | 'Delivered'
unitId: string              // ref → units
personId: string            // ref → people (must belong to selected unit)
notes: string
```

### `shipment_items`
```
shipmentId: string          // ref → shipments
itemModelId: string         // ref → item_models
quantity: number
```

### `shipment_documents`
```
shipmentId: string          // ref → shipments
documentId: string          // ref → documents
```

### `related_shipments`
```
shipmentA: string           // ref → shipments
shipmentB: string           // ref → shipments
```

---

## Key business logic

### Stock calculation
`currentStock` on `item_models` is a derived value.
After every write to `inventory_transactions`, recalculate:

```js
async function recalculateStock(itemModelId) {
  const txns = await getDocs(
    query(collection(db, 'inventory_transactions'),
      where('itemModelId', '==', itemModelId))
  );
  let stock = 0;
  txns.forEach(doc => {
    const t = doc.data();
    stock += t.type === 'incoming' ? t.quantity : -t.quantity;
  });
  await updateDoc(doc(db, 'item_models', itemModelId), { currentStock: stock });
}
```

### Person dropdown filtered by unit
When creating/editing a shipment, only show people whose `unitId` matches the selected unit.

### Shipment contents preview
For the shipments list, fetch `shipment_items` for each shipment and join item names for a one-line summary. Cache aggressively — this is a read-heavy view.

---

## Views / screens

| Route | Screen | Notes |
|---|---|---|
| `/` | Warehouse | Gallery of item_models grouped by category › subcategory, shows photo + stock |
| `/incoming` | Log incoming stock | Form: item_model, qty, date, notes |
| `/shipments` | Shipments list | Sorted by date desc, filterable by unit, contents preview |
| `/shipments/new` | Create shipment | Form + inline item picker + doc picker |
| `/shipments/:id` | Shipment detail | Full detail, edit status, related shipments |
| `/categories` | Category manager | CRUD: categories › subcategories › item_models |
| `/contacts` | Contacts | Units › People › Addresses |
| `/documents` | Documents | List with type/status filter |

---

## Mobile-first UI rules

- Base styles target 390px (iPhone 14) — no `sm:` prefix on base layout
- Bottom navigation bar for main sections (Warehouse, Shipments, Contacts, Docs)
- Touch targets minimum 44px height
- Forms use full-width inputs with large tap areas
- Lists use card-style rows with swipe-to-action for edit/delete where possible
- Images lazy-loaded, compressed before upload (use `browser-image-compression` before Storage upload)
- Status badges: color-coded chips (Preparing=gray, Sent=blue, Delivered=green)

---

## Firebase setup notes

```js
// firestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch(console.warn);

export { db };
```

### Firestore indexes required (create in console or `firestore.indexes.json`)
- `inventory_transactions`: composite index on `itemModelId` + `type`
- `shipments`: composite index on `unitId` + `createdDate` (desc)
- `people`: index on `unitId`
- `shipment_items`: index on `shipmentId`
- `shipment_documents`: index on `shipmentId`

### Storage rules
Photos uploaded to `item_photos/{itemModelId}`. Only authenticated users can read/write.

### Security rules baseline
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Tighten per-collection once auth is confirmed working.

---

## Project structure

```
src/
  components/        # Shared UI components
  pages/             # One file per route
  hooks/             # useInventory, useShipments, useContacts etc.
  firebase/          # db.js, storage.js, auth.js
  utils/             # recalculateStock, formatDate, etc.
```

---

## Out of scope (v1)

- User role separation
- Push notifications
- Shipment status automation (e.g. auto-marking inventory as Sent)
- PDF/act generation
- Multi-language UI
