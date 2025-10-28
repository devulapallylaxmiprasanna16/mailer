const fileInput = document.getElementById('file-input');
const sendBtn = document.getElementById('send-btn');
const statusDiv = document.getElementById('status');
const tableBody = document.querySelector('#data-table tbody');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav-links');
const editBodyBtn = document.getElementById('edit-body-btn');
const editableBody = document.getElementById('editable-body');

let parsedData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Toggle mobile nav
hamburger.addEventListener('click', () => nav.classList.toggle('active'));

// Edit/Save body button
editBodyBtn.addEventListener('click', () => {
  const isEditing = editableBody.contentEditable === "true";
  if (isEditing) {
    editableBody.contentEditable = "false";
    editBodyBtn.textContent = "Edit Body";
    editableBody.style.background = "#f8fafc";
  } else {
    editableBody.contentEditable = "true";
    editBodyBtn.textContent = "Save Body";
    editableBody.style.background = "#e0f2fe";
  }
});

// Render paginated table
function renderTable() {
  tableBody.innerHTML = "";
  if (!parsedData.length) return;

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = parsedData.slice(start, end);

  pageData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.Name || ""}</td>
      <td>${row.Email || ""}</td>
      <td class="status">${row.status || "-"}</td>
    `;
    tableBody.appendChild(tr);
  });

  pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(parsedData.length / rowsPerPage)}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === Math.ceil(parsedData.length / rowsPerPage);
}

// Pagination buttons
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});
nextBtn.addEventListener('click', () => {
  if (currentPage < Math.ceil(parsedData.length / rowsPerPage)) {
    currentPage++;
    renderTable();
  }
});

// Parse Excel file
fileInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    parsedData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    currentPage = 1;
    renderTable();
    statusDiv.textContent = `✅ Parsed ${parsedData.length} rows. Showing 10 per page.`;
  };
  reader.readAsArrayBuffer(f);
});

// Send emails
sendBtn.addEventListener('click', async () => {
  if (!parsedData.length) {
    statusDiv.textContent = '⚠️ Please upload an Excel file first.';
    return;
  }

  const subject = document.getElementById('editable-subject').innerText.trim();
  const body = editableBody.innerText.trim();

  if (!subject || !body) {
    statusDiv.textContent = '⚠️ Please enter subject and body.';
    return;
  }

  sendBtn.disabled = true;
  statusDiv.textContent = '📨 Sending emails...';

  try {
    const response = await fetch('/send-mails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, data: parsedData })
    });

    const result = await response.json();
    result.results.forEach(r => {
      const item = parsedData.find(x => x.Email === r.Email);
      if (item) item.status = r.status === "sent" ? "✅ Sent" : "❌ Failed";
    });

    renderTable();
    statusDiv.textContent = `✅ Emails processed successfully. Table updated with status.`;
  } catch (err) {
    statusDiv.textContent = `❌ Error: ${err.message}`;
  } finally {
    sendBtn.disabled = false;
  }
});
