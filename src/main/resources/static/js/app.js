// BloodLink BBMS Application Script

// State Management
let currentUser = null;
try {
  const saved = localStorage.getItem('bloodlink_user');
  if (saved) currentUser = JSON.parse(saved);
} catch (e) { currentUser = null; }

// Static Fallback Data
const fallbackInventory = [
  { group: "A+", units: 128, status: "Available", level: "good", width: "78%" },
  { group: "A−", units: 42, status: "Low stock", level: "low", width: "34%" },
  { group: "B+", units: 96, status: "Available", level: "good", width: "62%" },
  { group: "B−", units: 18, status: "Low stock", level: "low", width: "18%" },
  { group: "AB+", units: 64, status: "Available", level: "good", width: "48%" },
  { group: "AB−", units: 27, status: "Low stock", level: "low", width: "24%" },
  { group: "O+", units: 183, status: "Available", level: "good", width: "90%" },
  { group: "O−", units: 8, status: "Critical", level: "critical", width: "8%" }
];

const fallbackCamps = [
  { name: "Community Care Blood Drive", location: "Central City Hospital", date: "18 SEP 2026", seats: "36 seats left" },
  { name: "Northside Medical Donation Drive", location: "Northside Medical Center", date: "24 SEP 2026", seats: "84 seats left" },
  { name: "University Youth Health Drive", location: "Central Campus Quad", date: "02 OCT 2026", seats: "120 seats left" }
];

// Helper Functions
function getStockStatus(units) {
  if (units <= 10) return { label: "Critical", level: "critical" };
  if (units <= 50) return { label: "Low stock", level: "low" };
  return { label: "Available", level: "good" };
}

// UI Initialization
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  renderHeaderUser();
  loadInventory();
  loadCamps();
  loadRequests();
  initFormSubmissions();
  initDashboardTabs();
  initDemoLogins();
});

// Header & Navigation
function initNav() {
  const nav = document.querySelector(".main-nav");
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  // Modals backdrop triggers
  document.querySelectorAll("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.modal;
      const modal = document.querySelector(`#${modalId}`);
      if (modal) {
        modal.classList.add("open");
        if (modalId === "dashboard-modal") renderDashboard();
      }
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", e => {
      if (e.target === backdrop || e.target.classList.contains("modal-close")) {
        backdrop.classList.remove("open");
      }
    });
  });

  document.querySelector("#logout-btn")?.addEventListener("click", logoutUser);
}

function renderHeaderUser() {
  const authNavBtn = document.querySelector("#auth-nav-btn");
  const userNavBadge = document.querySelector("#user-nav-badge");
  const navUserRole = document.querySelector("#nav-user-role");
  const navUserName = document.querySelector("#nav-user-name");

  if (currentUser) {
    if (authNavBtn) authNavBtn.classList.add("hidden");
    if (userNavBadge) userNavBadge.classList.remove("hidden");
    if (navUserRole) {
      navUserRole.textContent = currentUser.role || "DONOR";
      navUserRole.className = `user-role-badge ${currentUser.role || 'DONOR'}`;
    }
    if (navUserName) navUserName.textContent = currentUser.fullName || currentUser.email;

    // Prefill forms if user is logged in
    const appDonorName = document.querySelector("#app-donor-name");
    const appDonorEmail = document.querySelector("#app-donor-email");
    if (appDonorName) appDonorName.value = currentUser.fullName || "";
    if (appDonorEmail) appDonorEmail.value = currentUser.email || "";

    const reqHospitalName = document.querySelector("#req-hospital-name");
    if (reqHospitalName && currentUser.role === "HOSPITAL") {
      reqHospitalName.value = currentUser.fullName || "Medicare Hospital";
    }
  } else {
    if (authNavBtn) authNavBtn.classList.remove("hidden");
    if (userNavBadge) userNavBadge.classList.add("hidden");
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('bloodlink_user');
  renderHeaderUser();
  alert("Logged out successfully.");
}

// 1-Click Demo Login Handling
function initDemoLogins() {
  document.querySelectorAll(".demo-login-trigger").forEach(btn => {
    btn.addEventListener("click", async () => {
      const type = btn.dataset.demo;
      let email = "", password = "";
      if (type === "admin") { email = "admin@bloodlink.org"; password = "admin123"; }
      else if (type === "hospital") { email = "hospital@citymed.org"; password = "hospital123"; }
      else if (type === "donor") { email = "donor@gmail.com"; password = "donor123"; }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        currentUser = await res.json();
        localStorage.setItem('bloodlink_user', JSON.stringify(currentUser));
        renderHeaderUser();
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
        
        // Open dashboard modal automatically on demo login
        const dashModal = document.querySelector("#dashboard-modal");
        if (dashModal) {
          dashModal.classList.add("open");
          renderDashboard();
        }
      } else {
        alert("Demo login error. Make sure server is running.");
      }
    });
  });
}

// Inventory Rendering
async function loadInventory() {
  const grid = document.querySelector("#inventory-grid");
  let items = fallbackInventory;
  
  try {
    const res = await fetch("/api/blood-inventory");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        items = data.map(item => {
          const st = getStockStatus(item.quantity);
          return {
            group: item.bloodGroup,
            units: item.quantity,
            status: st.label,
            level: st.level,
            width: `${Math.min(100, Math.max(5, (item.quantity / 200) * 100))}%`
          };
        });
      }
    }
  } catch (e) {}

  if (grid) {
    grid.innerHTML = items.map(item => `
      <article class="blood-card">
        <div class="group">${item.group}</div>
        <div class="units"><strong>${item.units}</strong> units available</div>
        <div class="status ${item.level}">${item.status}</div>
        <div class="bar"><i class="${item.level}" style="width:${item.width}"></i></div>
      </article>
    `).join("");
  }

  // Update Urgent Alert Banner
  const criticalItems = items.filter(i => i.level === "critical" || i.units <= 15);
  const urgentBannerMsg = document.querySelector("#urgent-banner-msg");
  if (urgentBannerMsg && criticalItems.length) {
    const groups = criticalItems.map(i => i.group).join(", ");
    urgentBannerMsg.textContent = `${groups} Blood Stock critical (< 15 units)! Emergency donor response required.`;
  }
}

// Camps Rendering
async function loadCamps() {
  const container = document.querySelector("#camps-list-container");
  if (!container) return;

  let camps = fallbackCamps;
  try {
    const res = await fetch("/api/camps");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        camps = data.map(c => ({
          name: c.name,
          location: c.location,
          date: c.eventDate ? c.eventDate : "Upcoming",
          seats: "Seats open"
        }));
      }
    }
  } catch (e) {}

  container.innerHTML = camps.map((camp, idx) => `
    <article class="camp-card ${idx === 1 ? 'featured' : ''}">
      <div class="camp-date"><b>${idx + 15}</b><span>SEP<br>2026</span></div>
      <div>
        <span class="tag">OPEN FOR REGISTRATION</span>
        <h3>${camp.name}</h3>
        <p>${camp.location} · 09:00 AM – 04:00 PM</p>
        <div class="camp-foot">
          <span>${camp.seats}</span>
          <button class="arrow-button" data-modal="appointment-modal">→</button>
        </div>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-modal]").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelector("#appointment-modal")?.classList.add("open");
    });
  });
}

// Requests Rendering
async function loadRequests() {
  const urgentContainer = document.querySelector("#urgent-types-container");
  if (!urgentContainer) return;

  try {
    const res = await fetch("/api/requests");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const pending = data.filter(r => r.status === "PENDING" || !r.status);
        if (pending.length) {
          urgentContainer.innerHTML = pending.slice(0, 3).map(r => `
            <div>
              <strong>${r.bloodGroup}</strong>
              <span>${r.units} units (${r.hospital || 'Urgent'})</span>
            </div>
          `).join("");
          return;
        }
      }
    }
  } catch (e) {}

  urgentContainer.innerHTML = `
    <div><strong>O−</strong><span>3 requests</span></div>
    <div><strong>B+</strong><span>2 requests</span></div>
    <div><strong>A−</strong><span>1 request</span></div>
  `;
}

// Forms Submission Setup
function initFormSubmissions() {
  // Login Form
  document.querySelector("#login-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector(".form-message");
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        currentUser = await res.json();
        localStorage.setItem('bloodlink_user', JSON.stringify(currentUser));
        renderHeaderUser();
        msg.textContent = `Welcome back, ${currentUser.fullName}!`;
        setTimeout(() => {
          document.querySelector("#login-modal").classList.remove("open");
          form.reset();
          msg.textContent = "";
        }, 800);
      } else {
        const err = await res.json();
        msg.textContent = err.message || "Invalid credentials.";
      }
    } catch (err) {
      msg.textContent = "Server connection error.";
    }
  });

  // Donor Registration Form
  document.querySelector("#donor-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector(".form-message");
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/auth/register/donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        currentUser = await res.json();
        localStorage.setItem('bloodlink_user', JSON.stringify(currentUser));
        renderHeaderUser();
        msg.textContent = "Donor profile created successfully!";
        setTimeout(() => {
          document.querySelector("#donor-modal").classList.remove("open");
          form.reset();
          msg.textContent = "";
        }, 1000);
      } else {
        const err = await res.json();
        msg.textContent = err.message || "Registration failed.";
      }
    } catch (err) {
      msg.textContent = "Server connection error.";
    }
  });

  // Appointment Form
  document.querySelector("#appointment-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector(".form-message");
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        msg.textContent = "Appointment booked successfully!";
        setTimeout(() => {
          document.querySelector("#appointment-modal").classList.remove("open");
          form.reset();
          msg.textContent = "";
          renderDashboard();
        }, 1000);
      } else {
        msg.textContent = "Failed to book appointment.";
      }
    } catch (err) {
      msg.textContent = "Server error.";
    }
  });

  // Hospital Blood Request Form
  document.querySelector("#request-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector(".form-message");
    const data = Object.fromEntries(new FormData(form));
    data.units = parseInt(data.units) || 1;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        msg.textContent = "Emergency blood request posted successfully!";
        loadRequests();
        setTimeout(() => {
          document.querySelector("#request-modal").classList.remove("open");
          form.reset();
          msg.textContent = "";
          renderDashboard();
        }, 1000);
      } else {
        msg.textContent = "Failed to submit blood request.";
      }
    } catch (err) {
      msg.textContent = "Server error.";
    }
  });
}

// Dashboard Tabs & Multi-Role Record Management
function initDashboardTabs() {
  document.querySelectorAll(".dash-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".dash-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const paneId = tab.dataset.tab;
      document.querySelector(`#${paneId}`)?.classList.add("active");
    });
  });
}

async function renderDashboard() {
  const dashUserTitle = document.querySelector("#dash-user-title");
  const dashRoleSub = document.querySelector("#dash-role-subtitle");
  const dashUserChip = document.querySelector("#dash-user-chip");

  const role = currentUser ? (currentUser.role || "DONOR") : "GUEST (ADMIN PREVIEW)";
  const name = currentUser ? currentUser.fullName : "Demo User";

  if (dashUserTitle) dashUserTitle.textContent = `${name}'s Portal`;
  if (dashRoleSub) dashRoleSub.textContent = `${role} CONTROL CENTER`;
  if (dashUserChip) dashUserChip.textContent = `Role: ${role}`;

  renderDashboardInventory();
  renderDashboardRequests();
  renderDashboardDonors();
  renderDashboardAppointments();
}

// Render Inventory Table in Dashboard
async function renderDashboardInventory() {
  const tbody = document.querySelector("#dash-inventory-table");
  if (!tbody) return;

  try {
    const res = await fetch("/api/blood-inventory");
    if (res.ok) {
      const items = await res.json();
      tbody.innerHTML = items.map(item => {
        const isAdmin = !currentUser || currentUser.role === "ADMIN";
        const st = getStockStatus(item.quantity);
        return `
          <tr>
            <td><strong>${item.bloodGroup}</strong></td>
            <td>
              ${isAdmin ? `<input type="number" id="stock-input-${item.bloodGroup}" value="${item.quantity}" min="0">` : `<span>${item.quantity}</span>`}
            </td>
            <td><span class="badge-status ${st.level === 'good' ? 'APPROVED' : st.level === 'low' ? 'PENDING' : 'REJECTED'}">${st.label}</span></td>
            <td>
              ${isAdmin ? `<button class="button button-sm button-primary" onclick="saveInventoryStock('${item.bloodGroup}')">Save Stock</button>` : `<span class="muted">View Only</span>`}
            </td>
          </tr>
        `;
      }).join("");
    }
  } catch (e) {}
}

async function saveInventoryStock(bloodGroup) {
  const input = document.querySelector(`#stock-input-${bloodGroup}`);
  if (!input) return;
  const quantity = parseInt(input.value) || 0;

  try {
    const res = await fetch(`/api/blood-inventory/${bloodGroup}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloodGroup, quantity })
    });
    if (res.ok) {
      alert(`Updated ${bloodGroup} quantity to ${quantity} units.`);
      loadInventory();
      renderDashboardInventory();
    } else {
      alert("Failed to update stock.");
    }
  } catch (e) {
    alert("Server error.");
  }
}

// Render Requests Table in Dashboard
async function renderDashboardRequests() {
  const tbody = document.querySelector("#dash-requests-table");
  if (!tbody) return;

  try {
    const res = await fetch("/api/requests");
    if (res.ok) {
      const requests = await res.json();
      tbody.innerHTML = requests.map(req => {
        const isAdmin = !currentUser || currentUser.role === "ADMIN";
        const status = req.status || "PENDING";
        return `
          <tr>
            <td>#${req.id}</td>
            <td><strong>${req.hospital}</strong></td>
            <td>${req.patientName}</td>
            <td><strong>${req.bloodGroup}</strong></td>
            <td>${req.units}</td>
            <td><span class="badge-status ${status}">${status}</span></td>
            <td>
              ${isAdmin && status === "PENDING" ? `
                <button class="button button-sm button-primary" onclick="updateRequestStatus(${req.id}, 'APPROVED')">Approve</button>
                <button class="button button-sm button-outline" onclick="updateRequestStatus(${req.id}, 'REJECTED')">Reject</button>
              ` : `<span class="muted">No action</span>`}
            </td>
          </tr>
        `;
      }).join("");
    }
  } catch (e) {}
}

async function updateRequestStatus(id, status) {
  try {
    const res = await fetch(`/api/requests/${id}/status?value=${status}`, { method: "PATCH" });
    if (res.ok) {
      renderDashboardRequests();
      loadRequests();
    } else {
      alert("Failed to update request status.");
    }
  } catch (e) {
    alert("Server error.");
  }
}

// Render Donors Directory Table in Dashboard
async function renderDashboardDonors() {
  const tbody = document.querySelector("#dash-donors-table");
  if (!tbody) return;

  try {
    const res = await fetch("/api/users/donors");
    if (res.ok) {
      const donors = await res.json();
      tbody.innerHTML = donors.map(d => `
        <tr>
          <td><strong>${d.fullName}</strong></td>
          <td>${d.email}</td>
          <td><span class="badge-status BOOKED">${d.bloodGroup}</span></td>
          <td>${d.role}</td>
        </tr>
      `).join("");
    }
  } catch (e) {}
}

// Render Appointments Table in Dashboard
async function renderDashboardAppointments() {
  const tbody = document.querySelector("#dash-appointments-table");
  if (!tbody) return;

  let url = "/api/appointments";
  if (currentUser && currentUser.role === "DONOR") {
    url = `/api/appointments?email=${encodeURIComponent(currentUser.email)}`;
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      const appointments = await res.json();
      tbody.innerHTML = appointments.map(app => `
        <tr>
          <td>#${app.id}</td>
          <td><strong>${app.donorName}</strong></td>
          <td>${app.email}</td>
          <td>${app.location}</td>
          <td>${app.appointmentTime ? app.appointmentTime.replace('T', ' ') : 'Upcoming'}</td>
          <td><span class="badge-status ${app.status || 'BOOKED'}">${app.status || 'BOOKED'}</span></td>
        </tr>
      `).join("");
    }
  } catch (e) {}
}
