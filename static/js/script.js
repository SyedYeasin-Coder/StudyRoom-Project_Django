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
  document.getElementById("avatarModal").style.display = "none";
}
// Prevent modal from being shown on page load
document.addEventListener("DOMContentLoaded", function () {
  closeAvatarModal(); // Hide modal initially
});
// Preview the uploaded avatar image
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

