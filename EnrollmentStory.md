## UniAct — Schedule Enrollment & Real-Time Subscription Flow

### Context

Two students share the same program (AI, ID: 1), academic level (4), and semester (ID: 3). Five schedule slots are available (IDs: 130–134).

---

### Enrollment Differences

| Student | Email | Enrolls In |
|---|---|---|
| Student 1 (youssef.kamal) | All 5 slots | 130, 131, 132, 133, 134 |
| Student 2 (layla.fouad) | 4 slots | 130, 132, 133, 134 |

Student 2 is blocked from slot **131 (Machine Learning)** because she hasn't passed its prerequisite — *Intro to AI*.

---

### The Flow (per student, executed in order)

**Step 1 — Fetch Schedule**
Frontend calls `GET /api/enrollment/:studentId`.
The server returns only the slots the student is enrolled in — prerequisite checks are already applied server-side.

- Student 1 receives: slots 130, 131, 132, 133, 134
- Student 2 receives: slots 130, 132, 133, 134

**Step 2 — Subscribe to WebSocket** *(before rendering)*
Before displaying anything, the frontend extracts the slot IDs from the response and opens a WebSocket connection, sending the student's JWT token for identity verification alongside the slot IDs to watch.

- Student 1 subscribes to: `[130, 131, 132, 133, 134]`
- Student 2 subscribes to: `[130, 132, 133, 134]`

The server registers each student as a listener on exactly their enrolled slots — nothing more.

**Step 3 — Render Schedule**
Only after the subscription is confirmed does the frontend render the schedule to the student. From this point, any backend change to a watched slot (seat count update, cancellation, room change, etc.) is pushed to the relevant subscriber in real time.

---

### Key Rules

- Subscription scope is derived from the enrollment response — the frontend never manually constructs slot lists.
- The JWT is passed to the WebSocket server so it can verify identity and reject unauthorized subscriptions.
- Student 2 will never receive real-time updates for slot 131, because she was never subscribed to it.
- Subscription must be established **before** the schedule is shown — no render before subscribe.