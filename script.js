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

    // DOM elements
    const employeeNameSelect = document.getElementById('employeeNameSelect');
    const employeeNameInput = document.getElementById('employeeNameInput');
    const selectNameBtn = document.getElementById('selectNameBtn');
    const userNameDisplay = document.getElementById('userName');
    const checkInBtn = document.getElementById('checkInBtn');
    const breakBtn = document.getElementById('breakBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const checkInTimeDisplay = document.getElementById('checkInTime');
    const breakStartTimeDisplay = document.getElementById('breakStartTime');
    const breakEndTimeDisplay = document.getElementById('breakEndTime');
    const checkOutTimeDisplay = document.getElementById('checkOutTime');
    const totalWorkTimeDisplay = document.getElementById('totalWorkTime');
    const totalBreakTimeDisplay = document.getElementById('totalBreakTime');
    const netWorkTimeDisplay = document.getElementById('netWorkTime');
    const recordsTableBody = document.getElementById('recordsTableBody');
    const employeeLogs = document.getElementById('employeeLogs');
    const recordsSearch = document.getElementById('recordsSearch');
    const logsSearch = document.getElementById('logsSearch');
    const exportBtn = document.getElementById('exportBtn');
    const importInput = document.getElementById('importInput');

    // Verify critical elements
    if (!employeeNameSelect || !employeeNameInput || !recordsTableBody || !employeeLogs || !recordsSearch || !logsSearch || !exportBtn || !importInput) {
        console.error('Critical DOM elements missing.');
        alert('Error: Page elements missing. Check HTML.');
        return;
    }

    // Data structure
    let allEmployeeData = {};
    let currentEmployeeName = null;

    // Sample data for testing
    const initializeSampleData = () => {
        const now = new Date().getTime();
        const yesterday = now - 24 * 60 * 60 * 1000;
        const sampleEmployees = ['MAO SIENGMENG', 'Mary Joy M. Ochinang'];

        sampleEmployees.forEach(name => {
            if (!allEmployeeData[name]) {
                allEmployeeData[name] = {
                    currentSession: null,
                    dailyRecords: [{
                        checkInTimestamp: yesterday,
                        checkOutTimestamp: yesterday + 9 * 60 * 60 * 1000,
                        totalBreakDuration: 15 * 60 * 1000,
                        netWorkDuration: 8.75 * 60 * 60 * 1000
                    }],
                    logs: [
                        { timestamp: yesterday, message: `${formatDate(yesterday)} 08:00:00: Checked in at 08:00:00` },
                        { timestamp: yesterday + 30 * 60 * 1000, message: `${formatDate(yesterday)} 08:30:00: Started break at 08:30:00` },
                        { timestamp: yesterday + 45 * 60 * 1000, message: `${formatDate(yesterday)} 08:45:00: Ended break at 08:45:00` },
                        { timestamp: yesterday + 9 * 60 * 60 * 1000, message: `${formatDate(yesterday)} 17:00:00: Checked out at 17:00:00` }
                    ]
                };
            }
        });
        saveAllData();
        renderAllRecords();
        renderEmployeeLogs();
    };

    // Populate dropdown
    predefinedEmployeeNames.sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        employeeNameSelect.appendChild(option);
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

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Invalid Date';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Invalid Date';
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

    const addLogEntry = (employeeName, message) => {
        if (!employeeName || !message) {
            console.error('Invalid log parameters:', { employeeName, message });
            return;
        }
        if (!allEmployeeData[employeeName]) {
            allEmployeeData[employeeName] = { currentSession: null, dailyRecords: [], logs: [] };
        }
        const timestamp = new Date().getTime();
        allEmployeeData[employeeName].logs.push({
            timestamp,
            message: `${formatDate(timestamp)} ${formatTime(timestamp)}: ${message}`
        });
        saveAllData();
        if (employeeName === currentEmployeeName) renderEmployeeLogs();
    };

    const renderEmployeeLogs = () => {
        employeeLogs.innerHTML = '';
        const searchTerm = logsSearch.value.trim().toLowerCase();
        let logsToDisplay = [];

        try {
            if (searchTerm) {
                Object.keys(allEmployeeData).forEach(name => {
                    if (name.toLowerCase().includes(searchTerm)) {
                        logsToDisplay.push(...(allEmployeeData[name].logs || []));
                    }
                });
            } else if (currentEmployeeName) {
                logsToDisplay = allEmployeeData[currentEmployeeName]?.logs || [];
            }

            if (!logsToDisplay.length) {
                employeeLogs.innerHTML = '<p class="no-logs">No logs available.</p>';
                return;
            }

            logsToDisplay.sort((a, b) => b.timestamp - a.timestamp).forEach(log => {
                const li = document.createElement('li');
                li.textContent = log.message;
                employeeLogs.appendChild(li);
            });
        } catch (e) {
            console.error('Error rendering logs:', e);
            employeeLogs.innerHTML = '<p class="no-logs">Error loading logs.</p>';
        }
    };

    const saveAllData = () => {
        try {
            localStorage.setItem('employeeTimeTrackerAllData', JSON.stringify(allEmployeeData));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            alert('Could not save data. Check localStorage.');
        }
    };

    const loadAllData = () => {
        try {
            const storedData = localStorage.getItem('employeeTimeTrackerAllData');
            if (storedData) {
                allEmployeeData = JSON.parse(storedData);
                Object.keys(allEmployeeData).forEach(name => {
                    if (!allEmployeeData[name].logs) allEmployeeData[name].logs = [];
                    if (!allEmployeeData[name].dailyRecords) allEmployeeData[name].dailyRecords = [];
                    if (!allEmployeeData[name].currentSession) allEmployeeData[name].currentSession = null;
                });
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            alert('Could not load data. LocalStorage may be corrupted.');
            allEmployeeData = {};
        }
    };

    const exportData = () => {
        try {
            const dataStr = JSON.stringify(allEmployeeData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'records.json';
            a.click();
            URL.revokeObjectURL(url);
            alert('Records exported to records.json. Add to GitHub to share.');
        } catch (e) {
            console.error('Error exporting data:', e);
            alert('Failed to export records.');
        }
    };

    const importData = (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    allEmployeeData = JSON.parse(e.target.result);
                    saveAllData();
                    renderAllRecords();
                    renderEmployeeLogs();
                    alert('Records imported successfully.');
                } catch (err) {
                    console.error('Error parsing imported data:', err);
                    alert('Invalid JSON file.');
                }
            };
            reader.readAsText(file);
        } catch (e) {
            console.error('Error importing data:', e);
            alert('Failed to import records.');
        }
    };

    const resetCurrentSessionUI = () => {
        checkInTimeDisplay.textContent = '--:--:--';
        breakStartTimeDisplay.textContent = '--:--:--';
        breakEndTimeDisplay.textContent = '--:--:--';
        checkOutTimeDisplay.textContent = Jekyll and Hyde';
        totalWorkTimeDisplay.textContent = '0 hours 0 minutes';
        totalBreakTimeDisplay.textContent = '0 minutes';
        netWorkTimeDisplay.textContent = '0 hours 0 minutes';
    };

    const updateCurrentSessionUI = (data) => {
        if (!data || !data.currentSession) {
            resetCurrentSessionUI();
            return;
        }
        try {
            const session = data.currentSession;
            checkInTimeDisplay.textContent = formatTime(session.checkInTimestamp);
            breakStartTimeDisplay.textContent = formatTime(session.breakStartTimestamp);
            breakEndTimeDisplay.textContent = formatTime(session.lastBreakEndTimestamp);
            checkOutTimeDisplay.textContent = formatTime(session.checkOutTimestamp);
            calculateCurrentResults(session);
        } catch (e) {
            console.error('Error updating session UI:', e);
            resetCurrentSessionUI();
        }
    };

    const updateButtonStates = (data) => {
        const isNameSelected = currentEmployeeName && currentEmployeeName.trim() !== '';
        const hasCheckedIn = data && data.currentSession && data.currentSession.checkInTimestamp;
        const onBreak = data && data.currentSession && data.currentSession.breakStartTimestamp;
        const hasCheckedOut = data && data.currentSession && data.currentSession.checkOutTimestamp;

        selectNameBtn.disabled = !isNameSelected;
        checkInBtn.disabled = !isNameSelected || hasCheckedIn || hasCheckedOut;
        breakBtn.disabled = !hasCheckedIn || onBreak || hasCheckedOut;
        resumeBtn.disabled = !onBreak;
        resumeBtn.style.display = onBreak ? 'inline-block' : 'none';
        checkOutBtn.disabled = !hasCheckedIn || onBreak || hasCheckedOut;
    };

    const renderAllRecords = () => {
        recordsTableBody.innerHTML = '';
        const searchTerm = recordsSearch.value.trim().toLowerCase();

        try {
            const employeeNamesToDisplay = Object.keys(allEmployeeData)
                .filter(name => !searchTerm || name.toLowerCase().includes(searchTerm))
                .sort();

            const hasRecords = employeeNamesToDisplay.some(name => {
                const data = allEmployeeData[name];
                return (data.dailyRecords && data.dailyRecords.length > 0) || (data.currentSession && data.currentSession.checkInTimestamp);
            });

            if (!hasRecords) {
                recordsTableBody.innerHTML = `<tr><td colspan="4" class="no-records">No records found${searchTerm ? ' for "' + searchTerm + '"' : ''}.</td></tr>`;
                return;
            }

            employeeNamesToDisplay.forEach(name => {
                const employeeData = allEmployeeData[name];
                if (!employeeData || (!employeeData.dailyRecords.length && (!employeeData.currentSession || !employeeData.currentSession.checkInTimestamp))) return;

                if (employeeData.currentSession && employeeData.currentSession.checkInTimestamp && !employeeData.currentSession.checkOutTimestamp) {
                    const session = employeeData.currentSession;
                    let totalBreak = session.totalBreakDuration || 0;
                    if (session.breakStartTimestamp) totalBreak += (new Date().getTime() - session.breakStartTimestamp);
                    totalBreak = Math.max(0, totalBreak);
                    const row = document.createElement('tr');
                    row.className = 'current-session';
                    row.innerHTML = `
                        <td>${name} <span style="color: #90EE90; font-size: 0.8em;">(Current)</span></td>
                        <td>${formatTime(session.checkInTimestamp)}</td>
                        <td>${formatDuration(totalBreak)}</td>
                        <td>${formatTime(session.checkOutTimestamp)}</td>
                    `;
                    recordsTableBody.appendChild(row);
                }

                employeeData.dailyRecords.sort((a, b) => (b.checkInTimestamp || 0) - (a.checkInTimestamp || 0)).forEach(day => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${name}</td>
                        <td>${formatTime(day.checkInTimestamp)}</td>
                        <td>${formatDuration(day.totalBreakDuration)}</td>
                        <td>${formatTime(day.checkOutTimestamp)}</td>
                    `;
                    recordsTableBody.appendChild(row);
                });
            });
        } catch (e) {
            console.error('Error rendering records:', e);
            recordsTableBody.innerHTML = `<tr><td colspan="4" class="no-records">Error loading records.</td></tr>`;
        }
    };

    const calculateCurrentResults = (sessionData) => {
        try {
            if (!sessionData || !sessionData.checkInTimestamp) {
                totalWorkTimeDisplay.textContent = '0 hours 0 minutes';
                totalBreakTimeDisplay.textContent = '0 minutes';
                netWorkTimeDisplay.textContent = '0 hours 0 minutes';
                return;
            }

            let totalWorkDuration = (sessionData.checkOutTimestamp || new Date().getTime()) - sessionData.checkInTimestamp;
            let totalBreakDuration = sessionData.totalBreakDuration || 0;
            if (sessionData.breakStartTimestamp) totalBreakDuration += (new Date().getTime() - sessionData.breakStartTimestamp);
            totalBreakDuration = Math.max(0, totalBreakDuration);
            const netWorkDuration = Math.max(0, totalWorkDuration - totalBreakDuration);

            totalWorkTimeDisplay.textContent = formatDuration(totalWorkDuration);
            totalBreakTimeDisplay.textContent = formatDuration(totalBreakDuration);
            netWorkTimeDisplay.textContent = formatDuration(netWorkDuration);
        } catch (e) {
            console.error('Error calculating results:', e);
            totalWorkTimeDisplay.textContent = 'Error';
            totalBreakTimeDisplay.textContent = 'Error';
            netWorkTimeDisplay.textContent = 'Error';
        }
    };

    // Event handlers
    const handleSelectEmployee = () => {
        const inputType = document.querySelector('input[name="inputType"]:checked')?.value;
        if (!inputType) {
            alert('Select an input method.');
            return;
        }

        let name = inputType === 'select' ? employeeNameSelect.value : employeeNameInput.value.trim().toUpperCase();
        if (!name) {
            alert('Select or enter an employee name.');
            return;
        }

        currentEmployeeName = name;
        userNameDisplay.textContent = name;
        localStorage.setItem('lastSelectedEmployeeManual', name);

        if (!allEmployeeData[name]) allEmployeeData[name] = { currentSession: null, dailyRecords: [], logs: [] };
        addLogEntry(name, `Selected ${name} at ${formatTime(new Date().getTime())}`);
        updateCurrentSessionUI(allEmployeeData[name]);
        updateButtonStates(allEmployeeData[name]);
        renderAllRecords();
        renderEmployeeLogs();
    };

    document.querySelectorAll('input[name="inputType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const inputType = radio.value;
            employeeNameSelect.style.display = inputType === 'select' ? 'block' : 'none';
            employeeNameInput.style.display = inputType === 'manual' ? 'block' : 'none';
            selectNameBtn.disabled = inputType === 'select' ? !employeeNameSelect.value : !employeeNameInput.value.trim();
        });
    });

    employeeNameSelect.addEventListener('change', () => {
        selectNameBtn.disabled = !employeeNameSelect.value;
    });

    employeeNameInput.addEventListener('input', () => {
        selectNameBtn.disabled = !employeeNameInput.value.trim();
    });

    let searchTimeout = null;
    const debounceSearch = (callback) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(callback, 300);
    };

    recordsSearch.addEventListener('input', () => debounceSearch(renderAllRecords));
    logsSearch.addEventListener('input', () => debounceSearch(renderEmployeeLogs));

    checkInBtn.addEventListener('click', () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        const data = allEmployeeData[currentEmployeeName];
        if (!data.currentSession || !data.currentSession.checkInTimestamp) {
            const now = new Date().getTime();
            data.currentSession = {
                checkInTimestamp: now,
                breakStartTimestamp: null,
                totalBreakDuration: 0,
                lastBreakEndTimestamp: null,
                checkOutTimestamp: null
            };
            checkInTimeDisplay.textContent = formatTime(now);
            addLogEntry(currentEmployeeName, `Checked in at ${formatTime(now)}`);
            saveAllData();
            updateButtonStates(data);
            calculateCurrentResults(data.currentSession);
            renderAllRecords();
        }
    });

    breakBtn.addEventListener('click', () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        const data = allEmployeeData[currentEmployeeName];
        const session = data.currentSession;
        if (session && session.checkInTimestamp && !session.breakStartTimestamp && !session.checkOutTimestamp) {
            const now = new Date().getTime();
            session.breakStartTimestamp = now;
            breakStartTimeDisplay.textContent = formatTime(now);
            addLogEntry(currentEmployeeName, `Started break at ${formatTime(now)}`);
            saveAllData();
            updateButtonStates(data);
        } else {
            alert('Cannot start break. Check employee status.');
        }
    });

    resumeBtn.addEventListener('click', () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        const data = allEmployeeData[currentEmployeeName];
        const session = data.currentSession;
        if (session && session.breakStartTimestamp) {
            const now = new Date().getTime();
            session.lastBreakEndTimestamp = now;
            session.totalBreakDuration += (now - session.breakStartTimestamp);
            session.breakStartTimestamp = null;
            breakEndTimeDisplay.textContent = formatTime(now);
            addLogEntry(currentEmployeeName, `Ended break at ${formatTime(now)}`);
            saveAllData();
            updateButtonStates(data);
            calculateCurrentResults(session);
        } else {
            alert('Not on break.');
        }
    });

    checkOutBtn.addEventListener('click', () => {
        if (!currentEmployeeName) {
            alert('Select an employee first.');
            return;
        }
        const data = allEmployeeData[currentEmployeeName];
        const session = data.currentSession;
        if (session && session.breakStartTimestamp) {
            alert('End your break before checking out.');
            return;
        }
        if (session && session.checkInTimestamp && !session.checkOutTimestamp) {
            const now = new Date().getTime();
            session.checkOutTimestamp = now;
            const totalWork = now - session.checkInTimestamp;
            const netWork = totalWork - (session.totalBreakDuration || 0);
            data.dailyRecords.push({
                checkInTimestamp: session.checkInTimestamp,
                checkOutTimestamp: now,
                totalBreakDuration: session.totalBreakDuration || 0,
                netWorkDuration: netWork
            });
            addLogEntry(currentEmployeeName, `Checked out at ${formatTime(now)}`);
            data.currentSession = null;
            checkOutTimeDisplay.textContent = formatTime(now);
            saveAllData();
            calculateCurrentResults(null);
            updateButtonStates(data);
            renderAllRecords();
            renderEmployeeLogs();
            userNameDisplay.textContent = '-- Not Selected --';
            currentEmployeeName = null;
            employeeNameSelect.value = '';
            employeeNameInput.value = '';
        } else {
            alert('Cannot check out. Check employee status.');
        }
    });

    exportBtn.addEventListener('click', exportData);
    importInput.addEventListener('change', importData);

    // Initialization
    loadAllData();
    initializeSampleData();
    selectNameBtn.addEventListener('click', handleSelectEmployee);
    employeeNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleSelectEmployee();
    });

    const lastSelectedName = localStorage.getItem('lastSelectedEmployeeManual');
    if (lastSelectedName) {
        if (predefinedEmployeeNames.includes(lastSelectedName)) {
            employeeNameSelect.value = lastSelectedName;
        } else {
            employeeNameInput.value = lastSelectedName;
            document.querySelector('input[name="inputType"][value="manual"]').checked = true;
            employeeNameSelect.style.display = 'none';
            employeeNameInput.style.display = 'block';
        }
        handleSelectEmployee();
    } else {
        resetCurrentSessionUI();
        updateButtonStates(null);
        userNameDisplay.textContent = '-- Not Selected --';
        renderEmployeeLogs();
    }

    setInterval(() => {
        if (currentEmployeeName && allEmployeeData[currentEmployeeName]?.currentSession?.checkInTimestamp && !allEmployeeData[currentEmployeeName]?.currentSession?.checkOutTimestamp) {
            calculateCurrentResults(allEmployeeData[currentEmployeeName].currentSession);
            renderAllRecords();
        }
    }, 1000);
});