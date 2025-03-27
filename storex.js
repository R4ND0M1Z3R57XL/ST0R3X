let files = [];
let currentUser = null;

// Sign-Up Function
function signUp() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!username || !password) {
        alert('Please enter a valid username and password.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username]) {
        alert('Username already exists. Please choose another one.');
        return;
    }

    users[username] = { password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sign-up successful! You can now log in.');
    showLoginForm();
}

// Login Function
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        alert('Please enter your username and password.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (!users[username] || users[username].password !== password) {
        alert('Invalid username or password.');
        return;
    }

    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    loadUserFiles();
    switchToMainApp();
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    files = [];
    switchToLoginForm();
}

// Show Sign-Up Form
function showSignupForm() {
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
}

// Show Login Form
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
}

// Switch to Main App
function switchToMainApp() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('logoutButton').classList.remove('hidden');
    document.getElementById('displayUsername').textContent = currentUser;
}

// Switch to Login Form
function switchToLoginForm() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('logoutButton').classList.add('hidden');
}

// Load User Files
function loadUserFiles() {
    const savedFiles = localStorage.getItem(`${currentUser}_files`);
    if (savedFiles) {
        files = JSON.parse(savedFiles);
    }
    displayFiles();
}

// Save User Files
function saveFiles() {
    if (currentUser) {
        localStorage.setItem(`${currentUser}_files`, JSON.stringify(files));
        addNotification('Files saved successfully!');
    }
}

// Upload Files
function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = fileInput.files;

    if (selectedFiles.length === 0) {
        addNotification('Please select files to upload.');
        return;
    }

    [...selectedFiles].forEach(file => {
        files.push({
            name: file.name,
            size: file.size,
            date: new Date(),
            url: URL.createObjectURL(file)
        });
    });
    displayFiles();
    addNotification('Files uploaded successfully!');
}

// Display Files
function displayFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = files.map((file, index) => `
        <div>
            <input type="checkbox" id="file-${index}">
            <span>${file.name} - ${file.size} bytes</span>
            <button onclick="openFile('${file.url}')">Open</button>
        </div>
    `).join('');
}

// Perform Actions
function performAction() {
    const action = document.getElementById('actionDropdown').value;
    if (!action) {
        addNotification('Please select an action.');
        return;
    }
    const actions = {
        delete: deleteSelectedFiles,
        export: exportSelectedFiles,
        rename: renameFile,
        clear: clearNotifications
    };
    actions[action]?.();
}

// Delete Files
function deleteSelectedFiles() {
    const selected = getSelectedIndexes();
    files = files.filter((_, i) => !selected.includes(i));
    displayFiles();
    addNotification('Selected files deleted.');
}

// Export Files
function exportSelectedFiles() {
    getSelectedIndexes().forEach(i => {
        const file = files[i];
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
    });
    addNotification('Selected files exported.');
}

// Rename File
function renameFile() {
    const selected = getSelectedIndexes();
    if (selected.length !== 1) {
        addNotification('Please select exactly one file to rename.');
        return;
    }
    const index = selected[0];
    const newName = prompt('Enter the new name for the file:', files[index].name);
    if (newName) {
        files[index].name = newName;
        displayFiles();
        addNotification(`File renamed to ${newName}.`);
    }
}

// Get Selected Indexes
function getSelectedIndexes() {
    const checkboxes = document.querySelectorAll("#fileList input[type='checkbox']");
    return [...checkboxes]
        .map((checkbox, index) => checkbox.checked ? index : null)
        .filter(index => index !== null);
}

// Sort Files
function sortFiles(criteria) {
    if (criteria === "name") {
        files.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === "size") {
        files.sort((a, b) => a.size - b.size);
    } else if (criteria === "date") {
        files.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    displayFiles();
    addNotification(`Files sorted by ${criteria}.`);
}

// Open File
function openFile(url) {
    window.open(url, "_blank");
}

// Add Notifications
function addNotification(message) {
    const notifications = document.getElementById("notifications");
    notifications.innerHTML += `<p>${message}</p>`;
}

// Clear Notifications
function clearNotifications() {
    document.getElementById("notifications").innerHTML = '';
}

// Check for Logged-In User on Page Load
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        loadUserFiles();
        switchToMainApp();
    } else {
        showSignupForm();
    }
};