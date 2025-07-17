document.addEventListener('DOMContentLoaded', () => {
    // Predefined employee names
    const predefinedEmployeeNames = [
        "MAO SIENGMENG", "JANELSO VINAITUONG", "PHENG AN", "ROBERT IBANEZ",
        "CHHET DEVITH", "LY CHHIN THEAN", "DOUNG CHANNNUOM", "NUOM POV PICH",
        "SIEM SAM NOEUN", "SOKA MANETH", "RIEM LINA", "SOR SIEVLY",
        "YOEURN NITA", "Seang Eang", "Roeurn Mab", "Khemara Davit",
        "KONG SREYPICH", "HUN RAVIN", "Suon Bunna", "Cheen Dara",
        "Mary Joy M. Ochinang", "Ericka Bheth B Cabral", "Allan S.Esteves",
        "Emil Esteves", "JESSA MEI PAGALAK", "Karen Patricia M.Godin",
        "Phoebe J.Tamot", "Raymond Ochinang", "Nan Sean Err", "LIV PHEAKDEY",
        "ART NEARDEY", "SENG CHHAY", "FOUYAN PHEA ROT", "MORNH SYPHAIK",
        "Y EM CHENDA", "CHEA SOCHEAT", "LEY LIMENGLY", "TENGKIT",
        "Prek Tararoth", "Van Ravuth", "IENG YATH", "Heng Lun",
        "Leakhena", "Ly Khy", "Tann herseang", "Keo Pich Piden",
        "VANN SOMONEA", "Chea Dana", "Un Nima", "HONG KUNTHEA",
        "KEO SOTHEA", "KIM VANDETH", "PHAY SOPHORSS", "SOEUR KEOPISEY",
        "KEV CHHENGLEANG", "MEAS MOLIKATOEUNG", "NICHKHOM LICHA", "CHEM TYTY",
        "MOEUN SEYHA", "NOUM PAOPUTHIDARA", "PHY SOKVANNARY", "LACH PHOUMARITH",
        "CHHEN VANYUTH", "PHATT CHHEALIN", "CHAN SREYTOCH", "KUN SREYNARA",
        "MESHDoung Vicheth", "Bav Oeurn", "Ngin Bora", "KHEAN VATHANAVITOU",
        "VANNA HOR", "Sopha Rathana", "SOVAN TYTY", "LOEM SIEUHOEU",
        "NG SONHENG", "SOK SOKUNTHEA", "ROLIV KOSOL", "NUON NGUN",
        "HONGKEOUN THEARAKORN", "MUNINT", "SOEM SARIFA", "HOEUY CHHUNEII",
        "JEVIN LAURON", "KHAN CHANSOVAN", "N NARITH", "ELSIE M. PRADO",
        "DK TEST", "DV TEST", "PHAT SREYENG", "HANG KIMHAK",
        "LORN SOKLY", "THIM CHHAN CHHAIN", "CHHORM VANTOEURN",
        "ROEUN SREYREP", "DKPATRECIA", "MAY GERBON", "JENELYN GELVEZON",
        "SEANG BONA", "HANG CHANRA", "POV PENG", "LONGTESTING",
        "POV PONNASIN", "SREYMOM", "GERSON STA ANA", "KHOEURN RATANAK",
        "LIEM MARASIN", "KAKADAPHON SAVY", "AIEN PUTHY", "YOU VEASNA",
        "Roeurn sokkheang", "JB Bernabe", "SORN SREYSAM", "VANN TINA",
        "CHREN SOVANRACHANA", "THONG KUNTHY", "SOT THARY", "REACH SREYMEY",
        "YANG KAKADA", "DORN DONG", "CHANN PISEY",
        "CHHUN PANHALA", "Y SENGDANA", "ROEURN CHHORK", "YEANG TEY"
    ];

    // DOM elements with null checks
    const elements = {
        employeeNameSelect: document.getElementById('employeeNameSelect'),
        employeeNameInput: document.getElementById('employeeNameInput'),
        selectNameBtn: document.getElementById('selectNameBtn'),
        userNameDisplay: document.getElementById('userName'),
        checkInBtn: document.getElementById('checkInBtn'),
        breakBtn: document.getElementById('breakBtn'),
        resumeBtn: document.getElementById('resumeBtn'),
        checkOutBtn: document.getElementById('checkOutBtn'),
        checkInTimeDisplay: document.getElementById('checkInTime'),
        breakStartTimeDisplay: document.getElementById('breakStartTime'),
        breakEndTimeDisplay: document.getElementById('breakEndTime'),
        checkOutTimeDisplay: document.getElementById('checkOutTime'),
        totalWorkTimeDisplay: document.getElementById('totalWorkTime'),
        totalBreakTimeDisplay: document.getElementById('totalBreakTime'),
        netWorkTimeDisplay: document.getElementById('netWorkTime'),
        recordsTableBody: document.getElementById('recordsTableBody'),
        employeeLogs: document.getElementById('employeeLogs'),
        recordsSearch: document.getElementById('recordsSearch'),
        logsSearch: document.getElementById('logsSearch')
    };

    // Check for missing elements
    const missingElements = Object.keys(elements).filter(key => !elements[key]);
    if (missingElements.length) {
        console.error('Missing DOM elements:', missingElements);
        alert('Error: Missing page elements. Check HTML structure.');
        return;
    }

    // Data structure
    let currentEmployeeName = null;
    let currentSession = null;

    // Populate dropdown
    predefinedEmployeeNames.sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        elements.employeeNameSelect.appendChild(option);
    });

    // Helper functions
    const formatTime = (timestamp) => {
        if (!timestamp) return '--:--:--';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '--:--:--';
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        } catch (e) {
            console.error('Error formatting time:', e);
            return '--:--:--';
        }
    };

    const formatDuration = (milliseconds) => {
        if (milliseconds < 0 || isNaN(milliseconds)) milliseconds = 0;
        try {
            const totalSeconds = Math.floor(milliseconds / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            let result = '';
            if (hours > 0) result += `${hours} hr${hours !== 1 ? 's' : ''} `;
            result += `${minutes} min${minutes !== 1 ? 's' : ''}`;
            return result.trim() || '0 min';
        } catch (e) {
            console.error('Error formatting duration:', e);
            return '0 min';
        }
    };

    const SERVER_URL = 'http://192.168.90.24:5000'; // Updated to match server

    const sendToServer = async (name, action, time) => {
        try {
            const response = await fetch(`${SERVER_URL}/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, checkInTime: time, action })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error');
            }
            const result = await response.json();
            console.log(result.message);
        } catch (e) {
            console.error(`Error sending ${action} to server:`, e);
            throw new Error(`Failed to record ${action}: ${e.message}`);
        }
    };

    const fetchRecords = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/records`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error');
            }
            return await response.json();
        } catch (e) {
            console.error('Error fetching records:', e);
            throw new Error('Failed to load records: ' + e.message);
        }
    };

    const renderEmployeeLogs = async () => {
        elements.employeeLogs.innerHTML = '';
        const searchTerm = elements.logsSearch.value.trim().toLowerCase();
        let logsToDisplay = [];

        try {
            const records = await fetchRecords();
            logsToDisplay = records
                .filter(record => !searchTerm || record.Name.toLowerCase().includes(searchTerm))
                .map(record => ({
                    timestamp: new Date(record.Timestamp).getTime(),
                    message: `${record.Timestamp}: ${record.Name} - ${record.Action} at ${record.Time}` // MODIFIED: Added record.Name
                }));

            if (!logsToDisplay.length) {
                elements.employeeLogs.innerHTML = '<p class="no-logs">No logs available.</p>';
                return;
            }

            logsToDisplay.sort((a, b) => b.timestamp - a.timestamp).forEach(log => {
                const li = document.createElement('li');
                li.textContent = log.message;
                elements.employeeLogs.appendChild(li);
            });
        } catch (e) {
            console.error('Error rendering logs:', e);
            elements.employeeLogs.innerHTML = '<p class="no-logs">Error loading logs: ' + e.message + '</p>';
        }
    };

    const resetCurrentSessionUI = () => {
        elements.checkInTimeDisplay.textContent = '--:--:--';
        elements.breakStartTimeDisplay.textContent = '--:--:--';
        elements.breakEndTimeDisplay.textContent = '--:--:--';
        elements.checkOutTimeDisplay.textContent = '--:--:--';
        elements.totalWorkTimeDisplay.textContent = '0 hours 0 minutes';
        elements.totalBreakTimeDisplay.textContent = '0 minutes';
        elements.netWorkTimeDisplay.textContent = '0 hours 0 minutes';
    };

    const updateCurrentSessionUI = (session) => {
        if (!session) {
            resetCurrentSessionUI();
            return;
        }
        try {
            elements.checkInTimeDisplay.textContent = formatTime(session.checkInTimestamp);
            elements.breakStartTimeDisplay.textContent = formatTime(session.breakStartTimestamp);
            elements.breakEndTimeDisplay.textContent = formatTime(session.lastBreakEndTimestamp);
            elements.checkOutTimeDisplay.textContent = formatTime(session.checkOutTimestamp);
            calculateCurrentResults(session);
        } catch (e) {
            console.error('Error updating session UI:', e);
            resetCurrentSessionUI();
        }
    };

    const updateButtonStates = (session) => {
        const isNameSelected = currentEmployeeName && currentEmployeeName.trim() !== '';
        const hasCheckedIn = session && session.checkInTimestamp;
        const onBreak = session && session.breakStartTimestamp;
        const hasCheckedOut = session && session.checkOutTimestamp;
        console.log('Button State:', { isNameSelected, hasCheckedIn, onBreak, hasCheckedOut });

        elements.selectNameBtn.disabled = !isNameSelected;
        elements.checkInBtn.disabled = !isNameSelected || hasCheckedIn || hasCheckedOut;
        elements.breakBtn.disabled = !hasCheckedIn || onBreak || hasCheckedOut;
        elements.resumeBtn.disabled = !onBreak;
        elements.resumeBtn.style.display = onBreak ? 'inline-block' : 'none';
        elements.checkOutBtn.disabled = !hasCheckedIn || onBreak || hasCheckedOut;
    };

    const renderAllRecords = async () => {
        elements.recordsTableBody.innerHTML = '';
        const searchTerm = elements.recordsSearch.value.trim().toLowerCase();

        try {
            const records = await fetchRecords();
            const groupedRecords = {};

            records.forEach(record => {
                if (!searchTerm || record.Name.toLowerCase().includes(searchTerm)) {
                    if (!groupedRecords[record.Name]) {
                        groupedRecords[record.Name] = { sessions: [], currentSession: null };
                    }
                    if (record.Action === 'Check In') {
                        groupedRecords[record.Name].currentSession = { 
                            checkInTimestamp: new Date(record.Timestamp).getTime(),
                            totalBreakDuration: 0,
                            breakStartTimestamp: null
                        };
                    } else if (record.Action === 'Start Break') {
                        if (groupedRecords[record.Name].currentSession) {
                            groupedRecords[record.Name].currentSession.breakStartTimestamp = new Date(record.Timestamp).getTime();
                        }
                    } else if (record.Action === 'End Break') {
                        if (groupedRecords[record.Name].currentSession && groupedRecords[record.Name].currentSession.breakStartTimestamp) {
                            const breakEnd = new Date(record.Timestamp).getTime();
                            const breakStart = groupedRecords[record.Name].currentSession.breakStartTimestamp;
                            groupedRecords[record.Name].currentSession.totalBreakDuration += (breakEnd - breakStart);
                            groupedRecords[record.Name].currentSession.breakStartTimestamp = null;
                        }
                    } else if (record.Action === 'Check Out') {
                        if (groupedRecords[record.Name].currentSession) {
                            groupedRecords[record.Name].sessions.push({
                                checkInTimestamp: groupedRecords[record.Name].currentSession.checkInTimestamp,
                                checkOutTimestamp: new Date(record.Timestamp).getTime(),
                                totalBreakDuration: groupedRecords[record.Name].currentSession.totalBreakDuration
                            });
                            groupedRecords[record.Name].currentSession = null;
                        }
                    }
                }
            });

            const hasRecords = Object.keys(groupedRecords).length > 0;
            if (!hasRecords) {
                elements.recordsTableBody.innerHTML = `<tr><td colspan="4" class="no-records">No records found${searchTerm ? ' for "' + searchTerm + '"' : ''}.</td></tr>`;
                return;
            }

            Object.keys(groupedRecords).sort().forEach(name => {
                const data = groupedRecords[name];
                if (data.currentSession && data.currentSession.checkInTimestamp) {
                    const session = data.currentSession;
                    let totalBreak = session.totalBreakDuration || 0;
                    if (session.breakStartTimestamp) totalBreak += (new Date().getTime() - session.breakStartTimestamp);
                    totalBreak = Math.max(0, totalBreak);
                    const row = document.createElement('tr');
                    row.className = 'current-session';
                    row.innerHTML = `
                        <td>${name} <span style="color: #90EE90; font-size: 0.8em;">(Current)</span></td>
                        <td>${formatTime(session.checkInTimestamp)}</td>
                        <td>${formatDuration(totalBreak)}</td>
                        <td>--:--:--</td>
                    `;
                    elements.recordsTableBody.appendChild(row);
                }

                data.sessions.forEach(session => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${name}</td>
                        <td>${formatTime(session.checkInTimestamp)}</td>
                        <td>${formatDuration(session.totalBreakDuration)}</td>
                        <td>${formatTime(session.checkOutTimestamp)}</td>
                    `;
                    elements.recordsTableBody.appendChild(row);
                });
            });
        } catch (e) {
            console.error('Error rendering records:', e);
            elements.recordsTableBody.innerHTML = `<tr><td colspan="4" class="no-records">Error loading records: ${e.message}</td></tr>`;
        }
    };

    const calculateCurrentResults = (session) => {
        try {
            if (!session || !session.checkInTimestamp) {
                elements.totalWorkTimeDisplay.textContent = '0 hours 0 minutes';
                elements.totalBreakTimeDisplay.textContent = '0 minutes';
                elements.netWorkTimeDisplay.textContent = '0 hours 0 minutes';
                return;
            }

            let totalWorkDuration = (session.checkOutTimestamp || new Date().getTime()) - session.checkInTimestamp;
            let totalBreakDuration = session.totalBreakDuration || 0;
            if (session.breakStartTimestamp) totalBreakDuration += (new Date().getTime() - session.breakStartTimestamp);
            totalBreakDuration = Math.max(0, totalBreakDuration);
            const netWorkDuration = Math.max(0, totalWorkDuration - totalBreakDuration);

            elements.totalWorkTimeDisplay.textContent = formatDuration(totalWorkDuration);
            elements.totalBreakTimeDisplay.textContent = formatDuration(totalBreakDuration);
            elements.netWorkTimeDisplay.textContent = formatDuration(netWorkDuration);
        } catch (e) {
            console.error('Error calculating results:', e);
            elements.totalWorkTimeDisplay.textContent = 'Error';
            elements.totalBreakTimeDisplay.textContent = 'Error';
            elements.netWorkTimeDisplay.textContent = 'Error';
        }
    };

    // Event handlers
    const handleSelectEmployee = () => {
        const inputType = document.querySelector('input[name="inputType"]:checked')?.value;
        if (!inputType) {
            alert('Select an input method.');
            return;
        }

        let name = inputType === 'select' ? elements.employeeNameSelect.value : elements.employeeNameInput.value.trim().toUpperCase();
        if (!name) {
            alert('Select or enter an employee name.');
            return;
        }

        currentEmployeeName = name;
        elements.userNameDisplay.textContent = name;
        currentSession = null; // Reset session
        updateCurrentSessionUI(currentSession);
        updateButtonStates(currentSession);
        renderAllRecords();
        renderEmployeeLogs();
    };

    document.querySelectorAll('input[name="inputType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const inputType = radio.value;
            elements.employeeNameSelect.style.display = inputType === 'select' ? 'block' : 'none';
            elements.employeeNameInput.style.display = inputType === 'manual' ? 'block' : 'none';
            elements.selectNameBtn.disabled = inputType === 'select' ? !elements.employeeNameSelect.value : !elements.employeeNameInput.value.trim();
        });
    });

    elements.employeeNameSelect.addEventListener('change', () => {
        elements.selectNameBtn.disabled = !elements.employeeNameSelect.value;
    });

    elements.employeeNameInput.addEventListener('input', () => {
        elements.selectNameBtn.disabled = !elements.employeeNameInput.value.trim();
    });

    let searchTimeout = null;
    const debounceSearch = (callback) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(callback, 300);
    };

    elements.recordsSearch.addEventListener('input', () => debounceSearch(renderAllRecords));
    elements.logsSearch.addEventListener('input', () => debounceSearch(renderEmployeeLogs));

    elements.checkInBtn.addEventListener('click', async () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        if (!currentSession || !currentSession.checkInTimestamp) {
            const now = new Date().getTime();
            currentSession = {
                checkInTimestamp: now,
                breakStartTimestamp: null,
                totalBreakDuration: 0,
                lastBreakEndTimestamp: null,
                checkOutTimestamp: null
            };
            const time = formatTime(now);
            try {
                await sendToServer(currentEmployeeName, 'Check In', time);
                elements.checkInTimeDisplay.textContent = time;
                updateButtonStates(currentSession);
                calculateCurrentResults(currentSession);
                renderAllRecords();
                renderEmployeeLogs();
            } catch (e) {
                alert(e.message);
            }
        }
    });

    elements.breakBtn.addEventListener('click', async () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        if (currentSession && currentSession.checkInTimestamp && !currentSession.breakStartTimestamp && !currentSession.checkOutTimestamp) {
            const now = new Date().getTime();
            currentSession.breakStartTimestamp = now;
            const time = formatTime(now);
            try {
                await sendToServer(currentEmployeeName, 'Start Break', time);
                elements.breakStartTimeDisplay.textContent = time;
                updateButtonStates(currentSession);
                calculateCurrentResults(currentSession);
                renderAllRecords();
            } catch (e) {
                alert(e.message);
            }
        } else {
            alert('Cannot start break. Check employee status.');
        }
    });

    elements.resumeBtn.addEventListener('click', async () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        if (currentSession && currentSession.breakStartTimestamp) {
            const now = new Date().getTime();
            currentSession.lastBreakEndTimestamp = now;
            currentSession.totalBreakDuration += (now - currentSession.breakStartTimestamp);
            currentSession.breakStartTimestamp = null;
            const time = formatTime(now);
            try {
                await sendToServer(currentEmployeeName, 'End Break', time);
                elements.breakEndTimeDisplay.textContent = time;
                updateButtonStates(currentSession);
                calculateCurrentResults(currentSession);
                renderAllRecords();
            } catch (e) {
                alert(e.message);
            }
        } else {
            alert('Not on break.');
        }
    });

    elements.checkOutBtn.addEventListener('click', async () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        if (currentSession && currentSession.breakStartTimestamp) {
            alert('End your break before checking out.');
            return;
        }
        if (currentSession && currentSession.checkInTimestamp && !currentSession.checkOutTimestamp) {
            const now = new Date().getTime();
            currentSession.checkOutTimestamp = now;
            const time = formatTime(now);
            try {
                await sendToServer(currentEmployeeName, 'Check Out', time);
                elements.checkOutTimeDisplay.textContent = time;
                updateButtonStates(currentSession);
                calculateCurrentResults(currentSession);
                renderAllRecords();
                renderEmployeeLogs();
                currentSession = null;
                elements.userNameDisplay.textContent = '-- Not Selected --';
                currentEmployeeName = null;
                elements.employeeNameSelect.value = '';
                elements.employeeNameInput.value = '';
            } catch (e) {
                alert(e.message);
            }
        } else {
            alert('Cannot check out. Check employee status.');
        }
    });

    // Initialization
    try {
        elements.selectNameBtn.addEventListener('click', handleSelectEmployee);
        elements.employeeNameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleSelectEmployee();
        });
        resetCurrentSessionUI();
        updateButtonStates(null);
        elements.userNameDisplay.textContent = '-- Not Selected --';
        renderAllRecords();
        renderEmployeeLogs();
    } catch (e) {
        console.error('Initialization error:', e);
        alert('Error initializing app. Check console and refresh.');
    }
});