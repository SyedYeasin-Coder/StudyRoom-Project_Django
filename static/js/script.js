const dropdownMenu = document.querySelector(".dropdown-menu");
const dropdownButton = document.querySelector(".dropdown-button");

if (dropdownButton) {
  dropdownButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("show");
  });
}

// Upload Image
const photoInput = document.querySelector("#avatar");
const photoPreview = document.querySelector("#preview-avatar");
if (photoInput)
  photoInput.onchange = () => {
    const [file] = photoInput.files;
    if (file) {
      photoPreview.src = URL.createObjectURL(file);
    }
  };

// Scroll to Bottom
const conversationThread = document.querySelector(".room__box");
if (conversationThread) conversationThread.scrollTop = conversationThread.scrollHeight;

// Open the avatar modal popup
function openAvatarModal() {
  document.getElementById("avatarModal").style.display = "flex"; // Centered display
}

function closeAvatarModal() {
  const modal = document.getElementById('avatarModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", function () {
  closeAvatarModal();
});

function previewAvatar(event) {
  const reader = new FileReader();
  reader.onload = function () {
    const avatarImage = document.getElementById('avatarImage');
    avatarImage.src = reader.result;
  }
  reader.readAsDataURL(event.target.files[0]);
}

function toggleDescription() {
  const DescriptionElement = document.getElementById("description");
  const toggledescription = document.getElementById("toggledescription");
  // For Description 
  if (DescriptionElement.classList.contains("short-text")) {
    DescriptionElement.classList.remove("short-text");
    toggledescription.innerText = "Show Less";
  } else {
    DescriptionElement.classList.add("short-text");
    toggledescription.innerText = "Show More";
  }
}
function toggleMessage(messageId) {
  const messageElement = document.getElementById(messageId);
  const toggleMessageLink = document.getElementById(`toggle_${messageId}`);

  // For Messages
  if (messageElement.classList.contains("short-text")) {
    messageElement.classList.remove("short-text");
    toggleMessageLink.innerText = "Show Less";
  } else {
    messageElement.classList.add("short-text");
    toggleMessageLink.innerText = "Show More";
  }
}

const colorThemeMenu = document.querySelector(".color-theme-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

colorThemeMenu.addEventListener("click", () => {
  colorThemeMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
})


const LTtheme = document.querySelector(".LT");
const DTtheme = document.querySelector(".DT");

const LTClasses = ["LT-1", "LT-2", "LT-3", "LT-4", "LT-5"];
const DTClasses = ["DT-1", "DT-2", "DT-3", "DT-4", "DT-5"];


function applyTheme(theme, themeList) {
  document.body.classList.remove(...LTClasses, ...DTClasses);
  document.body.classList.add(theme); // Add new theme
  localStorage.setItem("theme", theme); // Store in localStorage
}

// Function to get the next theme in the cycle
function getNextTheme(currentTheme, themeList) {
  let currentIndex = themeList.indexOf(currentTheme);
  return themeList[(currentIndex + 1) % themeList.length]; // Cycle through themes
}

// Load theme from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme, LTClasses.includes(savedTheme) ? LTClasses : DTClasses);
  }
});

// Event listeners for theme switching
LTtheme.addEventListener("click", () => {
  let currentTheme = document.body.classList.value.match(/LT-\d+/)?.[0] || "LT-0";
  let newTheme = getNextTheme(currentTheme, LTClasses);
  applyTheme(newTheme, LTClasses);
});

DTtheme.addEventListener("click", () => {
  let currentTheme = document.body.classList.value.match(/DT-\d+/)?.[0] || "DT-0";
  let newTheme = getNextTheme(currentTheme, DTClasses);
  applyTheme(newTheme, DTClasses);
});

function previewFile(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('fileName').innerText = `Selected file: ${file.name}`;
  }
}


let selectedFiles = [];

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const fileHolder = document.querySelector(".fileInput-holder");
  const messageInput = document.getElementById("messageInput");
  const messageForm = document.getElementById("messageForm");

  // Attach event listener for Enter key
  messageInput.addEventListener("keydown", handleEnter);

  function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    let formData = new FormData(messageForm);
    formData.append("body", messageInput.value);

    // Append selected files
    selectedFiles.forEach(file => {
      formData.append("file", file);
    });

    // Disable input while sending
    messageInput.disabled = true;

    fetch(messageForm.action, {
      method: "POST",
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          window.location.reload(); // Refresh page on success
        } else {
          console.log("Error in sending message");
          messageInput.disabled = false; // Re-enable input on error
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
        messageInput.disabled = false;
      });
  }

  fileInput.addEventListener("change", function (event) {
    handleFileSelect(event.target.files);
  });

  function handleFileSelect(files) {
    if (files.length === 0) return;
    fileHolder.style.display = "flex";

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      if (selectedFiles.some(f => f.name === file.name)) continue;
      selectedFiles.push(file);

      let fileContainer = document.createElement("div");
      fileContainer.classList.add("EachInput");

      let removeButton = document.createElement("div");
      removeButton.classList.add("fileUpload-remove");
      removeButton.innerHTML = `<svg class="actionBarIcon" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z"></path><path fill="currentColor" fill-rule="evenodd" d="M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" clip-rule="evenodd"></path></svg>`;

      let editButton = document.createElement("div");
      editButton.classList.add("fileUpload-edit");
      editButton.innerHTML = `<svg class="editIcon" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2 17.25V21h3.75l11.06-11.06-3.75-3.75L2 17.25ZM22.41 5.34l-3.75-3.75a1.5 1.5 0 0 0-2.12 0L14.4 3.73l5.66 5.66 2.34-2.34a1.5 1.5 0 0 0 0-2.12Z"></path></svg>`;

      let fileName = document.createElement("p");
      fileName.classList.add("fileUpload-name");
      fileName.textContent = file.name;

      let filePreview = document.createElement("img");
      filePreview.classList.add("fileUpload-img");

      let fileType = file.type;
      let fileExtension = file.name.split(".").pop().toLowerCase();

      let imageTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png", "image/svg+xml"];

      if (imageTypes.includes(fileType)) {
        let reader = new FileReader();
        reader.onload = function (e) {
          filePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        let staticUrl = "/static/images/icons/";
        let fileIcons = {
          "pdf": staticUrl + "pdf_icon.png",
          "docx": staticUrl + "docx_icon.png",
          "xlsx": staticUrl + "xlsx_icon.png",
          "txt": staticUrl + "txt_icon.png",
          "py": staticUrl + "py_icon.png",
          "c": staticUrl + "c_icon.png",
          "cpp": staticUrl + "cpp_icon.png",
          "js": staticUrl + "js_icon.png",
          "html": staticUrl + "html_icon.png",
          "css": staticUrl + "css_icon.png",
          "zip": staticUrl + "zip_icon.png",
          "mp3": staticUrl + "mp3_icon.png",
          "mp4": staticUrl + "mp4_icon.png"
        };

        filePreview.src = fileIcons[fileExtension] || staticUrl + "default_file_icon.png";
      }

      removeButton.addEventListener("click", function () {
        fileContainer.remove();
        // Remove file from selectedFiles using name matching
        selectedFiles = selectedFiles.filter(f => f.name !== file.name);

        // **Ensure file input updates properly**
        let dataTransfer = new DataTransfer();
        selectedFiles.forEach(f => dataTransfer.items.add(f));
        fileInput.files = dataTransfer.files;  // Reassign updated list

        // Hide file holder if no files remain
        if (selectedFiles.length === 0) {
          fileInput.value = "";
          fileHolder.style.display = "none";
        }
      });

      editButton.addEventListener("click", function () {
        openEditModal(fileName, file);
      });


      fileContainer.appendChild(filePreview);
      fileContainer.appendChild(fileName);
      fileContainer.appendChild(removeButton);
      fileContainer.appendChild(editButton);
      fileHolder.appendChild(fileContainer);
    }
  }
  document.querySelectorAll(".thread__edit").forEach(edit => {
    edit.addEventListener("click", function () {
      const messageId = edit.getAttribute("data-message-id");
      const messageElement = document.getElementById(messageId); // Get the actual message element

      if (!messageElement) {
        console.error("Message element not found!");
        return;
      }

      const messageText = messageElement.textContent.trim();
      openEditModal(null, null, messageId, messageText); // Pass only message-related params
    });
  });
});

function openEditModal(fileNameElement, fileObj = null, messageId = null, messageText = null) {
  const modal = document.getElementById("editFileModal");
  const input = document.getElementById("editFileNameInput");
  const saveButton = document.getElementById("saveFileName");
  const cancelButton = document.getElementById("cancelEditButton");

  // Check if editing a file or a text message
  if (fileObj) {
    input.value = fileNameElement.textContent.split(".").slice(0, -1).join(".");
    modal.querySelector(".layout__boxHeader").textContent = "Edit File Name";
    modal.setAttribute("data-message-id", "");
  } else if (messageId && messageText) {
    input.value = messageText.trim();
    modal.querySelector(".layout__boxHeader").textContent = "Edit Message";
    modal.setAttribute("data-message-id", messageId);
  } else {
    console.error("Invalid parameters for openEditModal");
    return;
  }

  // Open modal
  modal.style.display = "flex";

  // ✅ Remove old event listeners safely and add new one
  saveButton.replaceWith(saveButton.cloneNode(true)); // Ensure fresh button
  const newSaveButton = document.getElementById("saveFileName");

  newSaveButton.addEventListener("click", function (event) {
    event.preventDefault();
    const updatedText = input.value.trim();
    const storedMessageId = modal.getAttribute("data-message-id");

    if (!updatedText) {
      alert("Message cannot be empty!");
      return;
    }

    if (fileObj) {
      saveFileName(fileNameElement, updatedText, fileObj);
    } else if (storedMessageId) {
      console.log("Saving message:", storedMessageId, updatedText);
      saveMessage(storedMessageId, updatedText);
      console.log("Message saved!");
    }
  });

  // ✅ Cancel button event listener (already works)
  cancelButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeEditModal();
  });
}




window.closeEditModal = function () {
  document.getElementById("editFileModal").style.display = "none";
};

function saveFileName(fileNameElement, newName, fileObj) {
  if (newName.trim() !== "") {
    let fileExtension = fileObj.name.split(".").pop(); // Keep original extension
    let renamedFile = new File([fileObj], newName + "." + fileExtension, { type: fileObj.type });

    // Replace file reference in selectedFiles
    let index = selectedFiles.findIndex(f => f.name === fileObj.name);
    if (index !== -1) {
      selectedFiles[index] = renamedFile;
    }

    // Fully reset fileInput.files
    let dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files; // Reassign updated file list

    // Update UI
    fileNameElement.textContent = newName + "." + fileExtension;

    // **Ensure fileHolder is accessible**
    const fileHolder = document.querySelector(".fileInput-holder");

    // **Update remove button event listener**
    let fileContainer = fileNameElement.closest(".EachInput");
    let removeButton = fileContainer.querySelector(".fileUpload-remove");

    if (removeButton) {
      removeButton.replaceWith(removeButton.cloneNode(true)); // Remove old listener
      let newRemoveButton = fileContainer.querySelector(".fileUpload-remove");

      newRemoveButton.addEventListener("click", function () {
        fileContainer.remove();

        // Remove file from selectedFiles using updated reference
        selectedFiles = selectedFiles.filter(f => f.name !== renamedFile.name);

        // Ensure file input updates properly
        let dataTransfer = new DataTransfer();
        selectedFiles.forEach(f => dataTransfer.items.add(f));
        fileInput.files = dataTransfer.files; // Reassign updated list

        // **Fix: Check if fileHolder is available before accessing it**
        if (selectedFiles.length === 0) {
          fileInput.value = "";
          if (fileHolder) {
            fileHolder.style.display = "none";
          }
        }
      });
    }
  }
  closeEditModal();
}
function saveMessage(messageId, newText) {
  fetch(`/edit-message/${messageId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken()
    },
    body: JSON.stringify({ new_text: newText })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
          messageElement.textContent = newText;
        } else {
          console.error(`Message element with ID ${messageId} not found!`);
        }
        closeEditModal();
      } else {
        console.error("Failed to update message:", data.error);
      }
    })
    .catch(error => console.error("Error:", error));
}

function getCSRFToken() {
  const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
  return csrfTokenInput ? csrfTokenInput.value : "";
}

window.onload = function () {
  var audioElements = document.getElementsByClassName('audioPlayer');
  var videoElements = document.getElementsByClassName('videoPlayer');

  Array.from(audioElements).forEach(function(audioElement) {
    var parentContainer = audioElement.closest('.message__file');
    if (parentContainer) {
      parentContainer.classList.add('message__file--audio');
    }
  });
  Array.from(videoElements).forEach(function(videoElement) {
    var parentContainer = videoElement.closest('.message__file');
    if (parentContainer) {
      parentContainer.classList.add('message__file--video');
    }
  });
};
