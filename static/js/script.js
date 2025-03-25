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
  document.getElementById("avatarModal").style.display = "flex"; 
}

function closeAvatarModal() {
  const modal = document.getElementById('avatarModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
function saveAvatar() {
  const avatarInput = document.getElementById('avatarInput').files[0];
  if (!avatarInput) return;

  const formData = new FormData();
  formData.append('avatar', avatarInput);

  const updateAvatarUrl = document.getElementById("avatarModal").getAttribute("data-url");

  fetch(updateAvatarUrl, {
    method: "POST",
    headers: {
      'X-CSRFToken': '{{ csrf_token }}'  
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
        document.getElementById("avatarImage").src = data.avatar_url;
        closeAvatarModal();
        window.location.reload();
      } else {
        console.error(data.error);
      }
  })
  .catch(error => console.error("Error:", error));
}


if(document.getElementById('avatarModal')){
  closeAvatarModal();
}

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
  let audioContext, analyser, animationFrame;
  let dataArray;
  let bufferLength;
  let mediaRecorder;
  let audioChunks = [];
  let audioBlob;
  let stream;
  const micButton = document.getElementById("micButton");
  const audioContainer = document.getElementById("audioContainer");
  const audioPreview = document.getElementById("audioPreview");
  const audioDataInput = document.getElementById("audioData");
  const removeAudio = document.getElementById("removeAudio");
  const canvas = document.getElementById("audioVisualizer");
  const ctx = canvas.getContext("2d");
  function updateCanvasColor() {
    return getComputedStyle(document.body).getPropertyValue("--color-main").trim();
  }

  const observer = new MutationObserver(() => {
    updateCanvasColor();
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  if (micButton) {
    micButton.addEventListener("click", async function () {
      if (!mediaRecorder || mediaRecorder.state === "inactive") {

        audioContainer.style.display = "block";
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioContext = new AudioContext();
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        function draw() {
          animationFrame = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = updateCanvasColor();

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillRect(i * 3, canvas.height - barHeight, 2, barHeight);
          }
        }

        draw();

        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          cancelAnimationFrame(animationFrame);
          stream.getTracks().forEach(track => track.stop());
          audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          audioPreview.src = audioUrl;
          audioPreview.style.display = "block";

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            audioDataInput.value = reader.result;
          };
          micButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="m0 0h24v24h-24z" opacity="0" />
                      <g>
                      <path d="m12 15a4 4 0 0 0 4-4v-5a4 4 0 0 0 -8 0v5a4 4 0 0 0 4 4z" />
                      <path d="m19 11a1 1 0 0 0 -2 0 5 5 0 0 1 -10 0 1 1 0 0 0 -2 0 7 7 0 0 0 6 6.92v2.08h-2.11a.89.89 0 0 0 -.89.89v.22a.89.89 0 0 0 .89.89h6.22a.89.89 0 0 0 .89-.89v-.22a.89.89 0 0 0 -.89-.89h-2.11v-2.08a7 7 0 0 0 6-6.92z" />
                      </g>
                    </svg>`;
        };
        mediaRecorder.start();
        micButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="36" height="36" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet">
    <title>microphone-mute-line</title>
    <path d="M30,17h-2c0,1.8-0.5,3.5-1.4,5l1.5,1.5C29.3,21.5,29.9,19.3,30,17z" class="clr-i-outline clr-i-outline-path-1"/><path d="M18,4c2.8,0,5,2.2,5,5v8c0,0.4-0.1,0.8-0.2,1.2l1.6,1.6c0.4-0.9,0.6-1.8,0.6-2.8V9c0-3.9-3.2-7-7.1-6.9   c-2.9,0-5.6,1.9-6.5,4.7L13,8.3C13.5,5.9,15.6,4.2,18,4z" class="clr-i-outline clr-i-outline-path-2"/><path d="M25.2,26.6l6.9,6.9l1.4-1.4L4,2.6L2.6,4l8.4,8.4V17c0,3.9,3.1,7,7,7c1.3,0,2.5-0.3,3.6-1l2.2,2.2C22.1,26.4,20.1,27,18,27   c-5.4,0.2-9.8-4.1-10-9.4c0-0.2,0-0.4,0-0.6H6c0.1,6.2,4.8,11.4,11,12v3h-3c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1   s-0.4-1-1-1h-3v-3C21.2,28.8,23.4,28,25.2,26.6z M13.8,19.7C13.3,18.9,13,18,13,17v-2.6l7.1,7.1C17.9,22.5,15.2,21.8,13.8,19.7z" class="clr-i-outline clr-i-outline-path-3"/>
    <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
</svg>`;
        audioChunks = [];
      } else {
        mediaRecorder.stop();
      }
    });
  }

  function removeRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    audioContainer.style.display = "none";
    audioPreview.src = "";
    audioDataInput.value = "";
    audioBlob = null;

    micButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="m0 0h24v24h-24z" opacity="0" />
                      <g>
                      <path d="m12 15a4 4 0 0 0 4-4v-5a4 4 0 0 0 -8 0v5a4 4 0 0 0 4 4z" />
                      <path d="m19 11a1 1 0 0 0 -2 0 5 5 0 0 1 -10 0 1 1 0 0 0 -2 0 7 7 0 0 0 6 6.92v2.08h-2.11a.89.89 0 0 0 -.89.89v.22a.89.89 0 0 0 .89.89h6.22a.89.89 0 0 0 .89-.89v-.22a.89.89 0 0 0 -.89-.89h-2.11v-2.08a7 7 0 0 0 6-6.92z" />
                      </g>
                    </svg>`;
  }


  if (removeAudio) {
    removeAudio.addEventListener("click", removeRecording);
  }



  if (messageInput) {
    messageInput.addEventListener("keydown", handleEnter);
  }

  function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(); 
    }
  }

  function sendMessage() {
    const csrfToken = getCSRFToken(); 
    let formData = new FormData(messageForm);

    if (messageInput.value.trim()) {
      formData.append("body", messageInput.value);
    }

    selectedFiles.forEach(file => {
      formData.append("file", file);
    });

    if (audioBlob) {
      formData.append("audio_file", audioBlob, "recording.wav");
    }

    messageInput.disabled = true;

    fetch(messageForm.action, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          window.location.reload(); 
        } else {
          console.log("Error in sending message");
          messageInput.disabled = false;
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
        messageInput.disabled = false;
      });
  }



  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      handleFileSelect(event.target.files);
    });
  }

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
        selectedFiles = selectedFiles.filter(f => f.name !== file.name);
        let dataTransfer = new DataTransfer();
        selectedFiles.forEach(f => dataTransfer.items.add(f));
        fileInput.files = dataTransfer.files; 

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
      const messageElement = document.getElementById(messageId); 

      if (!messageElement) {
        console.error("Message element not found!");
        return;
      }
      const messageText = messageElement.textContent.trim();
      openEditModal(null, null, messageId, messageText);
    });
  });
});

function openEditModal(fileNameElement, fileObj = null, messageId = null, messageText = null) {
  const modal = document.getElementById("editFileModal");
  const input = document.getElementById("editFileNameInput");
  const saveButton = document.getElementById("saveFileName");
  const cancelButton = document.getElementById("cancelEditButton");

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

  modal.style.display = "flex";

  saveButton.replaceWith(saveButton.cloneNode(true));
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
    let fileExtension = fileObj.name.split(".").pop(); 
    let renamedFile = new File([fileObj], newName + "." + fileExtension, { type: fileObj.type });

    let index = selectedFiles.findIndex(f => f.name === fileObj.name);
    if (index !== -1) {
      selectedFiles[index] = renamedFile;
    }

    let dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
    fileNameElement.textContent = newName + "." + fileExtension;
    const fileHolder = document.querySelector(".fileInput-holder");
    let fileContainer = fileNameElement.closest(".EachInput");
    let removeButton = fileContainer.querySelector(".fileUpload-remove");

    if (removeButton) {
      removeButton.replaceWith(removeButton.cloneNode(true)); 
      let newRemoveButton = fileContainer.querySelector(".fileUpload-remove");

      newRemoveButton.addEventListener("click", function () {
        fileContainer.remove();
        selectedFiles = selectedFiles.filter(f => f.name !== renamedFile.name);
        let dataTransfer = new DataTransfer();
        selectedFiles.forEach(f => dataTransfer.items.add(f));
        fileInput.files = dataTransfer.files; 
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

  Array.from(audioElements).forEach(function (audioElement) {
    var parentContainer = audioElement.closest('.message__file');
    if (parentContainer) {
      parentContainer.classList.add('message__file--audio');
    }
  });
  Array.from(videoElements).forEach(function (videoElement) {
    var parentContainer = videoElement.closest('.message__file');
    if (parentContainer) {
      parentContainer.classList.add('message__file--video');
    }
  });
};

function changePage(pageNumber) {
  fetch(`?page=${pageNumber}`)
    .then((response) => response.text())
    .then((html) => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");
      document.querySelector(".room-slider").innerHTML = doc.querySelector(".room-slider").innerHTML;
      document.querySelector(".pagination").innerHTML = doc.querySelector(".pagination").innerHTML;
    })
    .catch((error) => console.error("Error fetching page:", error));
}

function openSettingsModal() {
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettingsModal() {
  document.getElementById("settingsModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  window.onclick = function (event) {
    const modal = document.getElementById("settingsModal");
    if (event.target === modal) {
      closeSettingsModal();
    }
  };
  const settingsButton = document.querySelector(".dropdown-link");
  if (settingsButton) {
    settingsButton.addEventListener("click", function (event) {
      event.preventDefault();
      openSettingsModal();
    });
  }
  document.getElementById("settingsModal").style.display = "none";
});


