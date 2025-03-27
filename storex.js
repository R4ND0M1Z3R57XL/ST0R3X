const apiUrl = "http://localhost:3000"; // Replace with your server's URL
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

    fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => {
            if (response.ok) {
                alert("Sign-up successful! You can now log in.");
                showLoginForm();
            } else {
                alert("Username already exists. Please choose another one.");
            }
        })
        .catch((error) => console.error("Error signing up:", error));
}

// Login Function
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        alert('Please enter your username and password.');
        return;
    }

    fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    currentUser = username;
                    localStorage.setItem('currentUser', currentUser);
                    files = data.files || [];
                    displayFiles();
                    switchToMainApp();
                });
            } else {
                alert("Invalid username or password.");
            }
        })
        .catch((error) => console.error("Error logging in:", error));
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    files = [];
    switchToLoginForm();
}

// Upload Files
function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = fileInput.files;

    if (selectedFiles.length === 0) {
        addNotification('Please select files to upload.');
        return;
    }

    const formData = new FormData();
    [...selectedFiles].forEach((file) => {
        formData.append("files", file);
    });

    fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: {
            "username": currentUser,
        },
        body: formData,
    })
        .then((response) => {
            if (response.ok) {
                alert('Files uploaded successfully!');
                loadUserFiles();
            } else {
                alert('Error uploading files.');
            }
        })
        .catch((error) => console.error("Error uploading files:", error));
}

// Load User Files
function loadUserFiles() {
    fetch(`${apiUrl}/files/${currentUser}`)
        .then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    files = data || [];
                    displayFiles();
                });
            } else {
                alert("Error loading files.");
            }
        })
        .catch((error) => console.error("Error loading files:", error));
}

// Save User Files
function saveFiles() {
    fetch(`${apiUrl}/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: currentUser, files }),
    })
        .then((response) => {
            if (response.ok) {
                addNotification('Files saved successfully!');
            } else {
                alert('Error saving files.');
            }
        })
        .catch((error) => console.error("Error saving files:", error));
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
        clear: clearNotifications,
    };
    actions[action]?.();
}

// Add Notifications
function addNotification(message) {
    const notifications = document.getElementById('notifications');
    notifications.innerHTML += `<p>${message}</p>`;
}

// Clear Notifications
function clearNotifications() {
    document.getElementById('notifications').innerHTML = '';
}

// Open File
function openFile(url) {
    window.open(url, "_blank");
}

// Check Logged-In User
window.onload = function () {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        loadUserFiles();
        switchToMainApp();
    } else {
        showSignupForm();
    }
};
