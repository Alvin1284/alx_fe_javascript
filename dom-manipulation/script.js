// Array to store quotes with text and category
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Wisdom" }
];

// Server configuration for syncing
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // Sync every 30 seconds
let syncInterval = null;

// Function to show notification to user
function showNotification(message, type = 'info') {
  const notification = document.getElementById('syncNotification');
  notification.textContent = message;
  notification.style.display = 'block';
  
  // Set color based on type
  switch(type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      notification.style.color = 'white';
      break;
    case 'warning':
      notification.style.backgroundColor = '#ff9800';
      notification.style.color = 'white';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
      notification.style.color = 'white';
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Function to fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    showNotification('Fetching quotes from server...', 'info');
    
    const response = await fetch(SERVER_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch from server');
    }
    
    const data = await response.json();
    
    // Transform server data to quote format (simulating real data)
    // Using first 5 posts from JSONPlaceholder as simulated quotes
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server',
      id: post.id,
      serverTimestamp: Date.now()
    }));
    
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching from server:', error);
    showNotification('Failed to fetch from server: ' + error.message, 'error');
    return [];
  }
}

// Function to post quotes to server
async function postQuotesToServer(quotesToPost) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quotes: quotesToPost,
        timestamp: Date.now()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to post to server');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting to server:', error);
    showNotification('Failed to post to server: ' + error.message, 'error');
    return null;
  }
}

// Function to resolve conflicts between local and server data
function resolveConflicts(localQuotes, serverQuotes) {
  const conflicts = [];
  const mergedQuotes = [...localQuotes];
  
  // Check for new quotes from server
  serverQuotes.forEach(serverQuote => {
    const existsLocally = localQuotes.some(localQuote => 
      localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
    );
    
    if (!existsLocally) {
      mergedQuotes.push(serverQuote);
      conflicts.push({
        type: 'new',
        quote: serverQuote
      });
    }
  });
  
  return {
    mergedQuotes,
    conflicts,
    hasConflicts: conflicts.length > 0
  };
}

// Main sync function
async function syncQuotes() {
  try {
    showNotification('Syncing with server...', 'info');
    
    // Fetch quotes from server
    const serverQuotes = await fetchQuotesFromServer();
    
    if (serverQuotes.length === 0) {
      showNotification('No data received from server', 'warning');
      return;
    }
    
    // Get local quotes
    const localQuotes = [...quotes];
    
    // Resolve conflicts (server data takes precedence)
    const { mergedQuotes, conflicts, hasConflicts } = resolveConflicts(localQuotes, serverQuotes);
    
    // Update local quotes with merged data
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    
    // Post updated quotes back to server
    await postQuotesToServer(quotes);
    
    // Notify user
    if (hasConflicts) {
      showNotification(
        `Quotes synced with server! ${conflicts.length} new quote(s) added from server.`,
        'success'
      );
      
      // Log conflicts for debugging
      console.log('Conflicts resolved:', conflicts);
    } else {
      showNotification('Quotes synced with server! No new updates from server.', 'success');
    }
    
    // Update last sync time
    localStorage.setItem('lastSyncTime', Date.now().toString());
    
    // Refresh display
    filterQuotes();
    
  } catch (error) {
    console.error('Sync error:', error);
    showNotification('Sync failed: ' + error.message, 'error');
  }
}

// Function to start periodic syncing
function startPeriodicSync() {
  // Clear any existing interval
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Set up periodic sync
  syncInterval = setInterval(() => {
    console.log('Performing periodic sync...');
    syncQuotes();
  }, SYNC_INTERVAL);
  
  console.log(`Periodic sync started (every ${SYNC_INTERVAL / 1000} seconds)`);
}

// Function to stop periodic syncing
function stopPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Periodic sync stopped');
  }
}

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Extract unique categories from quotes array
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected filter from local storage
  const lastSelectedCategory = localStorage.getItem('selectedCategory');
  if (lastSelectedCategory) {
    categoryFilter.value = lastSelectedCategory;
  }
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  
  // Save selected category to local storage
  localStorage.setItem('selectedCategory', selectedCategory);
  
  // Filter quotes or show all
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);
  
  // Display filtered quotes
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p style="color: #999;">No quotes available for this category.</p>';
    return;
  }
  
  // Display a random quote from filtered results
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p style="font-size: 18px; font-style: italic; margin: 20px 0;">
      "${randomQuote.text}"
    </p>
    <p style="font-weight: bold; color: #555;">
      Category: ${randomQuote.category}
    </p>
  `;
  
  // Store the last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to display a random quote
function showRandomQuote() {
  // Use filterQuotes to respect the current category filter
  filterQuotes();
}

// Function to add a new quote
function addQuote() {
  // Get input values
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validate inputs
  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both a quote and a category!');
    return;
  }
  
  // Create new quote object and add to array
  const newQuote = {
    text: newQuoteText,
    category: newQuoteCategory
  };
  
  quotes.push(newQuote);
  
  // Save quotes to local storage
  saveQuotes();
  
  // Update categories dropdown (in case new category was added)
  populateCategories();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Show confirmation message
  alert('Quote added successfully!');
  
  // Optionally display the newly added quote
  showRandomQuote();
}

// Function to create add quote form dynamically (for advanced DOM manipulation)
function createAddQuoteForm() {
  // Check if form already exists to avoid duplicates
  const existingForm = document.getElementById('addQuoteForm');
  if (existingForm) {
    return;
  }
  
  // Create form container
  const formDiv = document.createElement('div');
  formDiv.id = 'addQuoteForm';
  formDiv.style.marginTop = '30px';
  formDiv.style.padding = '20px';
  formDiv.style.border = '1px solid #ccc';
  formDiv.style.borderRadius = '5px';
  formDiv.style.backgroundColor = '#f9f9f9';
  
  // Create heading
  const heading = document.createElement('h3');
  heading.textContent = 'Add Your Own Quote';
  formDiv.appendChild(heading);
  
  // Create quote text input
  const quoteInput = document.createElement('input');
  quoteInput.id = 'dynamicQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';
  quoteInput.style.width = '100%';
  quoteInput.style.padding = '10px';
  quoteInput.style.marginBottom = '10px';
  quoteInput.style.boxSizing = 'border-box';
  formDiv.appendChild(quoteInput);
  
  // Create category input
  const categoryInput = document.createElement('input');
  categoryInput.id = 'dynamicQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';
  categoryInput.style.width = '100%';
  categoryInput.style.padding = '10px';
  categoryInput.style.marginBottom = '10px';
  categoryInput.style.boxSizing = 'border-box';
  formDiv.appendChild(categoryInput);
  
  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Add Quote';
  submitButton.style.padding = '10px 20px';
  submitButton.style.backgroundColor = '#4CAF50';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '3px';
  submitButton.style.cursor = 'pointer';
  
  // Add click event listener
  submitButton.addEventListener('click', function() {
    const quoteText = document.getElementById('dynamicQuoteText').value.trim();
    const quoteCategory = document.getElementById('dynamicQuoteCategory').value.trim();
    
    if (quoteText === '' || quoteCategory === '') {
      alert('Please enter both a quote and a category!');
      return;
    }
    
    // Add quote to array
    quotes.push({
      text: quoteText,
      category: quoteCategory
    });
    
    // Save quotes to local storage
    saveQuotes();
    
    // Update categories dropdown (in case new category was added)
    populateCategories();
    
    // Clear inputs
    document.getElementById('dynamicQuoteText').value = '';
    document.getElementById('dynamicQuoteCategory').value = '';
    
    // Show success message
    alert('Quote added successfully!');
    
    // Display the new quote
    showRandomQuote();
  });
  
  formDiv.appendChild(submitButton);
  
  // Append form to body
  document.body.appendChild(formDiv);
}

// Function to export quotes to JSON file
function exportToJsonFile() {
  // Convert quotes array to JSON string
  const jsonData = JSON.stringify(quotes, null, 2);
  
  // Create a Blob from the JSON data
  const blob = new Blob([jsonData], { type: 'application/json' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Quotes exported successfully!');
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      
      // Validate that imported data is an array
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid file format. Expected an array of quotes.');
        return;
      }
      
      // Validate that each quote has required properties
      const isValid = importedQuotes.every(quote => 
        quote.hasOwnProperty('text') && quote.hasOwnProperty('category')
      );
      
      if (!isValid) {
        alert('Invalid quote format. Each quote must have "text" and "category" properties.');
        return;
      }
      
      // Add imported quotes to existing quotes
      quotes.push(...importedQuotes);
      
      // Save to local storage
      saveQuotes();
      
      // Update categories dropdown with any new categories
      populateCategories();
      
      alert('Quotes imported successfully!');
      
      // Display a random quote to show the import worked
      showRandomQuote();
    } catch (error) {
      alert('Error parsing JSON file: ' + error.message);
    }
  };
  
  fileReader.readAsText(event.target.files[0]);
}

// Event listener for the "Show New Quote" button
document.addEventListener('DOMContentLoaded', function() {
  // Load quotes from local storage on initialization
  loadQuotes();
  
  // Populate categories dropdown
  populateCategories();
  
  // Add event listener to the new quote button
  const newQuoteButton = document.getElementById('newQuote');
  newQuoteButton.addEventListener('click', showRandomQuote);
  
  // Check if there's a last viewed quote in session storage
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  const lastSelectedCategory = localStorage.getItem('selectedCategory');
  
  if (lastViewedQuote && lastSelectedCategory) {
    // Display the last viewed quote from the session
    const quote = JSON.parse(lastViewedQuote);
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
      <p style="font-size: 18px; font-style: italic; margin: 20px 0;">
        "${quote.text}"
      </p>
      <p style="font-weight: bold; color: #555;">
        Category: ${quote.category}
      </p>
      <p style="font-size: 12px; color: #999;">
        (Last viewed quote from this session)
      </p>
    `;
  } else {
    // Display an initial quote based on filter when the page loads
    filterQuotes();
  }
  
  // Initialize server sync
  // Perform initial sync after a short delay
  setTimeout(() => {
    syncQuotes();
  }, 2000);
  
  // Start periodic syncing
  startPeriodicSync();
  
  // Show last sync time if available
  const lastSyncTime = localStorage.getItem('lastSyncTime');
  if (lastSyncTime) {
    const timeSinceSync = Math.floor((Date.now() - parseInt(lastSyncTime)) / 1000);
    console.log(`Last sync was ${timeSinceSync} seconds ago`);
  }
  
  // Optional: Uncomment the line below to create the form dynamically
  // createAddQuoteForm();
});
