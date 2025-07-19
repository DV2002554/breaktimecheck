document.addEventListener('DOMContentLoaded', () => {
    const staffSelect = document.getElementById('staffSelect');
    const checkInBtn = document.getElementById('checkInBtn');
    const breakBtn = document.getElementById('breakBtn');
    const endBreakBtn = document.getElementById('endBreakBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const statusMessage = document.getElementById('statusMessage');
    const logTableBody = document.querySelector('#logTable tbody');

    let staffList = []; // To store staff names and IDs
    let currentStaffStatus = {}; // Tracks the current state of each staff member

    // --- Utility Functions ---
    async function fetchData(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }

    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? '#F44336' : '#2196F3'; // Use CSS variables for consistency
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 5000); // Clear message after 5 seconds
    }

    // --- Populate Staff Dropdown ---
    async function populateStaffSelect() {
        try {
            staffList = await fetchData('/staff');
            staffSelect.innerHTML = '<option value="">-- Select Staff Member --</option>'; // Clear existing options
            staffList.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id;
                option.textContent = staff.name;
                staffSelect.appendChild(option);
            });
        } catch (error) {
            showStatus(`Error loading staff: ${error.message}`, true);
        }
    }

    // --- Update Button States based on Staff Status (Simplified) ---
    // In a real app, you'd fetch the actual status from the backend.
    // Here, we simulate it based on actions.
    function updateButtonStates(staffId) {
        const status = currentStaffStatus[staffId] || { checkIn: false, break: false };

        checkInBtn.disabled = status.checkIn;
        breakBtn.disabled = !status.checkIn || status.break;
        endBreakBtn.disabled = !status.checkIn || !status.break; // Can only end break if on break
        checkOutBtn.disabled = !status.checkIn || status.break; // Can't check out on break
    }

    // --- Handle Attendance Actions ---
    async function handleAttendanceAction(action) {
        const staffId = staffSelect.value;
        const staffName = staffSelect.options[staffSelect.selectedIndex].textContent;

        if (!staffId) {
            showStatus('Please select a staff member first.', true);
            return;
        }

        try {
            const response = await fetchData('/attend', 'POST', { staff_id: staffId, action: action });
            showStatus(`${staffName} - ${action.replace('_', ' ')} recorded at ${new Date(response.timestamp).toLocaleTimeString()}`);

            // Update local status for button control
            if (!currentStaffStatus[staffId]) {
                currentStaffStatus[staffId] = {};
            }
            if (action === 'check_in') {
                currentStaffStatus[staffId].checkIn = true;
            } else if (action === 'break_start') {
                currentStaffStatus[staffId].break = true;
            } else if (action === 'break_end') {
                currentStaffStatus[staffId].break = false;
            } else if (action === 'check_out') {
                currentStaffStatus[staffId].checkIn = false;
                currentStaffStatus[staffId].break = false; // Ensure break status is reset
            }
            updateButtonStates(staffId);
            fetchStaffLog(); // Refresh log after action
        } catch (error) {
            showStatus(`Error: ${error.message}`, true);
        }
    }

    // --- Fetch and Display Staff Log ---
    async function fetchStaffLog() {
        try {
            const logEntries = await fetchData('/staff_log');
            logTableBody.innerHTML = ''; // Clear existing log
            logEntries.forEach(entry => {
                const row = logTableBody.insertRow();
                row.insertCell().textContent = entry.name;
                row.insertCell().textContent = entry.action.replace('_', ' '); // Make it more readable
                row.insertCell().textContent = new Date(entry.timestamp).toLocaleString();
            });
        } catch (error) {
            showStatus(`Error loading log: ${error.message}`, true);
        }
    }

    // --- Event Listeners ---
    staffSelect.addEventListener('change', () => {
        const selectedStaffId = staffSelect.value;
        updateButtonStates(selectedStaffId);
        showStatus(''); // Clear any previous status messages
    });

    checkInBtn.addEventListener('click', () => handleAttendanceAction('check_in'));
    breakBtn.addEventListener('click', () => handleAttendanceAction('break_start'));
    endBreakBtn.addEventListener('click', () => handleAttendanceAction('break_end'));
    checkOutBtn.addEventListener('click', () => handleAttendanceAction('check_out'));

    // Initial load
    populateStaffSelect();
    fetchStaffLog();
});